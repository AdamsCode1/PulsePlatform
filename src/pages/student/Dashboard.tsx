import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock, Check } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import EventCard from '@/components/EventCard';
import StudentProfileSection from './StudentProfileSection';
import EventModal from '@/components/EventModal';

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  max_attendees: number;
  image_url?: string;
  society: {
    name: string;
  };
  rsvp?: {
    count: number;
  }[];
}

interface RSVP {
  id: string;
  event_id: string;
  event: Event;
  status: 'confirmed' | 'pending' | 'cancelled';
  created_at: string;
}

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    first_name?: string;
  };
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [userRSVPs, setUserRSVPs] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'profile' | 'rsvps'>('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventRSVPCounts, setEventRSVPCounts] = useState<Record<string, number>>({});
  // Fetch and count RSVPs for all events in 'Your Events' (not just user's RSVPs)
  const [yourEventsRSVPCounts, setYourEventsRSVPCounts] = useState<Record<string, number>>({});
  // RSVP count loading state
  const [rsvpCountsLoading, setRsvpCountsLoading] = useState(true);

  const selectedEvent = selectedEventId
    ? (() => {
        const rsvp = userRSVPs.find(r => r.event.id === selectedEventId);
        if (!rsvp) return null;
        const e = rsvp.event;
        return {
          ...e,
          eventName: e.title,
          organiserID: '',
          societyName: e.society?.name || '',
          date: e.start_time && !isNaN(Date.parse(e.start_time)) ? new Date(e.start_time).toISOString() : new Date().toISOString(),
          endTime: e.end_time && !isNaN(Date.parse(e.end_time)) ? new Date(e.end_time).toISOString() : new Date().toISOString(),
          location: e.location,
          description: e.description,
          attendeeCount: e.rsvp?.[0]?.count || 0,
          requiresOrganizerSignup: false,
          organizerEmail: '',
          signup_link: '',
        };
      })()
    : null;

  const checkAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login/student');
        return;
      }
      setUser(user as User);

      // Using user.id find matching record from student table and extract id
      const { data: studentData, error: studentError } = await supabase
        .from('student')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (studentError) {
        console.error('Error fetching student data:', studentError);
        navigate('/login/student');
        return;
      }

      const studentId = studentData?.id;
      // TODO: Remove studentID and change systems to use user ID value instead
      // Roles can be checked by referring to the role table

      await Promise.all([fetchUpcomingEvents(), fetchUserRSVPs(studentId)]);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/login/student');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userRSVPs.length > 0) {
      // Wait for both RSVP and event data to be loaded before counting
      setTimeout(() => {
        refetchEventRSVPCounts();
      }, 0);
    }
  }, [userRSVPs]);

  const fetchUpcomingEvents = async () => {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('event')
        .select('*')
        .eq('status', 'approved')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(6);

      if (eventsError) throw eventsError;
      if (!eventsData || eventsData.length === 0) {
        setUpcomingEvents([]);
        return;
      }

      // Get event IDs
      const eventIds = eventsData.map((event: any) => event.id);
      // Fetch RSVPs for these events (no status filter)
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvp')
        .select('event_id')
        .in('event_id', eventIds);
      if (rsvpError) throw rsvpError;

      // Count RSVPs per event
      const rsvpCountMap: Record<string, number> = {};
      rsvpData?.forEach((rsvp: any) => {
        rsvpCountMap[rsvp.event_id] = (rsvpCountMap[rsvp.event_id] || 0) + 1;
      });

      // Map events with attendeeCount
      const mappedEvents = eventsData.map((event: any) => ({
        ...event,
        attendeeCount: rsvpCountMap[event.id] || 0,
      }));
      setUpcomingEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // FIX: This is not working
  const fetchUserRSVPs = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('rsvp')
        .select(`
          *,
          event:event(
            *,
            society:society(name)
          )
        `)
        .eq('student_id', userId)
        .eq('status', 'attending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserRSVPs(data || []);

    } catch (error) {
      console.error('Error fetching RSVPs:', error);
    }
  };

  // Helper to fetch RSVP count for a single event
  const fetchRSVPCountForEvent = async (eventId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('rsvp')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId);
    if (error) return 0;
    return count ?? 0;
  };

  // Fetch and count RSVPs for each event for attendeeCount
  const refetchEventRSVPCounts = async () => {
    // Use event IDs from userRSVPs (rsvp.event.id)
    const eventIds = userRSVPs.map(rsvp => rsvp.event.id);
    if (eventIds.length === 0) return;
    const { data, error } = await supabase
      .from('rsvp')
      .select('event_id')
      .in('event_id', eventIds);
    if (error) return;
    const countMap: Record<string, number> = {};
    data.forEach((rsvp: any) => {
      countMap[rsvp.event_id] = (countMap[rsvp.event_id] || 0) + 1;
    });
    setEventRSVPCounts(countMap);
  };
  useEffect(() => {
    refetchEventRSVPCounts();
  }, [userRSVPs]);

  // Fetch and count RSVPs for all events in 'Your Events' (not just user's RSVPs)
  useEffect(() => {
    const fetchYourEventsRSVPCounts = async () => {
      const eventIds = userRSVPs.map(rsvp => rsvp.event.id);
      if (eventIds.length === 0) return;
      const { data, error } = await supabase
        .from('rsvp')
        .select('event_id')
        .in('event_id', eventIds);
      if (error) return;
      const countMap: Record<string, number> = {};
      data.forEach((rsvp: any) => {
        countMap[rsvp.event_id] = (countMap[rsvp.event_id] || 0) + 1;
      });
      setYourEventsRSVPCounts(countMap);
    };
    fetchYourEventsRSVPCounts();
  }, [userRSVPs]);

  // Calculate stats for dashboard cards
  const totalEvents = upcomingEvents.length;
  const totalRSVPs = userRSVPs.length;
  const eventsAttended = userRSVPs.filter(rsvp => new Date(rsvp.event.start_time) < new Date()).length;

  // RSVP count logic for dashboard events
  useEffect(() => {
    async function fetchDashboardRSVPCounts() {
      const eventIds = userRSVPs.map(rsvp => rsvp.event.id);
      if (eventIds.length === 0) {
        setEventRSVPCounts({});
        return;
      }
      const { data, error } = await supabase
        .from('rsvp')
        .select('event_id')
        .in('event_id', eventIds);
      if (error) return;
      const countMap: Record<string, number> = {};
      data.forEach((rsvp: any) => {
        countMap[rsvp.event_id] = (countMap[rsvp.event_id] || 0) + 1;
      });
      setEventRSVPCounts(countMap);
    }
    fetchDashboardRSVPCounts();
  }, [userRSVPs]);

  // Helper function for smooth scroll to section (copied from NavBar)
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <LoadingSpinner variant="page" size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.user_metadata?.full_name || user?.user_metadata?.first_name || user?.email || 'Student'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Discover events, manage your RSVPs, and stay connected with university life.
          </p>
        </div>

        {activeSection === 'profile' && <StudentProfileSection />}
        {activeSection === 'rsvps' && (
          <div className="lg:col-span-2">
            {/* Your Events */}
            <Card className="border-pink-200 shadow-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-pink-600">Your Events</CardTitle>
                    <CardDescription>Events you've RSVP'd to</CardDescription>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => navigate('/student/rsvps')}
                    variant="outline"
                    className="text-pink-600 border-pink-300"
                  >
                    Manage RSVPs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {userRSVPs.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">You haven't RSVP'd to any events yet</p>
                    <Button onClick={() => {
                      if (window.location.pathname === '/') {
                        setTimeout(() => {
                          const element = document.getElementById('schedule');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 100);
                      } else {
                        navigate('/');
                        setTimeout(() => {
                          const element = document.getElementById('schedule');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 400);
                      }
                    }} className="bg-pink-500 text-white">Browse Events</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userRSVPs.map((rsvp) => (
                      <EventCard key={rsvp.event.id} event={{
                        ...rsvp.event,
                        eventName: rsvp.event.title,
                        date: rsvp.event.start_time && !isNaN(Date.parse(rsvp.event.start_time)) ? new Date(rsvp.event.start_time).toISOString() : new Date().toISOString(),
                        endTime: rsvp.event.end_time && !isNaN(Date.parse(rsvp.event.end_time)) ? new Date(rsvp.event.end_time).toISOString() : new Date().toISOString(),
                        location: rsvp.event.location,
                        description: rsvp.event.description,
                        societyName: rsvp.event.society.name,
                        attendeeCount: eventRSVPCounts[rsvp.event.id] || 0,
                        organiserID: '',
                        requiresOrganizerSignup: false,
                        organizerEmail: '',
                        signup_link: '',
                      }}
                      onClick={() => setSelectedEventId(rsvp.event.id)}
                      onRSVPChange={async () => {
                        // Refetch RSVP count for this event only
                        const count = await fetchRSVPCountForEvent(rsvp.event.id);
                        setYourEventsRSVPCounts(prev => ({ ...prev, [rsvp.event.id]: count }));
                      }}
                    />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Event Modal */}
            {selectedEvent && (
              <EventModal
                event={selectedEvent}
                onClose={() => setSelectedEventId(null)}
              />
            )}
          </div>
        )}
        {activeSection === 'dashboard' && (
          <>
            <div className="flex flex-col">
              {/* Stats Cards: after main content on small, before on md+ */}
              <div className="order-2 md:order-1 mt-8 md:mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Events Attended (4th on small) */}
                  <Card className="border-green-200 shadow-md order-1 md:order-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center"><Check className="w-5 h-5 mr-2 text-green-500" />Events Attended</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{eventsAttended}</div>
                    </CardContent>
                  </Card>
                  {/* Total RSVPs (5th on small) */}
                  <Card className="border-purple-200 shadow-md order-2 md:order-3">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center"><Users className="w-5 h-5 mr-2 text-purple-500" />Total RSVPs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">{totalRSVPs}</div>
                    </CardContent>
                  </Card>
                  {/* Total Events (6th on small) */}
                  <Card className="border-blue-200 shadow-md order-3 md:order-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center"><Calendar className="w-5 h-5 mr-2 text-blue-500" />Total Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{totalEvents}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Main grid: reorder items on small */}
              <div className="order-1 md:order-2">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Quick Actions + (lg) Your Societies stacked to avoid large blank gap */}
                  <div className="lg:col-span-1 order-3 lg:order-1">
                    <Card className="border-pink-200 shadow-md">
                      <CardHeader>
                        <CardTitle className="text-pink-600">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          onClick={() => navigate('/')}
                          className="w-full justify-start"
                          variant="outline"
                        >
                          <Calendar className="w-4 h-4 mr-2 text-pink-500" />
                          Browse Events
                        </Button>
                        <Button 
                          onClick={() => navigate('/student/rsvps')}
                          className="w-full justify-start"
                          variant="outline"
                        >
                          <Users className="w-4 h-4 mr-2 text-purple-500" />
                          Manage RSVPs
                        </Button>
                        <Button 
                          onClick={() => navigate('/deals')}
                          className="w-full justify-start"
                          variant="outline"
                        >
                          <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                          View Deals
                        </Button>
                        <Button 
                          onClick={() => navigate('/student/profile')}
                          className="w-full justify-start"
                          variant="outline"
                        >
                          <Users className="w-4 h-4 mr-2 text-green-500" />
                          Edit Profile
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Your Societies shown under Quick Actions on large screens to fill the column */}
                    <div className="hidden lg:block mt-8">
                      <Card className="border-green-200 shadow-md">
                        <CardHeader>
                          <CardTitle className="text-green-600">Your Societies</CardTitle>
                          <CardDescription>Societies whose events you've attended or RSVP'd to</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc pl-5 space-y-1">
                            {[...new Set(userRSVPs.map(rsvp => rsvp.event.society.name))].map((socName) => (
                              <li key={socName} className="text-green-700 font-medium">{socName}</li>
                            ))}
                            {userRSVPs.length === 0 && (
                              <li className="text-gray-500">No societies yet</li>
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Your Societies (standalone on small screens only) */}
                  <div className="order-2 lg:hidden">
                    <Card className="border-green-200 shadow-md">
                      <CardHeader>
                        <CardTitle className="text-green-600">Your Societies</CardTitle>
                        <CardDescription>Societies whose events you've attended or RSVP'd to</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1">
                          {[...new Set(userRSVPs.map(rsvp => rsvp.event.society.name))].map((socName) => (
                            <li key={socName} className="text-green-700 font-medium">{socName}</li>
                          ))}
                          {userRSVPs.length === 0 && (
                            <li className="text-gray-500">No societies yet</li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Your Events (now 1st on small, spans 2 cols on lg) */}
                  <div className="lg:col-span-2 order-1 lg:order-2">
                    <Card className="border-pink-200 shadow-md">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-pink-600">Your Events</CardTitle>
                            <CardDescription>Events you've RSVP'd to</CardDescription>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => navigate('/student/rsvps')}
                            variant="outline"
                            className="text-pink-600 border-pink-300"
                          >
                            Manage RSVPs
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {userRSVPs.length === 0 ? (
                          <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">You haven't RSVP'd to any events yet</p>
                            <Button onClick={() => {
                              if (window.location.pathname === '/') {
                                setTimeout(() => {
                                  const element = document.getElementById('schedule');
                                  if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }, 100);
                              } else {
                                navigate('/');
                                setTimeout(() => {
                                  const element = document.getElementById('schedule');
                                  if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }, 400);
                              }
                            }} className="bg-pink-500 text-white">Browse Events</Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {userRSVPs.map((rsvp) => (
                              <EventCard key={rsvp.event.id} event={{
                                ...rsvp.event,
                                eventName: rsvp.event.title,
                                date: rsvp.event.start_time && !isNaN(Date.parse(rsvp.event.start_time)) ? new Date(rsvp.event.start_time).toISOString() : new Date().toISOString(),
                                endTime: rsvp.event.end_time && !isNaN(Date.parse(rsvp.event.end_time)) ? new Date(rsvp.event.end_time).toISOString() : new Date().toISOString(),
                                location: rsvp.event.location,
                                description: rsvp.event.description,
                                societyName: rsvp.event.society.name,
                                attendeeCount: eventRSVPCounts[rsvp.event.id] || 0,
                                organiserID: '',
                                requiresOrganizerSignup: false,
                                organizerEmail: '',
                                signup_link: '',
                              }}
                              onClick={() => setSelectedEventId(rsvp.event.id)} />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    {/* Event Modal for Your Events */}
                    {selectedEvent && (
                      <EventModal
                        event={selectedEvent}
                        onClose={() => setSelectedEventId(null)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
