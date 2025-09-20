import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, X, Check } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import EventCard from '@/components/EventCard';
import EventModal from '@/components/EventModal';

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_attendees: number;
  image_url?: string;
  society: {
    name: string;
  };
  rsvp_cutoff?: string | null; // Add RSVP cutoff
  organiserID: string;
  societyName: string;
  eventName: string;
  endTime?: string;
  attendeeCount?: number;
  requiresOrganizerSignup?: boolean;
  organizerEmail?: string;
  signup_link?: string;
  status?: 'pending' | 'approved' | 'rejected';
  locations?: {
    name: string;
    formatted_address: string;
  };
}

interface RSVP {
  id: string;
  event_id: string;
  event: Event;
  status: 'confirmed' | 'pending' | 'cancelled';
  created_at: string;
}

export default function StudentRSVPs() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rsvps, setRSVPs] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const selectedEvent = selectedEventId
    ? (() => {
      const rsvp = rsvps.find(r => r.event.id === selectedEventId);
      if (!rsvp) return null;
      const e = rsvp.event;
      return {
        ...e,
        eventName: e.name,
        organiserID: '',
        societyName: e.society?.name || '',
        date: e.date && !isNaN(Date.parse(e.date)) ? new Date(e.date).toISOString() : new Date().toISOString(),
        endTime: e.date && !isNaN(Date.parse(e.date)) ? new Date(e.date).toISOString() : new Date().toISOString(),
        location: e.location,
        description: e.description,
        attendeeCount: e.max_attendees || 0,
        requiresOrganizerSignup: false,
        organizerEmail: '',
        signup_link: '',
      };
    })()
    : null;

  // Calculate stats
  const yourTotalRSVPs = rsvps.length;
  const startOfWeek = new Date('2025-08-11T00:00:00Z');
  const endOfWeek = new Date('2025-08-18T00:00:00Z');
  // Events happening this week (from RSVP'd events)
  const eventsThisWeek = rsvps.filter(rsvp => {
    const eventDate = new Date(rsvp.event.date);
    return eventDate >= startOfWeek && eventDate < endOfWeek;
  }).length;

  // Platform-wide RSVP count (async fetch)
  const [platformTotalRSVPs, setPlatformTotalRSVPs] = useState<number | null>(null);
  useEffect(() => {
    const fetchPlatformTotalRSVPs = async () => {
      const { count, error } = await supabase
        .from('rsvp')
        .select('*', { count: 'exact', head: true });
      if (!error) setPlatformTotalRSVPs(count ?? 0);
    };
    fetchPlatformTotalRSVPs();
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login/student');
        return;
      }
      setUser(user);
      // Fetch studentId from student table
      const { data: studentData, error: studentError } = await supabase
        .from('student')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (studentError || !studentData) {
        navigate('/login/student');
        return;
      }
      await fetchUserRSVPs(studentData.id);
    } catch (error) {
      navigate('/login/student');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRSVPs = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('rsvp')
        .select(`
          *,
          event:event(
            *,
            society:society(name),
            locations:location ( id, name, formatted_address )
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRSVPs(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your RSVPs",
        variant: "destructive",
      });
    }
  };

  // RSVP count logic for RSVP page events (same as dashboard)
  const [eventRSVPCounts, setEventRSVPCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    async function fetchRSVPCounts() {
      const eventIds = rsvps.map(rsvp => rsvp.event.id);
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
    fetchRSVPCounts();
  }, [rsvps]);

  // Add this function to refetch RSVP counts after RSVP actions
  const refetchEventRSVPCounts = async () => {
    const eventIds = rsvps.map(rsvp => rsvp.event.id);
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

  const cancelRSVP = async (rsvpId: string) => {
    try {
      const { error } = await supabase
        .from('rsvp')
        .update({ status: 'cancelled' })
        .eq('id', rsvpId);

      if (error) throw error;

      setRSVPs(prev => prev.map(rsvp =>
        rsvp.id === rsvpId ? { ...rsvp, status: 'cancelled' } : rsvp
      ));

      toast({
        title: "RSVP Cancelled",
        description: "Your RSVP has been cancelled successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel RSVP",
        variant: "destructive",
      });
    }
  };

  const confirmRSVP = async (rsvpId: string) => {
    try {
      const { error } = await supabase
        .from('rsvps')
        .update({ status: 'confirmed' })
        .eq('id', rsvpId);

      if (error) throw error;

      setRSVPs(prev => prev.map(rsvp =>
        rsvp.id === rsvpId ? { ...rsvp, status: 'confirmed' } : rsvp
      ));

      toast({
        title: "RSVP Confirmed",
        description: "Your RSVP has been confirmed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm RSVP",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isEventPast = (eventDate: string) => {
    return new Date(eventDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <LoadingSpinner variant="page" size="lg" text="Loading your RSVPs..." />
      </div>
    );
  }

  const confirmedRSVPs = rsvps.filter(rsvp => rsvp.status === 'confirmed');
  const pendingRSVPs = rsvps.filter(rsvp => rsvp.status === 'pending');
  const cancelledRSVPs = rsvps.filter(rsvp => rsvp.status === 'cancelled');

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/student/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Your RSVPs</h1>
          <p className="text-gray-600 mt-2">
            Manage your event registrations and see your attendance history.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Your RSVP Count</CardTitle>
                <CardDescription>Total events you've signed up for</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{yourTotalRSVPs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Events Happening This Week</CardTitle>
                <CardDescription>Events you're attending this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{eventsThisWeek}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total RSVPs on Pulse</CardTitle>
                <CardDescription>All RSVPs made by students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 min-h-[2rem] flex items-center">
                  {platformTotalRSVPs !== null ? platformTotalRSVPs : <LoadingSpinner variant="inline" size="sm" />}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RSVP List */}
          <div className="lg:col-span-3">
            {rsvps.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No RSVPs Yet</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't signed up for any events yet. Start exploring!
                  </p>
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
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{rsvps.map((rsvp) => {
                // Check RSVP cutoff
                const isRSVPCutoffPassed = rsvp.event.rsvp_cutoff && new Date(rsvp.event.rsvp_cutoff) < new Date();
                return (
                  <EventCard
                    key={`${rsvp.event.id}-${eventRSVPCounts[rsvp.event.id] || 0}`}
                    event={{
                      ...rsvp.event,
                      eventName: rsvp.event.name,
                      date: rsvp.event.date && !isNaN(Date.parse(rsvp.event.date)) ? new Date(rsvp.event.date).toISOString() : '',
                      endTime: rsvp.event.time || '',
                      location: rsvp.event.location,
                      description: rsvp.event.description,
                      societyName: rsvp.event.society.name,
                      rsvp_cutoff: rsvp.event.rsvp_cutoff || null,
                      organiserID: '',
                      attendeeCount: eventRSVPCounts[rsvp.event.id] || 0,
                      requiresOrganizerSignup: false,
                      organizerEmail: '',
                      signup_link: '',
                    }}
                    onClick={() => setSelectedEventId(rsvp.event.id)}
                  />
                );
              })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Event Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </div>
  );
}
