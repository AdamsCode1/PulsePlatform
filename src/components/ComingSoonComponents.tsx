import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Users, Calendar, Sparkles, Clock, Mail, Share2 } from 'lucide-react';
import CircularText from '@/blocks/TextAnimations/CircularText/CircularText';
import GlitchText from '@/blocks/TextAnimations/GlitchText/GlitchText';
import ShinyText from '@/blocks/TextAnimations/ShinyText/ShinyText';
import Aurora from '@/blocks/Backgrounds/Aurora/Aurora';

interface CountdownTimerProps {
  launchDate: string;
  onJoinWaitlist?: () => void;
  onError?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ launchDate, onJoinWaitlist, onError }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(launchDate) - +new Date();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  return (
    <div className="w-screen overflow-x-hidden">
      {/* Modern Minimal Landing Page */}
      <div
        className="h-screen w-screen relative overflow-hidden"
        style={{
          margin: 0,
          padding: 0,
        }}
      >
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes slideInFromTop {
              0% {
                transform: translateY(-50px);
                opacity: 0;
              }
              100% {
                transform: translateY(0);
                opacity: 1;
              }
            }
            
            @keyframes slideInFromBottom {
              0% {
                transform: translateY(50px);
                opacity: 0;
              }
              100% {
                transform: translateY(0);
                opacity: 1;
              }
            }
            
            @keyframes fadeIn {
              0% {
                opacity: 0;
              }
              100% {
                opacity: 1;
              }
            }
            
            @keyframes glow {
              0%, 100% {
                box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
              }
              50% {
                box-shadow: 0 0 30px rgba(34, 197, 94, 0.6);
              }
            }
            
            .animate-slide-top {
              animation: slideInFromTop 0.8s ease-out forwards;
            }
            
            .animate-slide-bottom {
              animation: slideInFromBottom 0.8s ease-out forwards;
            }
            
            .animate-fade-in {
              animation: fadeIn 0.8s ease-out forwards;
            }
            
            .animate-glow {
              animation: glow 2s ease-in-out infinite;
            }
            
            .animate-delay-100 {
              animation-delay: 0.1s;
            }
            
            .animate-delay-200 {
              animation-delay: 0.2s;
            }
            
            .animate-delay-300 {
              animation-delay: 0.3s;
            }
            
            .animate-delay-400 {
              animation-delay: 0.4s;
            }
            
            .animate-delay-500 {
              animation-delay: 0.5s;
            }
            
            .animate-delay-600 {
              animation-delay: 0.6s;
            }
          `
        }} />

        {/* Logo Only - Top Left */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
          <div className={`flex items-center ${isLoaded ? 'animate-slide-top animate-delay-100' : 'opacity-0'}`}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white p-1 shadow-lg">
              <img
                src="/image-uploads/f80b99b9-ff76-4acc-912c-49d8bd435a7b.png"
                alt="DUPulse Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center h-full sm:min-h-[calc(100vh-5rem)] px-4 sm:px-6 w-screen py-4 sm:py-8">
          <div className="text-center w-full max-w-4xl">

            {/* Coming Soon Pill - Now with Circular Animation */}
            <div className={`mb-6 sm:mb-8 flex justify-center ${isLoaded ? 'animate-fade-in animate-delay-300' : 'opacity-0'}`}>
              <div className="relative">
                {/* Circular Text Animation */}
                <CircularText
                  text="•COMING SOON•COMING SOON"
                  spinDuration={15}
                  onHover="speedUp"
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 text-pink-400 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl"
                />
                {/* Center icon/text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-full bg-white p-1 shadow-lg">
                    <img
                      src="/image-uploads/f80b99b9-ff76-4acc-912c-49d8bd435a7b.png"
                      alt="DUPulse Logo"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Headline */}
            <div className={`mb-6 ${isLoaded ? 'animate-slide-bottom animate-delay-400' : 'opacity-0'}`}>
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-white px-2 sm:px-0">
                DUPulse - The social heart of Durham student life
              </h1>
            </div>

            {/* Subheading */}
            <p className={`text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 leading-relaxed mb-8 sm:mb-12 max-w-3xl mx-auto px-4 sm:px-0 ${isLoaded ? 'animate-fade-in animate-delay-500' : 'opacity-0'}`}>
              Connect with societies, discover events, find exclusive deals, and experience everything Durham University has to offer in one place!
            </p>

            {/* Circular Countdown Timer */}
            <div className={`mb-12 ${isLoaded ? 'animate-fade-in animate-delay-600' : 'opacity-0'}`}>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8">
                {/* Days */}
                <div className="relative">
                  <svg className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgba(139, 92, 246, 0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="url(#gradient-days)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - (timeLeft.days % 365) / 365)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient-days" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg sm:text-2xl lg:text-3xl font-bold text-pink-400">{timeLeft.days}</span>
                    <span className="text-xs sm:text-sm text-gray-400">DAYS</span>
                  </div>
                </div>

                {/* Hours */}
                <div className="relative">
                  <svg className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgba(139, 92, 246, 0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="url(#gradient-hours)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - timeLeft.hours / 24)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient-hours" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg sm:text-2xl lg:text-3xl font-bold text-purple-400">{timeLeft.hours}</span>
                    <span className="text-xs sm:text-sm text-gray-400">HOURS</span>
                  </div>
                </div>

                {/* Minutes */}
                <div className="relative">
                  <svg className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgba(139, 92, 246, 0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="url(#gradient-minutes)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - timeLeft.minutes / 60)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient-minutes" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg sm:text-2xl lg:text-3xl font-bold text-pink-400">{timeLeft.minutes}</span>
                    <span className="text-xs sm:text-sm text-gray-400">MIN</span>
                  </div>
                </div>

                {/* Seconds */}
                <div className="relative">
                  <svg className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgba(139, 92, 246, 0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="url(#gradient-seconds)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - timeLeft.seconds / 60)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient-seconds" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg sm:text-2xl lg:text-3xl font-bold text-purple-400">{timeLeft.seconds}</span>
                    <span className="text-xs sm:text-sm text-gray-400">SEC</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

interface FeaturePreviewProps {
  onJoinWaitlist?: (() => void) | null;
}

const FeaturePreview: React.FC<FeaturePreviewProps> = ({ onJoinWaitlist }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.3, // Trigger when 30% of the section is visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="min-h-screen w-screen flex flex-col items-center justify-center text-center px-6 py-20 relative"
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideInFromBottom {
            0% {
              transform: translateY(50px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          @keyframes fadeInUp {
            0% {
              transform: translateY(30px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }
          
          .slide-in-bottom {
            animation: slideInFromBottom 0.8s ease-out forwards;
          }
          
          .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
          
          .animate-pulse-slow {
            animation: pulse 3s ease-in-out infinite;
          }
          
          .animate-delay-1 {
            animation-delay: 0.2s;
          }
          
          .animate-delay-2 {
            animation-delay: 0.4s;
          }
          
          .animate-delay-3 {
            animation-delay: 0.6s;
          }
          
          .animate-delay-4 {
            animation-delay: 0.8s;
          }
        `
      }} />

      {/* What You'll Learn Section */}
      <div className="max-w-5xl mx-auto">

        {/* Section Title */}
        <div className={`mb-16 ${isVisible ? 'slide-in-bottom' : 'opacity-0'}`}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <div
              className="text-gray-300 bg-clip-text inline-block animate-shine"
              style={{
                backgroundImage: "linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 0) 60%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                animationDuration: "3s",
              }}
            >
              Your Complete Durham University Experience
            </div>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to make the most of your time at Durham University
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">

          {/* Feature 1 */}
          <div className={`bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm ${isVisible ? 'fade-in-up animate-delay-1' : 'opacity-0'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Society Event Creation</h3>
            <p className="text-gray-400">Societies can easily add and manage their own events, reaching all Durham University students</p>
          </div>

          {/* Feature 2 */}
          <div className={`bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm ${isVisible ? 'fade-in-up animate-delay-2' : 'opacity-0'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Event Management</h3>
            <p className="text-gray-400">Discover campus events, RSVP easily, and never miss out on what's happening at Durham</p>
          </div>

          {/* Feature 3 */}
          <div className={`bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm ${isVisible ? 'fade-in-up animate-delay-3' : 'opacity-0'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-purple-500 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Exclusive Deals</h3>
            <p className="text-gray-400">Access student discounts and exclusive offers from local Durham businesses and partners</p>
          </div>

        </div>

        {/* Tech Stack */}
        <div className={`mb-12 ${isVisible ? 'fade-in-up animate-delay-4' : 'opacity-0'}`}>
          <h3 className="text-2xl font-bold mb-8">
            <div
              className="text-gray-300 bg-clip-text inline-block animate-shine"
              style={{
                backgroundImage: "linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 0) 60%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                animationDuration: "3s",
              }}
            >
              What Makes DUPulse Special
            </div>
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {['Society Integration', 'Personal Timetable', 'Student Deals', 'RSVP System', 'Durham Focus', 'Mobile Friendly', 'Real-time Updates', 'Community Driven'].map((tech, index) => (
              <span key={tech} className="px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-full text-gray-300 text-sm font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        {onJoinWaitlist && (
          <div className={`${isVisible ? 'slide-in-bottom animate-delay-4' : 'opacity-0'}`}>
            <button
              onClick={onJoinWaitlist}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-lg"
            >
              Join the Waitlist
            </button>
            <p className="text-gray-400 text-sm mt-4">
              Limited spots available • Launching for Durham University students
            </p>
          </div>
        )}

      </div>
    </section>
  );
};

interface EarlyAccessSignupProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: (data: {
    email: string;
    name: string;
    userType: string;
    referralCode?: string;
    joinWhatsApp: boolean;
  }) => Promise<void>;
}

const EarlyAccessSignup: React.FC<EarlyAccessSignupProps> = ({ isOpen, onClose, onSignup }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState('student');
  const [referralCode, setReferralCode] = useState('');
  const [joinWhatsApp, setJoinWhatsApp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [whatsAppLink, setWhatsAppLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSignup({
        email,
        name,
        userType,
        referralCode: referralCode || undefined,
        joinWhatsApp
      });
      setIsSuccess(true);
      // Generate a shareable referral code for the user
      setGeneratedCode(name.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase());

      // Set WhatsApp group link if they opted in
      if (joinWhatsApp) {
        setWhatsAppLink('https://chat.whatsapp.com/your-group-link-here'); // Replace with actual link
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setName('');
    setUserType('student');
    setReferralCode('');
    setJoinWhatsApp(false);
    setIsLoading(false);
    setIsSuccess(false);
    setGeneratedCode('');
    setWhatsAppLink('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="max-w-md w-full bg-gradient-to-br from-purple-900 to-black border border-purple-700/50 relative shadow-2xl rounded-2xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold transition-colors"
          >
            ×
          </button>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Welcome {name}! 🎉</CardTitle>
            <CardDescription className="text-gray-400">
              You're now on the exclusive early access list for DUPulse
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-2">Your referral code:</p>
              <p className="text-2xl font-bold text-blue-400 tracking-wider">{generatedCode}</p>
              <p className="text-xs text-gray-500 mt-2">Share for VIP perks!</p>
            </div>

            {joinWhatsApp && whatsAppLink && (
              <div className="bg-green-900/20 border border-green-600/30 rounded-xl p-4">
                <p className="text-sm text-green-400 mb-3">🚀 Join our pre-launch community!</p>
                <a
                  href={whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Join WhatsApp Group 💬
                </a>
                <p className="text-xs text-green-400 mt-2">
                  Get behind-the-scenes updates, early feature previews, and connect with other Durham students!
                </p>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full bg-gray-800/50 border-gray-600/50 text-white hover:bg-gray-700/50"
              onClick={() => navigator.clipboard.writeText(`Join me on DUPulse with code: ${generatedCode}`)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Your Code
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="max-w-sm w-full bg-gradient-to-br from-purple-900 to-black border border-purple-700/50 relative shadow-2xl rounded-2xl">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl font-light w-6 h-6 flex items-center justify-center transition-colors"
        >
          ×
        </button>
        <CardHeader className="text-center pb-4 pt-6">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white mb-1">Join the Waitlist</CardTitle>
          <CardDescription className="text-sm text-gray-200">
            Get early access to DUPulse
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 text-center border-gray-600/40 rounded-lg bg-gray-800/70 text-white placeholder-gray-200 focus:bg-gray-800/90 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <Input
                type="email"
                placeholder="your@durham.ac.uk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-center border-gray-600/40 rounded-lg bg-gray-800/70 text-white placeholder-gray-200 focus:bg-gray-800/90 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger className="h-12 border-gray-600/40 rounded-lg bg-gray-800/70 text-white focus:border-blue-500">
                  <SelectValue placeholder="Durham Student" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600/40">
                  <SelectItem value="student" className="text-white hover:bg-gray-700">Durham Student</SelectItem>
                  <SelectItem value="society" className="text-white hover:bg-gray-700">Society Representative</SelectItem>
                  <SelectItem value="partner" className="text-white hover:bg-gray-700">Local Business Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Input
                placeholder="Referral code (optional)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="h-12 text-center border-gray-600/40 rounded-lg bg-gray-800/70 text-white placeholder-gray-200 focus:bg-gray-800/90 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-600/30">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={joinWhatsApp}
                  onChange={(e) => setJoinWhatsApp(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-500 rounded"
                />
                <div className="text-xs">
                  <span className="font-semibold text-white text-sm">
                    Join our Durham student community 💬
                  </span>
                  <p className="text-gray-200 mt-1 leading-relaxed">
                    Get exclusive updates and connect with other Durham students!
                  </p>
                </div>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Join the Waitlist
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-300 leading-relaxed">
              🚀 <span className="font-semibold">Be among the first</span> to experience
              <br />
              <span className="text-purple-400 font-semibold">the future of Durham student life</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { CountdownTimer, FeaturePreview, EarlyAccessSignup };
