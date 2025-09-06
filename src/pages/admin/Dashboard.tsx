import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Users, CheckCircle, XCircle, Clock, Server, Database, BarChart3, Settings as SettingsIcon, FileClock, AlertTriangle } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import { formatDistanceToNow } from 'date-fns';
import useApi from '@/hooks/useApi';
import useDashboardStats, { DashboardStats } from '@/hooks/useDashboardStats';
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminAuth } from '@/hooks/useAdminAuth';
import ErrorBoundary from '@/components/ErrorBoundary';

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

interface ChartDataItem {
    submission_date: string;
    count: number;
}

const formatTimeAgo = (dateString: string) => {
    if (!dateString) return '';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

const ErrorDisplay = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-full bg-red-50 p-4 rounded-lg">
        <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
        <p className="text-red-700 font-semibold mb-2">An error occurred</p>
        <p className="text-red-600 text-sm mb-4">{message}</p>
        <Button onClick={onRetry} variant="destructive" size="sm">Retry</Button>
    </div>
);

function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, user } = useAdminAuth();
  const [studentCount, setStudentCount] = useState<number>(0);

  // --- Data Fetching with React Query ---
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: errorStats,
    refetch: refetchStats
  } = useDashboardStats();

  const {
    data: activityLog,
    isLoading: isLoadingActivity,
    error: errorActivity,
    refetch: refetchActivity
  } = useApi<ActivityLog[]>(['activityLog'], 'unified?resource=admin&action=activity');

  const {
    data: rawChartData,
    isLoading: isLoadingChart,
    error: errorChart,
    refetch: refetchChart
  } = useApi<ChartDataItem[]>(['chartData'], 'unified?resource=admin&action=dashboard');

  // Defensive chart data mapping with debug logging
  const chartData = useMemo(() => {
    if (!rawChartData) return [];
    if (!Array.isArray(rawChartData)) {
      console.error('Chart data is not an array:', rawChartData);
      return [];
    }
    return rawChartData.map((item, idx) => {
      if (!item || typeof item.submission_date !== 'string' || typeof item.count !== 'number') {
        console.error('Malformed chart data at index', idx, item);
        return { date: 'Invalid', count: 0 };
      }
      let dateStr = 'Invalid';
      try {
        dateStr = new Date(item.submission_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch (e) {
        console.error('Error parsing date for chart data at index', idx, item.submission_date, e);
      }
      return {
        date: dateStr,
        count: item.count,
      };
    });
  }, [rawChartData]);


  // Centralized navigation helper for clickable cards/buttons
  const handleCardClick = (path: string) => {
    navigate(path);
  };

  const totalUsers = stats ? stats.totalUsers.students + stats.totalUsers.societies + stats.totalUsers.partners + stats.totalUsers.admins : 0;

  useEffect(() => {
    async function fetchStudentCount() {
      const { count, error } = await supabase
        .from('student')
        .select('*', { count: 'exact', head: true });
      if (error) {
        console.error('Error fetching student count:', error);
        setStudentCount(0);
      } else {
        setStudentCount(count ?? 0);
      }
    }
    fetchStudentCount();
  }, []);

  // Access control UI
  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-300 rounded-lg p-8 text-red-700 text-center">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>You are not authorized to access the admin dashboard.</p>
        </div>
      </div>
    );
  }
  if (isAdmin === null) {
    return <Skeleton className="h-32 w-full" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          {user ? (
            <p className="text-gray-600 mt-2">
              {`Welcome back, ${user.email}. Manage events, societies, and platform oversight.`}
            </p>
          ) : (
            <div className="mt-2">
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {isLoadingStats ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : errorStats ? (
            <div className="col-span-full">
              <ErrorDisplay message={errorStats.message} onRetry={refetchStats} />
            </div>
          ) : stats && (
            <>
        <Card onClick={() => handleCardClick('/admin/events')} className="cursor-pointer hover:bg-gray-100 transition-colors border-blue-200 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Events</CardTitle>
                  <CardDescription>{stats.totalEvents.pending} pending</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.totalEvents.total}</div>
                </CardContent>
              </Card>
        <Card className="border-purple-200 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Students</CardTitle>
                  <CardDescription>Student accounts</CardDescription>
                </CardHeader>
                <CardContent>
          <div className="text-3xl font-bold text-purple-600">{studentCount}</div>
                </CardContent>
              </Card>
        <Card className="border-green-200 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Societies</CardTitle>
                  <CardDescription>Society accounts</CardDescription>
                </CardHeader>
                <CardContent>
          <div className="text-3xl font-bold text-green-600">{stats.totalUsers.societies}</div>
                </CardContent>
              </Card>
        <Card className="border-pink-200 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Partners</CardTitle>
                  <CardDescription>Partner accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-pink-600">{stats.totalUsers.partners}</div>
                </CardContent>
              </Card>
            </>
          )}
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
                {isLoadingChart ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : errorChart ? (
                  <ErrorDisplay message={errorChart.message} onRetry={refetchChart} />
                ) : (
                  <div style={{ minHeight: '300px' }}>
                      <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#ec4899" name="Submissions" />
                      </BarChart>
                      </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Status */}
          <div className="lg:col-span-1 lg:row-span-2 space-y-8">
             <Card className="border-pink-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-pink-600">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => handleCardClick('/admin/events?status=pending')} className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2 text-pink-500" /> Review Pending Events
                </Button>
                <Button onClick={() => navigate('/admin/deals')} className="w-full justify-start" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2 text-purple-500" /> Manage Deals
                </Button>
                <Button onClick={() => navigate('/admin/users')} className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2 text-blue-500" /> Manage Users
                </Button>
                 <Button onClick={() => navigate('/admin/settings')} className="w-full justify-start" variant="outline">
                  <SettingsIcon className="w-4 h-4 mr-2 text-green-500" /> Manage Settings
                </Button>
              </CardContent>
            </Card>

      <Card className="border-blue-200 shadow-md">
              <CardHeader>
        <CardTitle className="text-blue-600">Event Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : errorStats ? (
                  <ErrorDisplay message={errorStats.message} onRetry={refetchStats} />
                ) : stats && (
                  <div className="space-y-3">
                    <div onClick={() => handleCardClick('/admin/events?status=pending')} className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                        <span className="text-sm">Pending Review</span>
                      </div>
                      <Badge variant="outline">{stats.totalEvents.pending}</Badge>
                    </div>
                    <div onClick={() => handleCardClick('/admin/events?status=approved')} className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-sm">Approved</span>
                      </div>
                      <Badge variant="outline">{stats.totalEvents.approved}</Badge>
                    </div>
                    <div onClick={() => handleCardClick('/admin/events?status=rejected')} className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors">
                      <div className="flex items-center">
                        <XCircle className="w-4 h-4 mr-2 text-red-500" />
                        <span className="text-sm">Rejected</span>
                      </div>
                      <Badge variant="outline">{stats.totalEvents.rejected}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

      <Card className="border-purple-200 shadow-md">
              <CardHeader>
        <CardTitle className="text-purple-600">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : errorStats ? (
                  <ErrorDisplay message={errorStats.message} onRetry={refetchStats} />
                ) : stats && (
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
                )}
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
              <CardContent className="max-h-96 overflow-auto">
                 {isLoadingActivity ? (
                   <div className="space-y-4">
                     <Skeleton className="h-12 w-full" />
                     <Skeleton className="h-12 w-full" />
                     <Skeleton className="h-12 w-full" />
                   </div>
                 ) : errorActivity ? (
                  <ErrorDisplay message={errorActivity.message} onRetry={refetchActivity} />
                 ) : activityLog && activityLog.length > 0 ? (
                    <ul className="space-y-4">
                        {activityLog.map((log, idx) => {
                            // Defensive: handle missing action or details
                            const action = log && typeof log.action === 'string' ? log.action : 'event.created';
                            const details = log && typeof log.details === 'object' && log.details !== null ? log.details : {};
                            return (
                                <li key={log.id || idx} className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <FileClock className="w-5 h-5 text-gray-400 mt-1" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium text-gray-800">
                                            {action.replace('event.', 'Event ')}
                                            <span className="font-normal text-gray-600">
                                                {details.eventName ? ` - "${details.eventName}"` : ''}
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            By {log.user_email || 'Unknown'} · {formatTimeAgo(log.created_at)}
                                        </p>
                                        {action === 'event.rejected' && details.rejection_reason && (
                                            <p className="text-xs text-red-600 mt-1">
                                                Reason: {details.rejection_reason}
                                            </p>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
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

// Replace default export with error boundary wrapper
const AdminDashboardWrapped = () => (
  <ErrorBoundary>
    <AdminDashboard />
  </ErrorBoundary>
);

export default AdminDashboardWrapped;
