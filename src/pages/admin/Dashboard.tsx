import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Users, CheckCircle, XCircle, Clock, Server, Database, BarChart3, Settings as SettingsIcon, FileClock } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import { API_BASE_URL } from '@/lib/apiConfig';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';


interface DashboardStats {
  totalEvents: { total: number, pending: number, approved: number, rejected: number };
  totalUsers: { students: number, societies: number, partners: number, admins: number };
  systemHealth: { api_status: 'healthy' | 'degraded', db_status: 'healthy' | 'degraded' };
}

interface ActivityLog {
    id: string;
    created_at: string;
    action: string;
    target_entity: string;
    target_id: string;
    details: {
        eventName?: string;
        rejection_reason?: string;
    };
    user_email: string;
}

interface UserSummary {
    id: string;
    role: string;
}

const formatTimeAgo = (dateString: string) => {
    if (!dateString) return '';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: { total: 0, pending: 0, approved: 0, rejected: 0 },
    totalUsers: { students: 0, societies: 0, partners: 0, admins: 0 },
    systemHealth: { api_status: 'healthy', db_status: 'healthy' },
  });
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchActivityLog = async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const response = await fetch(`${API_BASE_URL}/admin/activity`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` },
        });
        const data = await response.json();
        if (response.ok) {
            setActivityLog(data);
        }
    } catch (error) {
        console.error('Error fetching activity log:', error);
    }
  };

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
      await Promise.all([fetchStats(), fetchChartData(), fetchActivityLog()]);
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
      const { count: total, error: eventsError } = await supabase.from('event').select('*', { count: 'exact', head: true });
      if (eventsError) throw eventsError;
      const { count: pending } = await supabase.from('event').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      const { count: approved } = await supabase.from('event').select('*', { count: 'exact', head: true }).eq('status', 'approved');
      const { count: rejected } = await supabase.from('event').select('*', { count: 'exact', head: true }).eq('status', 'rejected');

      // Fetch user stats using the RPC function
      const { data: users, error: usersError } = await supabase.rpc('get_all_users') as { data: UserSummary[], error: any };
      if (usersError) throw usersError;

      const students = users.filter(u => u.role === 'student').length;
      const societies = users.filter(u => u.role === 'society').length;
      const partners = users.filter(u => u.role === 'partner').length;
      const admins = users.filter(u => u.role === 'admin').length;

      setStats(prevStats => ({
        ...prevStats,
        totalEvents: {
            total: total || 0,
            pending: pending || 0,
            approved: approved || 0,
            rejected: rejected || 0,
        },
        totalUsers: {
            students,
            societies,
            partners,
            admins,
        }
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Events</CardTitle>
              <CardDescription>{stats.totalEvents.pending} pending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalEvents.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Users</CardTitle>
              <CardDescription>All user roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.totalUsers.students + stats.totalUsers.societies + stats.totalUsers.partners + stats.totalUsers.admins}</div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Students</CardTitle>
               <CardDescription>Student accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">{stats.totalUsers.students}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Societies & Partners</CardTitle>
              <CardDescription>{stats.totalUsers.societies} Societies, {stats.totalUsers.partners} Partners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-600">{stats.totalUsers.societies + stats.totalUsers.partners}</div>
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
                    <Badge variant="outline">{stats.totalEvents.pending}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      <span className="text-sm">Approved</span>
                    </div>
                    <Badge variant="outline">{stats.totalEvents.approved}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <XCircle className="w-4 h-4 mr-2 text-red-500" />
                      <span className="text-sm">Rejected</span>
                    </div>
                    <Badge variant="outline">{stats.totalEvents.rejected}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Server className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">API Status</span>
                    </div>
                    <Badge className={stats.systemHealth.api_status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {stats.systemHealth.api_status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Database className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Database</span>
                    </div>
                     <Badge className={stats.systemHealth.db_status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {stats.systemHealth.db_status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>A log of recent administrative actions.</CardDescription>
              </CardHeader>
              <CardContent>
                 {activityLog.length > 0 ? (
                    <ul className="space-y-4">
                        {activityLog.map((log) => (
                            <li key={log.id} className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <FileClock className="w-5 h-5 text-gray-400 mt-1" />
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm font-medium text-gray-800">
                                        {log.action.replace('event.', 'Event ')}
                                        <span className="font-normal text-gray-600">
                                            {log.details.eventName ? ` - "${log.details.eventName}"` : ''}
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        By {log.user_email} · {formatTimeAgo(log.created_at)}
                                    </p>
                                    {log.action === 'event.rejected' && log.details.rejection_reason && (
                                        <p className="text-xs text-red-600 mt-1">
                                            Reason: {log.details.rejection_reason}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No recent administrative activity found.</p>
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
