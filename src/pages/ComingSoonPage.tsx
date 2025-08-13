import React from 'react';
import { CountdownTimer, FeaturePreview, EarlyAccessSignup } from '@/components/ComingSoonComponents';
import { useToast } from '@/hooks/use-toast';

const ComingSoonPage: React.FC = () => {
  const { toast } = useToast();

  const handleEarlyAccessSignup = async (data: { 
    email: string; 
    userType: string; 
    referralCode?: string 
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
          user_type: data.userType,
          referred_by: data.referralCode || null,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section with Countdown */}
      <div className="container mx-auto px-4">
        <CountdownTimer launchDate="2025-09-15T09:00:00" />
      </div>

      {/* Feature Preview */}
      <FeaturePreview />

      {/* Early Access Signup */}
      <div className="container mx-auto px-4">
        <EarlyAccessSignup onSignup={handleEarlyAccessSignup} />
      </div>

      {/* Development Progress Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Behind the Scenes</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-blue-600">What We're Building</h3>
              <ul className="text-left space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  User authentication & profiles
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Event discovery & RSVP system
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Society management tools
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Partner integration platform
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full mr-3"></span>
                  Mobile app (iOS & Android)
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-purple-600">Community Growth</h3>
              <div className="text-left space-y-3">
                <div className="flex justify-between">
                  <span>Beta Testers</span>
                  <span className="font-semibold">50+ students</span>
                </div>
                <div className="flex justify-between">
                  <span>Partner Societies</span>
                  <span className="font-semibold">15+ confirmed</span>
                </div>
                <div className="flex justify-between">
                  <span>Local Businesses</span>
                  <span className="font-semibold">8+ partnerships</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-400 mb-4">
            Built with ❤️ for the Durham University community
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="mailto:hello@pulseplatform.com" className="hover:text-blue-400 transition-colors">
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
