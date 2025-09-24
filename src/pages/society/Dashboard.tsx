import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Plus, BarChart3, Clock, MapPin } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import EventCard from '@/components/EventCard';
import EventModal from '@/components/EventModal';

interface Event {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string; // UUID
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  image_url?: string;
  rsvp_cutoff?: string | null;
  rsvp?: {
    count: number;
  }[];
  locations?: {
    id: string;
    name: string;
    formatted_address: string;
    latitude: number;
    longitude: number;
    city?: string;
    region?: string;
    country?: string;
  };
  rsvp_cutoff?: string | null;
  attendeeCount?: number;
  isRSVPCutoffPassed?: boolean;
  isRecurring?: boolean;
}

interface Society {
  id: string;
  name: string;
  description: string;
  contact_email: string;
}

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    first_name?: string;
  };
}

// Utility to summarize RRULE (simple version)
function getRecurrenceSummary(rrule: string | null): string {
  if (!rrule) return '';
  // Example: FREQ=WEEKLY;UNTIL=20251231
  const freqMatch = rrule.match(/FREQ=([^;]+)/);
  const untilMatch = rrule.match(/UNTIL=([^;]+)/);
  let summary = '';
  if (freqMatch) {
    summary += `Repeats ${freqMatch[1].toLowerCase()}`;
  }
  if (untilMatch) {
    const untilDate = untilMatch[1];
    // Format YYYYMMDD to readable date
    if (/^\d{8}$/.test(untilDate)) {
      const y = untilDate.slice(0,4), m = untilDate.slice(4,6), d = untilDate.slice(6,8);
      summary += ` until ${d}/${m}/${y}`;
    } else {
      summary += ` until ${untilDate}`;
    }
  }
  return summary || 'Recurring';
}

// Extend Event type locally to include recurrenceRule and upcomingOccurrences
interface DashboardEvent extends Event {
  recurrenceRule?: string | null;
  upcomingOccurrences: Array<{
    start_time: string;
    end_time?: string;
    attendeeCount: number;
  }>;
}

