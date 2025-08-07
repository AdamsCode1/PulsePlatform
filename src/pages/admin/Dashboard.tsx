import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Users, CheckCircle, XCircle, Clock, Building2, BarChart3, Plus, Settings as SettingsIcon } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { API_BASE_URL } from '@/lib/apiConfig';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
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
  totalPartners: number;
}

interface UserSummary {
    id: string;
    role: string;
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
    totalPartners: 0,
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchChartData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      const data = await response.json();
      if (response.ok) {
        // Format data for the chart
        const formattedData = data.map((item: any) => ({
          date: new Date(item.submission_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: item.count,
        }));
        setChartData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const checkAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // Secure role-based check
      if (!user || user.app_metadata?.role !== 'admin') {
        navigate('/admin/login');
        return;
      }
      setUser(user);
      await Promise.all([fetchStats(), fetchRecentEvents(), fetchChartData()]);
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
      const { count: totalEvents, error: eventsError } = await supabase.from('event').select('*', { count: 'exact', head: true });
      if (eventsError) throw eventsError;
      const { count: pendingEvents } = await supabase.from('event').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      const { count: approvedEvents } = await supabase.from('event').select('*', { count: 'exact', head: true }).eq('status', 'approved');
      const { count: rejectedEvents } = await supabase.from('event').select('*', { count: 'exact', head: true }).eq('status', 'rejected');

      // Fetch user stats using the RPC function
      const { data: users, error: usersError } = await supabase.rpc('get_all_users') as { data: UserSummary[], error: any };
      if (usersError) throw usersError;

      const totalStudents = users.filter(u => u.role === 'student').length;
      const totalSocieties = users.filter(u => u.role === 'society').length;
      const totalPartners = users.filter(u => u.role === 'partner').length;

      setStats({
        totalEvents: totalEvents || 0,
        pendingEvents: pendingEvents || 0,
        approvedEvents: approvedEvents || 0,
        rejectedEvents: rejectedEvents || 0,
        totalSocieties,
        totalStudents,
        totalPartners,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('event')
        .select(`
          *,
          society:society_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('Recent events query result:', { data, error });

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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">{stats.totalPartners}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity Chart */}
          <div className="lg:col-span-2">
             <Card>
              <CardHeader>
                <CardTitle>Recent Event Submissions</CardTitle>
                <CardDescription>Event submissions over the last 7 days.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Submissions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Status */}
          <div className="lg:col-span-1 space-y-8">
             <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => navigate('/admin/events')} className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" /> Manage Events
                </Button>
                <Button onClick={() => navigate('/admin/deals')} className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" /> Manage Deals
                </Button>
                <Button onClick={() => navigate('/admin/users')} className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" /> Manage Users
                </Button>
                 <Button onClick={() => navigate('/admin/settings')} className="w-full justify-start" variant="outline">
                  <SettingsIcon className="w-4 h-4 mr-2" /> Manage Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
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
                            {new Date(event.start_time).toLocaleDateString()} at {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
