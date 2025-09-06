import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Calendar, Gift, Users, User, Menu, X, ChevronDown, LogOut, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';

const EnhancedNavBar = () => {
  const [userType, setUserType] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // Simulate getting user type from metadata or database
        const type = user.user_metadata?.userType || localStorage.getItem('userType') || 'student';
        setUserType(type);
        
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        setUserName(name);
        
        // Simulate notifications count
        setNotifications(Math.floor(Math.random() * 5));
      }
    };
    
    checkUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('userType');
      setUser(null);
      setUserType(null);
      setUserName('');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigation = (path: string, sectionId?: string) => {
    if (window.location.pathname === '/' && sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else if (sectionId) {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } else {
      navigate(path);
    }
    setIsMenuOpen(false);
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

  const navItems = [
    { 
      label: 'Events', 
      path: '/events', 
      icon: Calendar,
      active: location.pathname.includes('/events') || location.pathname === '/',
      onClick: () => handleNavigation('/', 'events-section')
    },
    { 
      label: 'Deals', 
      path: '/deals', 
      icon: Gift,
      active: location.pathname.includes('/deals'),
      onClick: () => handleNavigation('/deals')
    },
    { 
      label: 'About', 
      path: '/about', 
      icon: Users,
      active: location.pathname.includes('/about'),
      onClick: () => handleNavigation('/about')
    },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-xl border-b border-purple-100' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => handleNavigation('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              DUPulse
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  item.active 
                    ? 'bg-purple-100 text-purple-700 shadow-md' 
                    : 'hover:bg-purple-50 text-gray-700 hover:text-purple-700'
                }`}
                onClick={item.onClick}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </Button>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-2 hover:bg-purple-50 rounded-xl transition-colors"
                  onClick={() => navigate('/notifications')}
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs p-0 flex items-center justify-center">
                      {notifications}
                    </Badge>
                  )}
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-purple-50 rounded-xl px-3 py-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="hidden md:block text-left">
                        <div className="text-sm font-medium text-gray-900">{userName}</div>
                        <div className="text-xs text-gray-500 capitalize">{userType}</div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white shadow-xl border border-purple-100 rounded-xl">
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-purple-50 rounded-lg"
                      onClick={handleDashboardNavigation}
                    >
                      <User className="mr-2 h-4 w-4 text-purple-600" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-purple-50 rounded-lg"
                      onClick={() => navigate('/settings')}
                    >
                      <Settings className="mr-2 h-4 w-4 text-purple-600" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-red-50 text-red-600 rounded-lg"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-xl font-medium"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg rounded-xl font-medium"
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2 hover:bg-purple-50 rounded-xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-xl border border-purple-100 rounded-b-2xl">
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={`w-full justify-start space-x-3 px-4 py-3 rounded-xl ${
                    item.active 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'hover:bg-purple-50 text-gray-700'
                  }`}
                  onClick={item.onClick}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              ))}
              
              {!user && (
                <>
                  <hr className="border-purple-100 my-4" />
                  <Button
                    variant="outline"
                    className="w-full justify-center rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl"
                    onClick={() => navigate('/register')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default EnhancedNavBar;
