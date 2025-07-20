import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user && user.user_metadata && user.user_metadata.full_name) {
        setFirstName(user.user_metadata.full_name.split(' ')[0]);
      } else if (user && user.email) {
        setFirstName(user.email.split('@')[0]);
      } else {
        setFirstName('');
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setFirstName('');
    navigate('/');
  };

  return (
    <nav className="fixed top-3 left-1/2 z-50 -translate-x-1/2 w-[98vw] max-w-2xl rounded-2xl bg-white/80 backdrop-blur-md shadow-xl flex items-center justify-between px-4 py-2 border border-gray-200">
      <div className="flex items-center gap-3">
        <img src="/favicon.ico" alt="DUPulse Logo" width={36} height={36} className="rounded-full" />
        <span className="font-extrabold text-lg text-gray-900 tracking-tight">DUPulse</span>
      </div>
      {/* Desktop Nav */}
      <div className="hidden md:flex gap-4 items-center">
        <a href="#" className="text-gray-700 font-medium hover:text-pink-500 transition">Home</a>
        <a href="#events" className="text-gray-700 font-medium hover:text-pink-500 transition">Events</a>
        <a href="#deals" className="text-gray-700 font-medium hover:text-pink-500 transition">Deals</a>
        <a href="#about" className="text-gray-700 font-medium hover:text-pink-500 transition">About</a>
        {user ? (
          <>
            <span className="text-gray-700 font-medium mr-2">Hello, {firstName}!</span>
            <button onClick={handleSignOut} className="px-3 py-1 rounded-lg border border-gray-300 bg-white/70 text-gray-800 font-semibold shadow hover:bg-gray-100 transition">Sign Out</button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')} className="px-3 py-1 rounded-lg border border-gray-300 bg-white/70 text-gray-800 font-semibold shadow hover:bg-gray-100 transition">Login</button>
            <button onClick={() => navigate('/login')} className="px-3 py-1 rounded-lg bg-pink-500 text-white font-semibold shadow hover:bg-pink-600 transition">Sign Up</button>
          </>
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
          <a href="#" className="text-gray-700 font-medium hover:text-pink-500 transition w-full text-center py-2">Home</a>
          <a href="#events" className="text-gray-700 font-medium hover:text-pink-500 transition w-full text-center py-2">Events</a>
          <a href="#deals" className="text-gray-700 font-medium hover:text-pink-500 transition w-full text-center py-2">Deals</a>
          <a href="#about" className="text-gray-700 font-medium hover:text-pink-500 transition w-full text-center py-2">About</a>
          {user ? (
            <>
              <span className="text-gray-700 font-medium mb-2">Hello, {firstName}!</span>
              <button onClick={handleSignOut} className="w-11/12 px-3 py-2 rounded-lg border border-gray-300 bg-white/70 text-gray-800 font-semibold shadow hover:bg-gray-100 transition">Sign Out</button>
            </>
          ) : (
            <>
              <button onClick={() => { setMenuOpen(false); navigate('/login'); }} className="w-11/12 px-3 py-2 rounded-lg border border-gray-300 bg-white/70 text-gray-800 font-semibold shadow hover:bg-gray-100 transition">Login</button>
              <button onClick={() => { setMenuOpen(false); navigate('/login'); }} className="w-11/12 px-3 py-2 rounded-lg bg-pink-500 text-white font-semibold shadow hover:bg-pink-600 transition">Sign Up</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}