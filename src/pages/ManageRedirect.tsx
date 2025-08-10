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

        const role = user.app_metadata?.role;

        switch (role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'society':
            navigate('/society/dashboard');
            break;
          case 'partner':
            navigate('/partner/dashboard');
            break;
          case 'student':
            navigate('/student/dashboard');
            break;
          default:
            // Fallback for users with no role or an unknown role
            navigate('/login');
            break;
        }
      } catch (error) {
        console.error('Error redirecting user:', error);
        navigate('/login'); // Redirect to login on error
      }
    };

    checkUserAndRedirect();
  }, [navigate]);

  // Display a loading spinner while the redirect is happening
  return <LoadingSpinner />;
};

export default ManageRedirect;
