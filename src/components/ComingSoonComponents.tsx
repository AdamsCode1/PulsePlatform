import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Users, Calendar, Sparkles, Clock, Mail, Share2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface CountdownTimerProps {
  launchDate: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ launchDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

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
    <div className="text-center py-20">
      <div className="flex items-center justify-center mb-8">
        <Rocket className="w-16 h-16 text-blue-500 mr-4" />
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          PulsePlatform
        </h1>
      </div>
      
      <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
        The next-generation platform connecting Durham University students, societies, and local partners. 
        <br />
        <span className="font-semibold text-blue-600">Something amazing is coming...</span>
      </p>
      
      <div className="flex justify-center space-x-8 mb-12">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <Card key={unit} className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-blue-600">{value}</div>
              <div className="text-sm uppercase text-gray-500 font-medium">{unit}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

interface FeaturePreviewProps {}

const FeaturePreview: React.FC<FeaturePreviewProps> = () => {
  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-blue-500" />,
      title: "Smart Event Discovery",
      description: "AI-powered recommendations tailored to your interests and schedule",
      status: "Coming Soon"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: "Society Integration",
      description: "Seamless connection between students and university societies",
      status: "Ready"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-green-500" />,
      title: "Local Partnerships",
      description: "Exclusive deals and opportunities from Durham businesses",
      status: "Beta"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">What's Coming</h2>
        <p className="text-xl text-gray-600 text-center mb-16">
          A complete ecosystem designed for the Durham University community
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  {feature.icon}
                  <Badge variant={feature.status === 'Ready' ? 'default' : 'secondary'}>
                    {feature.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

interface EarlyAccessSignupProps {
  onSignup: (data: { 
    name: string;
    email: string;
  }) => Promise<void>;
}

const EarlyAccessSignup: React.FC<EarlyAccessSignupProps> = ({ onSignup }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSignup({ name, email });
      setIsSuccess(true);
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="max-w-md mx-auto bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Welcome {name}! 🎉</CardTitle>
          <CardDescription>
            You're now on the exclusive waitlist
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <section className="py-20">
      <div className="max-w-md mx-auto px-4">
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Join the Waitlist</CardTitle>
            <CardDescription>
              Get exclusive early access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="text-center"
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-center"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner variant="button" size="sm" text="Joining..." />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Join Waitlist
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export { CountdownTimer, FeaturePreview, EarlyAccessSignup };
