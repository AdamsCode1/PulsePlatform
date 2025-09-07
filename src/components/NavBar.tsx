import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// User Type Badge Component
const UserTypeBadge = ({ userType }: { userType: string }) => {
  const getBadgeStyles = () => {
    switch (userType.toLowerCase()) {
      case 'student':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'society':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'partner':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'admin':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!userType) return null;

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyles()}`}>
      {userType.charAt(0).toUpperCase() + userType.slice(1)}
    </span>
  );
};

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [userType, setUserType] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();

  // Function to determine user type from database tables
  const determineUserTypeFromDatabase = async (userId: string) => {
    try {
      // Check if user is an admin first
      const { data: adminData, error: adminError } = await supabase
        .from('admin')
        .select('uid')
        .eq('uid', userId)
        .maybeSingle();

      if (adminData && !adminError) {
        setUserType('admin');
        return;
      }

      // Check if user is a student
      const { data: studentData, error: studentError } = await supabase
        .from('student')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (studentData && !studentError) {
        setUserType('student');
        return;
      }

      // Check if user is a society
      const { data: societyData, error: societyError } = await supabase
        .from('society')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (societyData && !societyError) {
        setUserType('society');
        return;
      }

      // Check if user is a partner (skip for now since table doesn't exist)
      // const { data: partnerData } = await supabase
      //   .from('partners')
      //   .select('id')
      //   .eq('user_id', userId)
      //   .maybeSingle();
      // 
      // if (partnerData) {
      //   setUserType('partner');
      //   return;
      // }

      setUserType('');

    } catch (error) {
      console.error('Error determining user type:', error);
      setUserType('');
    }
  };

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      // console.log('Debug - User logged in:', user?.email);
      // console.log('Debug - User metadata:', user?.user_metadata);

      if (user && user.user_metadata && user.user_metadata.full_name) {
        setFirstName(user.user_metadata.full_name.split(' ')[0]);
      } else if (user && user.email) {
        setFirstName(user.email.split('@')[0]);
      } else {
        setFirstName('');
      }

      // Set user type from metadata or determine from database
      if (user && user.user_metadata && user.user_metadata.user_type) {
        // console.log('Debug - Setting user type from metadata:', user.user_metadata.user_type);
        setUserType(user.user_metadata.user_type);
      } else if (user) {
        // console.log('Debug - No user type in metadata, checking database tables...');
        await determineUserTypeFromDatabase(user.id);
      } else {
        setUserType('');
      }
    }
    fetchUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Scroll event handler
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar at the top of the page
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setFirstName('');
    navigate('/');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleNavigation = (path: string, sectionId?: string) => {
    if (window.location.pathname === '/' && sectionId) {
      // We're on the home page, just scroll to section
      scrollToSection(sectionId);
    } else if (sectionId) {
      // We're on a different page, navigate to home then scroll
      navigate('/');
      setTimeout(() => scrollToSection(sectionId), 100);
    } else {
      // Regular navigation
      navigate(path);
    }
  };

  const handleDashboardNavigation = () => {
    switch (userType) {
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
      default:
        navigate('/student/dashboard');
        break;
    }
  };

  return (
    <nav className={`fixed top-3 left-1/2 z-50 -translate-x-1/2 w-[95vw] max-w-3xl rounded-xl bg-white/80 backdrop-blur-md shadow-xl flex items-center justify-between px-3 py-1.5 border border-gray-200 transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
      {/* Logo and Brand */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation('/', 'hero')}>
        <img src="/favicon.ico" alt="DUPulse Logo" width={32} height={32} className="rounded-full" />
        <span className="font-extrabold text-base text-gray-900 tracking-tight">DUPulse</span>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex gap-3 items-center">
        <button onClick={() => handleNavigation('/', 'schedule')} className="text-gray-700 font-medium hover:text-pink-500 transition whitespace-nowrap text-sm">Events</button>
        <button onClick={() => handleNavigation('/', 'deals')} className="text-gray-700 font-medium hover:text-pink-500 transition whitespace-nowrap text-sm">Deals</button>
        <button onClick={() => navigate('/about')} className="text-gray-700 font-medium hover:text-pink-500 transition whitespace-nowrap text-sm">About</button>
        {user && (
          <>
            <button onClick={handleDashboardNavigation} className="text-gray-700 font-medium hover:text-pink-500 transition whitespace-nowrap text-sm">Dashboard</button>
          </>
        )}

        {/* User Section */}
        {user ? (
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-medium text-xs">Hi, {firstName}!</span>
              <UserTypeBadge userType={userType} />
            </div>
            <button onClick={handleSignOut} className="px-2 py-1 rounded-md border border-gray-300 bg-white/70 text-gray-800 font-semibold shadow hover:bg-gray-100 transition text-xs whitespace-nowrap">Sign Out</button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-300">
            <button onClick={() => navigate('/login')} className="px-2 py-1 rounded-md border border-gray-300 bg-white/70 text-gray-800 font-semibold shadow hover:bg-gray-100 transition text-xs whitespace-nowrap">Login</button>
            <button onClick={() => navigate('/login')} className="px-2 py-1 rounded-md bg-pink-500 text-white font-semibold shadow hover:bg-pink-600 transition text-xs whitespace-nowrap">Sign Up</button>
          </div>
        )}
      </div>
      {/* Mobile Hamburger */}
      <div className="md:hidden flex items-center">
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400">
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white/95 rounded-b-2xl shadow-lg flex flex-col items-center py-4 gap-3 md:hidden animate-fade-in z-50">
          <button onClick={() => { setMenuOpen(false); handleNavigation('/', 'schedule'); }} className="text-gray-700 font-medium hover:text-pink-500 transition w-full text-center py-2">Events</button>
          <button onClick={() => { setMenuOpen(false); handleNavigation('/', 'deals'); }} className="text-gray-700 font-medium hover:text-pink-500 transition w-full text-center py-2">Deals</button>
          <button onClick={() => { setMenuOpen(false); navigate('/about'); }} className="text-gray-700 font-medium hover:text-pink-500 transition w-full text-center py-2">About</button>
          {user && (
            <>
              <button onClick={() => { setMenuOpen(false); handleDashboardNavigation(); }} className="text-gray-700 font-medium hover:text-pink-500 transition w-full text-center py-2">Dashboard</button>
            </>
          )}

          {/* Mobile User Section */}
          {user ? (
            <div className="w-full flex flex-col items-center gap-3 pt-3 border-t border-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">Hi, {firstName}!</span>
                <UserTypeBadge userType={userType} />
              </div>
              <button onClick={() => { setMenuOpen(false); handleSignOut(); }} className="w-11/12 px-3 py-2 rounded-lg border border-gray-300 bg-white/70 text-gray-800 font-semibold shadow hover:bg-gray-100 transition">Sign Out</button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-3 pt-3 border-t border-gray-300">
              <button onClick={() => { setMenuOpen(false); navigate('/login'); }} className="w-11/12 px-3 py-2 rounded-lg border border-gray-300 bg-white/70 text-gray-800 font-semibold shadow hover:bg-gray-100 transition">Login</button>
              <button onClick={() => { setMenuOpen(false); navigate('/login'); }} className="w-11/12 px-3 py-2 rounded-lg bg-pink-500 text-white font-semibold shadow hover:bg-pink-600 transition">Sign Up</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}