import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_attendees: number;
  image_url?: string;
  society: {
    name: string;
  };
  rsvps?: {
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

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [userRSVPs, setUserRSVPs] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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
      await Promise.all([fetchUpcomingEvents(), fetchUserRSVPs(user.id)]);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/login/student');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          society:societies(name),
          rsvps:rsvps(count())
        `)
        .eq('status', 'approved')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(6);

      if (error) throw error;
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchUserRSVPs = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .select(`
          *,
          event:events(
            *,
            society:societies(name)
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserRSVPs(data || []);
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.user_metadata?.full_name || 'Student'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Discover events, manage your RSVPs, and stay connected with university life.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => navigate('/')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Browse Events
                </Button>
                <Button 
                  onClick={() => navigate('/student/rsvps')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage RSVPs
                </Button>
                <Button 
                  onClick={() => navigate('/deals')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  View Deals
                </Button>
              </CardContent>
            </Card>

            {/* RSVP Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your RSVPs</CardTitle>
                <CardDescription>Events you've signed up for</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userRSVPs.slice(0, 3).map((rsvp) => (
                    <div key={rsvp.id} className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-sm">{rsvp.event.title}</h4>
                      <p className="text-xs text-gray-600">{rsvp.event.society.name}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(rsvp.event.date).toLocaleDateString()}
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
                      className="p-0 h-auto"
                    >
                      View all ({userRSVPs.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Events happening around campus</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming events found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                        
                        <div className="space-y-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(event.date).toLocaleDateString()} at {event.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {event.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            {event.society.name}
                          </div>
                        </div>

                        <Button 
                          size="sm" 
                          className="w-full mt-4"
                          onClick={() => navigate(`/?event=${event.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
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
