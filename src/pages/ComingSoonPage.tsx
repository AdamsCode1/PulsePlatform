import React, { useState } from 'react';
import { CountdownTimer, FeaturePreview, EarlyAccessSignup } from '@/components/ComingSoonComponents';
import { useToast } from '@/hooks/use-toast';
import Aurora from '@/blocks/Backgrounds/Aurora/Aurora';
import { supabase } from '@/lib/supabaseClient';

const ComingSoonPage: React.FC = () => {
  const { toast } = useToast();
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isSneakPeakModalOpen, setIsSneakPeakModalOpen] = useState(false);
  const [sneakPeakPassword, setSneakPeakPassword] = useState('');

  // Add error boundary for countdown
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <button
            onClick={() => setHasError(false)}
            className="bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleEarlyAccessSignup = async (data: { email: string; name: string; }) => {
    try {
      const name = data.name.trim();
      const email = data.email.trim().toLowerCase();
      const { error } = await supabase
        .from('waitlist')
        .insert([{ name, email }]);

      if (error) {
        if ((error as any).code === '23505' || /duplicate|unique/i.test((error as any).message || '')) {
          toast({
            title: 'Already signed up!',
            description: "You're already on our waitlist. We'll notify you when we launch!",
            variant: 'default',
          });
          return;
        }
        throw new Error((error as any).message || 'Signup failed');
      }

      toast({
        title: 'Welcome to the waitlist!',
        description: "You're on the list! Check your email for updates.",
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Oops! Something went wrong',
        description: error.message || 'Please try again or contact us if the problem persists.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleSneakPeakSubmit = () => {
    if (sneakPeakPassword === 'pulse2025user') {
      toast({
        title: "Access granted!",
        description: "Welcome to DUPulse!",
        variant: "default"
      });
      // Redirect to main DUPulse platform after a brief delay
      setTimeout(() => {
        window.location.href = '/platform';
      }, 1000);
    } else {
      toast({
        title: "Access denied",
        description: "Incorrect password. Please try again.",
        variant: "destructive"
      });
      setSneakPeakPassword('');
    }
  };

  const handleSneakPeakKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSneakPeakSubmit();
    }
  };

  return (
    <div className="w-screen overflow-x-hidden bg-gradient-to-br from-black via-gray-900 to-purple-900" style={{ margin: 0, padding: 0 }}>
      {/* Unified Aurora Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <Aurora
          colorStops={["#ff87dd", "#f9a8d4", "#fce7f3"]}
          amplitude={1.2}
          blend={0.6}
          speed={0.8}
        />
      </div>

      {/* Combined Section - Hero with Countdown and Feature Preview (Full Screen) */}
      <div className="w-screen min-h-screen relative z-10">
        {/* Early Adopters Ribbon - Top with 30% opacity - WhatsApp redirect */}
        <div className="absolute top-0 left-0 right-0 z-30">
          <button
            onClick={() => window.open('https://chat.whatsapp.com/EdHwSjET7lcBxhpjQBf1N7', '_blank')}
            className="w-full bg-gradient-to-r from-pink-500/30 via-purple-600/30 to-pink-500/30 backdrop-blur-sm text-white py-3 px-4 text-sm sm:text-base font-semibold hover:from-pink-600/40 hover:via-purple-700/40 hover:to-pink-600/40 transition-all duration-300 border-b border-pink-200/5"
          >
            🚀 Click to join early adopters groupchat - Get exclusive updates & behind-the-scenes access
          </button>
        </div>

        {/* First Part - Countdown Timer */}
        <div className="h-screen relative pt-12">
          <CountdownTimer
            launchDate="2025-09-15T09:00:00"
            onJoinWaitlist={() => setIsSignupModalOpen(true)}
            onSneakPeak={() => setIsSneakPeakModalOpen(true)}
            onError={() => setHasError(true)}
          />

          {/* Buttons now rendered within CountdownTimer for consistent placement */}

          {/* Scroll Indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center animate-bounce">
            <svg
              className="w-6 h-6 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Second Part - Feature Preview */}
        <div className="relative">
          <FeaturePreview />
        </div>
      </div>
      {/* Early Access Signup Modal */}
      {isSignupModalOpen && (
        <EarlyAccessSignup
          onSignup={handleEarlyAccessSignup}
          isOpen={isSignupModalOpen}
          onClose={() => setIsSignupModalOpen(false)}
        />
      )}
      {/* Sneak Peak Password Modal */}
      {isSneakPeakModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white/95 to-purple-50/95 rounded-2xl p-8 max-w-md w-full border border-purple-200 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Sneak Peak Access
              </h2>
              <p className="text-purple-600">
                Enter the password to get early access to DUPulse
              </p>
            </div>
            <div className="space-y-4">
              <input
                type="password"
                value={sneakPeakPassword}
                onChange={(e) => setSneakPeakPassword(e.target.value)}
                onKeyPress={handleSneakPeakKeyPress}
                placeholder="Enter password..."
                className="w-full px-4 py-3 rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                autoFocus
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleSneakPeakSubmit}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                >
                  Access DUPulse
                </button>
                <button
                  onClick={() => {
                    setIsSneakPeakModalOpen(false);
                    setSneakPeakPassword('');
                  }}
                  className="px-6 py-3 text-purple-600 hover:text-purple-800 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComingSoonPage;