export default function SocietyDashboard() {
  const navigate = useNavigate();
  const [society, setSociety] = useState<Society | null>(null);
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Track expanded occurrences for each event
  const [expandedOccurrences, setExpandedOccurrences] = useState<{[eventId: string]: boolean}>({});

  const checkAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login/society');
        return;
      }
      setUser(user as User);
      await Promise.all([fetchSociety(user.email), fetchSocietyEvents(user.email)]);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/login/society');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchSociety = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('society')
        .select('*')
        .eq('contact_email', email)
        .single();

      if (error) {
        console.error('Society not found:', error);
        // Create a default society entry if one doesn't exist
        const { data: newSociety, error: createError } = await supabase
          .from('society')
          .insert([{
            contact_email: email,
            name: user?.user_metadata?.full_name || 'Your Society',
            description: 'Welcome to your society dashboard. Please update your information.',
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating society:', createError);
          // Still continue with a default society object
          setSociety({
            id: 'temp',
            name: user?.user_metadata?.full_name || 'Your Society',
            description: 'Welcome to your society dashboard. Please update your information.',
            contact_email: email
          });
        } else {
          setSociety(newSociety);
        }
        return;
      }
      setSociety(data);
    } catch (error) {
      console.error('Error fetching society:', error);
      // Create a default society object instead of redirecting
      setSociety({
        id: 'temp',
        name: user?.user_metadata?.full_name || 'Your Society',
        description: 'Welcome to your society dashboard. Please update your information.',
        contact_email: email
      });
    }
  };

  const fetchSocietyEvents = async (email: string) => {
    try {
      // Get society ID
      const { data: societyData, error: societyError } = await supabase
        .from('society')
        .select('id')
        .eq('contact_email', email)
        .single();
      if (societyError) throw societyError;

      // Fetch events from unified API (with RRULE expansion)
      const response = await fetch(`/api/unified?resource=events&action=society&societyId=${societyData.id}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const eventsData = await response.json();

      // Fetch RSVPs for these events
      const eventIds = eventsData.map((event: any) => event.id);
      const { data: allRsvps, error: rsvpsError } = await supabase
        .from('rsvp')
        .select('*')
        .in('event_id', eventIds);
      let rsvpCounts: any[] = [];
      if (!rsvpsError && allRsvps) {
        rsvpCounts = allRsvps;
      }

      // Count RSVPs per event occurrence
      const rsvpCountMap = new Map();
      if (rsvpCounts) {
        rsvpCounts.forEach((rsvp: any) => {
          const key = rsvp.event_id + '___' + (rsvp.occurrence_start_time || '');
          rsvpCountMap.set(key, (rsvpCountMap.get(key) || 0) + 1);
        });
      }

      // Only show parent events for recurring events, with attached upcoming occurrences
      const dashboardEvents = eventsData.map((event: any) => {
        // Only mark as recurring if RRULE is present AND there is more than one occurrence
        const isRecurring = !!event.rrule && Array.isArray(event.occurrences) && event.occurrences.length > 1;
        if (Array.isArray(event.occurrences) && event.occurrences.length > 0) {
          // Get next 3 upcoming occurrences
          const upcomingOccurrences = event.occurrences
            .filter((occ: any) => new Date(occ.start_time) >= new Date())
            .slice(0, 3)
            .map((occ: any) => {
              const key = event.id + '___' + occ.start_time;
              return {
                start_time: occ.start_time,
                end_time: occ.end_time,
                attendeeCount: Number(rsvpCountMap.get(key)) || 0,
              };
            });
          return {
            ...event,
            eventName: event.name,
            date: event.start_time,
            attendeeCount: Number(rsvpCountMap.get(event.id + '___' + event.start_time)) || 0,
            rsvp_cutoff: event.rsvp_cutoff || null,
            isRSVPCutoffPassed: event.rsvp_cutoff ? new Date(event.rsvp_cutoff) < new Date() : false,
            parentEventId: null,
            isRecurring,
            recurrenceRule: event.rrule || null,
            upcomingOccurrences,
          };
        } else {
          const key = event.id + '___' + event.start_time;
          return {
            ...event,
            eventName: event.name,
            date: event.start_time,
            attendeeCount: Number(rsvpCountMap.get(key)) || 0,
            rsvp_cutoff: event.rsvp_cutoff || null,
            isRSVPCutoffPassed: event.rsvp_cutoff ? new Date(event.rsvp_cutoff) < new Date() : false,
            parentEventId: null,
            isRecurring: false,
            recurrenceRule: event.rrule || null,
            upcomingOccurrences: [],
          };
        }
      });

      setEvents(dashboardEvents);
      console.log('Dashboard events:', dashboardEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getEventStats = () => {
    const approved = events.filter(e => e.status === 'approved').length;
    const pending = events.filter(e => e.status === 'pending').length;
    const totalRSVPs = events.reduce((sum, event) =>
      sum + (event.rsvp?.[0]?.count || 0), 0
    );

    return { approved, pending, totalRSVPs, total: events.length };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <LoadingSpinner variant="page" size="lg" text="Loading your society dashboard..." />
      </div>
    );
  }

  const stats = getEventStats();

  const selectedEvent = selectedEventId
    ? (() => {
      const e = events.find(ev => ev.id === selectedEventId);
      if (!e) return null;
      return {
        ...e,
        eventName: e.name,
        organiserID: '',
        societyName: society?.name || '',
        date: e.start_time && !isNaN(Date.parse(e.start_time)) ? new Date(e.start_time).toISOString() : new Date().toISOString(),
        endTime: e.end_time && !isNaN(Date.parse(e.end_time)) ? new Date(e.end_time).toISOString() : new Date().toISOString(),
        location: e.location,
        description: e.description,
        attendeeCount: (e as any).attendee_count || 0,
        requiresOrganizerSignup: false,
        organizerEmail: society?.contact_email || '',
        signup_link: (e as any).signup_link || '',
        status: e.status,
      };
    })()
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {society?.name || 'Society'} Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your events, track RSVPs, and engage with your community.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-blue-200 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="border-purple-200 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total RSVPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalRSVPs}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="border-pink-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-pink-600">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => navigate('/society/submit-event')}
                  className="w-full justify-start text-pink-600 border-pink-300"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2 text-pink-500" />
                  Submit New Event
                </Button>
                <Button
                  onClick={() => navigate('/society/events')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                  Manage Events
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BarChart3 className="w-4 h-4 mr-2 text-purple-500" />
                  View Public Events
                </Button>
              </CardContent>
            </Card>

            {/* Society Info */}
            <Card className="mt-6 border-green-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-green-600">Society Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Name</p>
                    <p className="text-sm text-gray-600">{society?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-600">{society?.contact_email}</p>
                  </div>
                  {society?.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Description</p>
                      <p className="text-sm text-gray-600">{society.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events */}
          <div className="lg:col-span-2">
            <Card className="border-pink-200 shadow-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-pink-600">Recent Events</CardTitle>
                    <CardDescription>Your latest event submissions</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate('/society/events')}
                    variant="outline"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No events submitted yet</p>
                    <Button onClick={() => navigate('/society/submit-event')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Submit Your First Event
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.slice(0, 6).map((ev) => {
                      // Check RSVP cutoff
                      const isRSVPCutoffPassed = ev.rsvp_cutoff && new Date(ev.rsvp_cutoff) < new Date();
                      const isExpanded = expandedOccurrences[ev.id] || false;
                      // For recurring events, use next upcoming occurrence for RSVP count and location
                      let attendeeCount = ev.attendeeCount || 0;
                      let locations = ev.locations;
                      if (ev.isRecurring && ev.upcomingOccurrences && ev.upcomingOccurrences.length > 0) {
                        attendeeCount = ev.upcomingOccurrences[0].attendeeCount;
                        // If location is per occurrence, set here (otherwise keep event.locations)
                        // locations = ev.upcomingOccurrences[0].locations || ev.locations;
                      }
                      return (
                        <div key={ev.id} className="relative">
                          <EventCard
                            event={{
                              ...ev,
                              eventName: ev.name,
                              date: ev.start_time && !isNaN(Date.parse(ev.start_time)) ? new Date(ev.start_time).toISOString() : new Date().toISOString(),
                              endTime: ev.end_time && !isNaN(Date.parse(ev.end_time)) ? new Date(ev.end_time).toISOString() : new Date().toISOString(),
                              location: ev.location,
                              description: ev.description,
                              societyName: society?.name || '',
                              attendeeCount,
                              organiserID: '',
                              requiresOrganizerSignup: false,
                              organizerEmail: society?.contact_email || '',
                              signup_link: (ev as any).signup_link || '',
                              status: ev.status,
                              locations,
                              rsvp_cutoff: ev.rsvp_cutoff || null,
                            }}
                            onClick={() => setSelectedEventId(ev.id)}
                            rightAction={
                              <>
                                {ev.isRecurring && (
                                  <div className="flex flex-col items-start mt-1">
                                    <Badge className="bg-blue-100 text-blue-800 mb-1">Recurring</Badge>
                                  </div>
                                )}
                                {getStatusBadge(ev.status)}
                              </>
                            }
                          />
                          {ev.isRecurring && isExpanded && (
                            <div className="bg-gray-50 border rounded p-2 mt-2">
                              <div className="font-semibold text-sm mb-1">Upcoming Occurrences:</div>
                              {ev.upcomingOccurrences.length === 0 ? (
                                <div className="text-xs text-gray-400">No upcoming occurrences</div>
                              ) : (
                                <ul className="text-xs">
                                  {ev.upcomingOccurrences.map((occ, idx) => (
                                    <li key={idx} className="mb-1">
                                      <span className="font-medium">{new Date(occ.start_time).toLocaleString()}</span>
                                      {occ.end_time && ` - ${new Date(occ.end_time).toLocaleString()}`}
                                      <span className="ml-2">RSVPs: {occ.attendeeCount}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {/* Recurrence summary under details */}
                              {ev.isRecurring && (
                                <span className="block text-xs text-gray-500 mt-2 whitespace-normal break-words max-w-[220px]">{getRecurrenceSummary(ev.recurrenceRule)}</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            {selectedEvent && (
              <EventModal
                event={selectedEvent}
                onClose={() => setSelectedEventId(null)}
                isSocietyView={true}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
