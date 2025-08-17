import React, { useState } from 'react';
import { CountdownTimer, FeaturePreview, EarlyAccessSignup } from '@/components/ComingSoonComponents';
import { useToast } from '@/hooks/use-toast';

const ComingSoonPage: React.FC = () => {
  const { toast } = useToast();
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const handleEarlyAccessSignup = async (data: {
    email: string;
    name: string;
    userType: string;
    referralCode?: string;
    joinWhatsApp: boolean;
  }) => {
    try {
      // Use the unified API endpoint instead of direct Supabase
      const response = await fetch('/api/unified/early-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      toast({
        title: "Oops! Something went wrong",
        description: error.message || "Please try again or contact us if the problem persists.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <div className="w-screen overflow-x-hidden" style={{ margin: 0, padding: 0 }}>
      {/* First Section - Hero with Countdown (Full Screen) */}
      <div className="w-screen h-screen">
        <CountdownTimer launchDate="2025-09-15T09:00:00" />
      </div>

      {/* Second Section - Feature Preview (Full Screen) */}
      <div className="w-screen">
        <FeaturePreview onJoinWaitlist={() => setIsSignupModalOpen(true)} />
      </div>

      {/* Early Access Signup Modal */}
      <EarlyAccessSignup
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSignup={handleEarlyAccessSignup}
      />

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
