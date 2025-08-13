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

        // Look for the record in the 'role' table with the user's id as its 'user_id' field
        const { data: roleData, error: roleError } = await supabase
          .from('role')
          .select('account_type')
          .eq('user_id', user.id)
          .maybeSingle();

        if (roleError) {
          console.error('Error fetching user role:', roleError);
          navigate('/login');
          return;
        }

        const role = roleData?.account_type;

        // Log role
        console.log('User role:', role);

        // Handle case where no role is found
        if (!role) {
          console.warn('No role found for user:', user.id, 'Redirecting to login...');
          navigate('/login');
          return;
        }

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
            console.log('Unknown role for user:', user.id);
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
