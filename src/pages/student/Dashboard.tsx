import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import EventCard from '@/components/EventCard';

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
  }, [checkAuth]);

  const fetchUpcomingEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('event')
        .select(`
          *,
          society:society(name),
          rsvp(count)
        `)
        .eq('status', 'approved')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(6);

      if (error) throw error;
      setUpcomingEvents(data || []);
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

  // Calculate stats for dashboard cards
  const totalEvents = upcomingEvents.length;
  const totalRSVPs = userRSVPs.length;
  const upcomingRSVPEvents = userRSVPs.filter(rsvp => new Date(rsvp.event.start_time) > new Date()).length;

  if (loading) {
    return <LoadingSpinner />;
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center"><Calendar className="w-5 h-5 mr-2 text-blue-500" />Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalEvents}</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center"><Clock className="w-5 h-5 mr-2 text-green-500" />Upcoming RSVPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{upcomingRSVPEvents}</div>
            </CardContent>
          </Card>
          <Card className="border-purple-200 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center"><Users className="w-5 h-5 mr-2 text-purple-500" />Total RSVPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{totalRSVPs}</div>
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
              </CardContent>
            </Card>

            {/* RSVP Summary */}
            <Card className="mt-6 border-purple-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-purple-600">Your RSVPs</CardTitle>
                <CardDescription>Events you've signed up for</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userRSVPs.slice(0, 3).map((rsvp) => (
                    <div key={rsvp.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-sm text-purple-700">{rsvp.event.title}</h4>
                      <p className="text-xs text-gray-600">{rsvp.event.society.name}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3 mr-1 text-purple-400" />
                        {new Date(rsvp.event.start_time).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {userRSVPs.length === 0 && (
                    <p className="text-sm text-gray-500">No RSVPs yet</p>
                  )}
                  {userRSVPs.length > 3 && (
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={() => navigate('/student/rsvps')}
                      className="p-0 h-auto text-purple-600"
                    >
                      View all ({userRSVPs.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Your Events */}
          <div className="lg:col-span-2">
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
                    <Button onClick={() => navigate('/')} className="bg-pink-500 text-white">Browse Events</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userRSVPs.map((rsvp) => (
                      <EventCard key={rsvp.event.id} event={{
                        ...rsvp.event,
                        eventName: rsvp.event.title,
                        date: rsvp.event.start_time,
                        endTime: rsvp.event.end_time,
                        location: rsvp.event.location,
                        description: rsvp.event.description,
                        societyName: rsvp.event.society.name,
                        attendeeCount: rsvp.event.rsvp?.[0]?.count || 0,
                        organiserID: '',
                        requiresOrganizerSignup: false,
                        organizerEmail: '',
                        signup_link: (rsvp.event as any).signup_link || '',
                      }}
                      onClick={() => navigate(`/event/${rsvp.event.id}`)} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
