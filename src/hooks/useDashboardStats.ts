import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

interface UserSummary {
    id: string;
    role: string;
}

export interface DashboardStats {
  totalEvents: { total: number, pending: number, approved: number, rejected: number };
  totalUsers: { students: number, societies: number, partners: number, admins: number };
  systemHealth: { api_status: 'healthy' | 'degraded', db_status: 'healthy' | 'degraded' };
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Fetch event stats
  const { count: total, error: eventsError } = await supabase.from('event').select('*', { count: 'exact', head: true });
  if (eventsError) throw eventsError;
  const { count: pending } = await supabase.from('event').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  const { count: approved } = await supabase.from('event').select('*', { count: 'exact', head: true }).eq('status', 'approved');
  const { count: rejected } = await supabase.from('event').select('*', { count: 'exact', head: true }).eq('status', 'rejected');

  // Fetch user stats using the RPC function
  let users: UserSummary[] = [];
  const usersResp = await supabase.rpc('get_all_users') as { data: UserSummary[] | null, error: any };
  if (usersResp.error) {
    // Gracefully handle missing RPC function (404)
    console.warn('get_all_users RPC unavailable; defaulting user counts to 0');
  } else if (usersResp.data) {
    users = usersResp.data;
  }

  const students = users.filter(u => u.role === 'student').length;
  const societies = users.filter(u => u.role === 'society').length;
  const partners = users.filter(u => u.role === 'partner').length;
  const admins = users.filter(u => u.role === 'admin').length;

  // System health is hardcoded for now, but could be dynamic in the future
  const systemHealth = { api_status: 'healthy' as const, db_status: 'healthy' as const };

  return {
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
    },
    systemHealth
  };
};

const useDashboardStats = () => {
  return useQuery<DashboardStats, Error>({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 30000, // 30 seconds
  });
};

export default useDashboardStats;
