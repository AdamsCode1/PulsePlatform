import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';

const ManageRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // If no user, send to the generic login page
          navigate('/login');
          return;
        }

        // Check student table
        const { data: studentData } = await supabase
          .from('student')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (studentData) {
          navigate('/student/dashboard');
          return;
        }

        // Check society table
        const { data: societyData } = await supabase
          .from('society')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (societyData) {
          navigate('/society/dashboard');
          return;
        }

        // Check partner table
        const { data: partnerData } = await supabase
          .from('partner')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (partnerData) {
          navigate('/partner/dashboard');
          return;
        }

        // If no role found, redirect to login
        console.warn('No role found for user:', user.id, 'Redirecting to login...');
        navigate('/login');
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate('/login'); // Redirect to login on error
      }
    };

    checkUserAndRedirect();
  }, [navigate]);

  // Display a loading spinner while the redirect is happening
  return (
    <div className="min-h-screen bg-gray-50">
      <LoadingSpinner variant="page" size="lg" text="Redirecting you to your dashboard..." />
    </div>
  );
};

export default ManageRedirect;
