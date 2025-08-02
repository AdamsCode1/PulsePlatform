import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, CheckCircle, Clock, XCircle, BarChart3 } from 'lucide-react';
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
  status: 'pending' | 'approved' | 'rejected';
  society: {
    name: string;
  };
  created_at: string;
}

interface AdminStats {
  totalEvents: number;
  pendingEvents: number;
  approvedEvents: number;
  rejectedEvents: number;
  totalSocieties: number;
  totalStudents: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    totalEvents: 0,
    pendingEvents: 0,
    approvedEvents: 0,
    rejectedEvents: 0,
    totalSocieties: 0,
    totalStudents: 0,
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const checkAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'admin@dupulse.co.uk') {
        navigate('/admin/login');
        return;
      }
      setUser(user);
      await Promise.all([fetchStats(), fetchRecentEvents()]);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchStats = async () => {
    try {
      // Fetch event stats
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('status');

      if (eventsError) throw eventsError;

      // Fetch society count
      const { count: societyCount, error: societyError } = await supabase
        .from('societies')
        .select('*', { count: 'exact', head: true });

      if (societyError) throw societyError;

      // Calculate event stats
      const totalEvents = events?.length || 0;
      const pendingEvents = events?.filter(e => e.status === 'pending').length || 0;
      const approvedEvents = events?.filter(e => e.status === 'approved').length || 0;
      const rejectedEvents = events?.filter(e => e.status === 'rejected').length || 0;

      setStats({
        totalEvents,
        pendingEvents,
        approvedEvents,
        rejectedEvents,
        totalSocieties: societyCount || 0,
        totalStudents: 0, // We'll implement this when we have student tracking
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          society:societies(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentEvents(data || []);
    } catch (error) {
      console.error('Error fetching recent events:', error);
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.email}. Manage events, societies, and platform oversight.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalEvents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingEvents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approvedEvents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejectedEvents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Societies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalSocieties}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{stats.totalStudents}</div>
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
                  onClick={() => navigate('/admin/events')}
                  className="w-full justify-start"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Events
                </Button>
                <Button 
                  onClick={() => navigate('/admin/deals')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Manage Deals
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Public Site
                </Button>
              </CardContent>
            </Card>

            {/* Event Status Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Event Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                      <span className="text-sm">Pending Review</span>
                    </div>
                    <Badge variant="outline">{stats.pendingEvents}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      <span className="text-sm">Approved</span>
                    </div>
                    <Badge variant="outline">{stats.approvedEvents}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <XCircle className="w-4 h-4 mr-2 text-red-500" />
                      <span className="text-sm">Rejected</span>
                    </div>
                    <Badge variant="outline">{stats.rejectedEvents}</Badge>
                  </div>
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
                    <CardTitle>Recent Event Submissions</CardTitle>
                    <CardDescription>Latest events submitted by societies</CardDescription>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => navigate('/admin/events')}
                    variant="outline"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No events submitted yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentEvents.map((event) => (
                      <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
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
                            <Users className="w-4 h-4 mr-2" />
                            {event.society.name}
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <span className="text-xs text-gray-500">
                            Submitted {new Date(event.created_at).toLocaleDateString()}
                          </span>
                          
                          {event.status === 'pending' && (
                            <Button 
                              size="sm"
                              onClick={() => navigate(`/admin/events?review=${event.id}`)}
                            >
                              Review
                            </Button>
                          )}
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
