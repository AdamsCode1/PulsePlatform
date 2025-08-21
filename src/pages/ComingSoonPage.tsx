import React, { useState } from 'react';
import { CountdownTimer, FeaturePreview, EarlyAccessSignup } from '@/components/ComingSoonComponents';
import { useToast } from '@/hooks/use-toast';
import Aurora from '@/blocks/Backgrounds/Aurora/Aurora';

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

  const handleEarlyAccessSignup = async (data: {
    email: string;
    name: string;
    userType: string;
    referralCode?: string;
    joinWhatsApp: boolean;
  }) => {
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      // Use the unified API endpoint instead of direct Supabase
      const response = await fetch('/api/unified/early-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          email: data.email,
          name: data.name,
          user_type: data.userType,
          referred_by: data.referralCode || null,
          join_whatsapp: data.joinWhatsApp,
          metadata: {
            signup_source: 'coming_soon_page',
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast({
            title: "Already signed up!",
            description: "You're already on our waitlist. We'll notify you when we launch!",
            variant: "default"
          });
          return;
        }
        throw new Error(result.message || 'Signup failed');
      }

      toast({
        title: "Welcome to the community!",
        description: `You're #${result.position_in_queue} on the list! Check your email for updates.`,
        variant: "default"
      });

    } catch (error: any) {
      console.error('Signup error:', error);

      // Don't let network errors crash the page
      if (error.name === 'AbortError') {
        toast({
          title: "Request timed out",
          description: "Please check your connection and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Oops! Something went wrong",
          description: error.message || "Please try again or contact us if the problem persists.",
          variant: "destructive"
        });
      }

      // Don't re-throw the error to prevent crashes
      return;
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
        {/* Join Waitlist Button - Top Right */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
          <button
            onClick={() => setIsSignupModalOpen(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base border border-pink-200 backdrop-blur-sm"
          >
            Join the waitlist
          </button>
        </div>

        {/* First Part - Countdown Timer */}
        <div className="h-screen relative">
          <CountdownTimer
            launchDate="2025-09-15T09:00:00"
            onError={() => setHasError(true)}
          />

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
          <FeaturePreview onJoinWaitlist={null} />

          {/* Buttons Container - Side by side positioning */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex space-x-4">
            {/* Join Waitlist Button - Left side */}
            <button
              onClick={() => setIsSignupModalOpen(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base border border-pink-200 backdrop-blur-sm"
            >
              Join the Waitlist
            </button>

            {/* Sneak Peak Button - Right side */}
            <button
              onClick={() => setIsSneakPeakModalOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base border border-purple-200 backdrop-blur-sm"
            >
              🔍 Sneak Peak
            </button>
          </div>
        </div>
      </div>      {/* Early Access Signup Modal */}
      <EarlyAccessSignup
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSignup={handleEarlyAccessSignup}
      />

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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-400 mb-4">
            Built with ❤️ for the Durham University student community
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="mailto:hello@dupulse.com" className="hover:text-blue-400 transition-colors">
              Contact Us
            </a>
            <span className="text-gray-600">|</span>
            <a href="/privacy" className="hover:text-blue-400 transition-colors">
              Privacy Policy
            </a>
            <span className="text-gray-600">|</span>
            <a href="/terms" className="hover:text-blue-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ComingSoonPage;
