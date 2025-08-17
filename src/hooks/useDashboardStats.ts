import { useState, useEffect } from 'react';
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

interface UseDashboardStatsResult {
  data: DashboardStats | undefined;
  error: Error | null;
  isLoading: boolean;
  refetch: () => void;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Get the current user to check if they're an admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Fetch event stats - this works for admins due to RLS policies
  const { count: total, error: eventsError } = await supabase.from('event').select('*', { count: 'exact', head: true });
  if (eventsError) throw eventsError;
  const { count: pending } = await supabase.from('event').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  const { count: approved } = await supabase.from('event').select('*', { count: 'exact', head: true }).eq('status', 'approved');
  const { count: rejected } = await supabase.from('event').select('*', { count: 'exact', head: true }).eq('status', 'rejected');

  let students = 0;
  let societies = 0;
  let partners = 0;
  let admins = 0;

  // For admin users, try to get user counts via the admin API
  const { data: adminRow, error: adminError } = await supabase
    .from('admin')
    .select('uid')
    .eq('uid', user.id)
    .maybeSingle();
  const isAdmin = !!adminRow && !adminError;

  if (isAdmin) {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (token) {
        // Use the Vercel API functions
        const response = await fetch('/api/admin/users?limit=1000', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const usersData = await response.json();
          const users = usersData.data || [];
          students = users.filter((u: UserSummary) => u.role === 'student').length;
          societies = users.filter((u: UserSummary) => u.role === 'society').length;
          partners = users.filter((u: UserSummary) => u.role === 'partner').length;
          admins = users.filter((u: UserSummary) => u.role === 'admin').length;
        } else {
          // Fallback to direct table queries for admins
          const { count: studentCount } = await supabase.from('student').select('*', { count: 'exact', head: true });
          const { count: societyCount } = await supabase.from('society').select('*', { count: 'exact', head: true });
          students = studentCount || 0;
          societies = societyCount || 0;
          partners = 0; // No partners table yet
          admins = 0; // Can't count admins from client side
        }
      }
    } catch (error) {
      students = 0;
      societies = 0;
      partners = 0;
      admins = 0;
    }
  } else {
    // For non-admin users, we can't access user counts due to RLS
    console.warn('Dashboard stats accessed by non-admin user, returning limited stats');
  }

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

const useDashboardStats = (): UseDashboardStatsResult => {
  const [data, setData] = useState<DashboardStats | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const stats = await fetchDashboardStats();
      setData(stats);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, error, isLoading, refetch };
};

export default useDashboardStats;
