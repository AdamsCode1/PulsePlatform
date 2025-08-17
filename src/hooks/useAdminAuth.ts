import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

export function useAdminAuth() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        navigate('/admin/login');
        return;
      }
      setUser(user);
      // Check admin table for UID
      const { data, error } = await supabase
        .from('admin')
        .select('uid')
        .eq('uid', user.id)
        .maybeSingle();
      if (error) {
        console.error('Admin table query error:', error);
      }
      if (!data) {
        setIsAdmin(false);
        navigate('/admin/login');
        return;
      }
      setIsAdmin(true);
    }
    checkAdmin();
  }, [navigate]);

  return { isAdmin, user };
}
