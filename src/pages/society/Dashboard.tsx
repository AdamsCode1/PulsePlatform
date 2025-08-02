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

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_attendees: number;
  status: 'pending' | 'approved' | 'rejected';
  image_url?: string;
  rsvps?: {
    count: number;
  }[];
}

interface Society {
  id: string;
  name: string;
  description: string;
  email: string;
}

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    first_name?: string;
  };
}

export default function SocietyDashboard() {
  const navigate = useNavigate();
  const [society, setSociety] = useState<Society | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

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
        .from('societies')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Society not found:', error);
        // Create a default society entry if one doesn't exist
        const { data: newSociety, error: createError } = await supabase
          .from('societies')
          .insert([{
            email: email,
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
            email: email
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
        email: email
      });
    }
  };

  const fetchSocietyEvents = async (email: string) => {
    try {
      // First get society ID
      const { data: societyData, error: societyError } = await supabase
        .from('societies')
        .select('id')
        .eq('email', email)
        .single();

      if (societyError) throw societyError;

      // Then get events for this society
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          rsvps:rsvps(count())
        `)
        .eq('society_id', societyData.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
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
      sum + (event.rsvps?.[0]?.count || 0), 0
    );
    
    return { approved, pending, totalRSVPs, total: events.length };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const stats = getEventStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
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
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => navigate('/society/submit-event')}
                  className="w-full justify-start"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Submit New Event
                </Button>
                <Button 
                  onClick={() => navigate('/society/events')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Events
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Public Events
                </Button>
              </CardContent>
            </Card>

            {/* Society Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Society Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Name</p>
                    <p className="text-sm text-gray-600">{society?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-600">{society?.email}</p>
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
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Events</CardTitle>
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
                  <div className="space-y-4">
                    {events.slice(0, 5).map((event) => (
                      <div key={event.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          {getStatusBadge(event.status)}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {event.description}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-500">
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
                            {event.rsvps?.[0]?.count || 0} RSVPs
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Max {event.max_attendees} attendees
                          </div>
                        </div>
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
