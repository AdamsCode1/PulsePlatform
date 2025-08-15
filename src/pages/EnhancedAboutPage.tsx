import React from 'react';
import { Users, Calendar, Zap, Heart, Globe, Shield, Sparkles, Target, MessageSquare, Building, Rocket, Award } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import HeroWithStats from '../components/react-bits/HeroWithStats';
import FeatureSection from '../components/react-bits/FeatureSection';
import StatsShowcase from '../components/react-bits/StatsShowcase';
import TeamSection from '../components/react-bits/TeamSection';

const EnhancedAboutPage = () => {
  // Hero stats data
  const heroStats = [
    {
      value: '200+',
      label: 'Societies Connected',
      icon: <Building className="h-6 w-6 text-white" />,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    },
    {
      value: '10K+',
      label: 'Active Students',
      icon: <Users className="h-6 w-6 text-white" />,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
    },
    {
      value: '500+',
      label: 'Monthly Events',
      icon: <Calendar className="h-6 w-6 text-white" />,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
    },
    {
      value: '24/7',
      label: 'Platform Support',
      icon: <Heart className="h-6 w-6 text-white" />,
      color: 'bg-gradient-to-r from-pink-500 to-pink-600',
    },
  ];

  // Features data
  const features = [
    {
      title: 'Smart Event Management',
      description: 'Seamlessly organize, promote, and manage campus events with our intelligent scheduling system that prevents conflicts and maximizes attendance.',
      icon: Calendar,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    },
    {
      title: 'Community Building',
      description: 'Foster meaningful connections within your campus community through integrated social features and collaborative spaces.',
      icon: Users,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
    },
    {
      title: 'Real-time Communication',
      description: 'Keep everyone informed with instant notifications, announcements, and interactive messaging systems that connect students and societies.',
      icon: MessageSquare,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
    },
    {
      title: 'Analytics & Insights',
      description: 'Make data-driven decisions with comprehensive analytics on engagement, attendance, and community growth metrics.',
      icon: Target,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
    },
    {
      title: 'Secure & Reliable',
      description: 'Built with enterprise-grade security and reliability to protect your community data and ensure 99.9% uptime.',
      icon: Shield,
      color: 'bg-gradient-to-r from-red-500 to-red-600',
    },
    {
      title: 'Global Accessibility',
      description: 'Designed for inclusivity with multi-language support, accessibility features, and responsive design for all devices.',
      icon: Globe,
      color: 'bg-gradient-to-r from-cyan-500 to-cyan-600',
    },
  ];

  // Additional stats for showcase
  const showcaseStats = [
    {
      value: '99.9%',
      label: 'Uptime',
      icon: Rocket,
      description: 'Platform reliability you can count on',
      trend: { value: '+0.1%', isPositive: true },
    },
    {
      value: '4.9/5',
      label: 'User Rating',
      icon: Award,
      description: 'Based on 2,000+ student reviews',
      trend: { value: '+0.2', isPositive: true },
    },
    {
      value: '50+',
      label: 'Universities',
      icon: Building,
      description: 'Trusted by institutions worldwide',
      trend: { value: '+12', isPositive: true },
    },
    {
      value: '<3s',
      label: 'Load Time',
      icon: Zap,
      description: 'Lightning-fast performance',
      trend: { value: '-0.5s', isPositive: true },
    },
  ];

  // Team members (you can add real data later)
  const teamMembers = [
    {
      name: 'Alex Johnson',
      role: 'Founder & CEO',
      bio: 'Passionate about revolutionizing campus life through technology. Former Durham student with 10+ years in EdTech.',
      imageUrl: '/image-uploads/about_us2.jpeg',
    },
    {
      name: 'Sarah Chen',
      role: 'Head of Product',
      bio: 'Designer-turned-product-leader focused on creating intuitive experiences for student communities.',
      imageUrl: '/image-uploads/about_us3.jpeg',
    },
    {
      name: 'Mike Rodriguez',
      role: 'CTO',
      bio: 'Full-stack engineer and former university IT director. Believes in building scalable solutions for education.',
      imageUrl: '/image-uploads/about_us1.jpeg',
    },
  ];

  const testimonial = {
    quote: 'PulsePlatform has transformed how our university community connects and engages. The results speak for themselves - higher event attendance, stronger society engagement, and a more vibrant campus life.',
    author: 'Dr. Emma Thompson',
    role: 'Director of Student Experience, Durham University',
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {/* Hero Section with Stats */}
      <HeroWithStats
        title="About PulsePlatform"
        subtitle="Transforming Campus Life"
        description="We're building the future of student engagement and campus life through innovative technology solutions that connect communities and create meaningful experiences."
        imageUrl="/image-uploads/about_us1.jpeg"
        stats={heroStats}
        ctaText="Join Our Community"
        onCtaClick={() => window.location.href = '/signup'}
      />

      {/* Mission Statement */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center rounded-full bg-blue-100 px-6 py-3 text-sm font-medium text-blue-700">
              <Sparkles className="mr-2 h-4 w-4" />
              Our Mission
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Empowering Connected Campus Communities
            </h2>
            
            <div className="prose prose-lg prose-blue max-w-none">
              <p className="text-xl text-gray-700 leading-relaxed">
                <span className="text-6xl font-bold text-blue-600 float-left mr-4 mt-2 leading-none">P</span>
                ulsePlatform is more than just software—we're catalysts for campus transformation. Our comprehensive platform bridges the gap between students, societies, and institutions, creating a unified ecosystem where everyone can thrive.
              </p>
              
              <p className="text-lg text-gray-600 leading-relaxed mt-8">
                From seamless event management to fostering authentic connections, we provide the digital infrastructure that modern educational communities need to succeed. Our commitment to innovation, accessibility, and user-centric design ensures that every member of your campus community can participate, engage, and grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeatureSection
        title="Why Choose PulsePlatform?"
        description="We've built every feature with students, societies, and institutions in mind, creating a comprehensive solution that grows with your community."
        features={features}
      />

      {/* Stats Showcase */}
      <StatsShowcase
        title="Trusted by Communities Worldwide"
        subtitle="Our platform delivers measurable results and exceptional experiences."
        stats={showcaseStats}
        variant="glass"
      />

      {/* Team Section */}
      <TeamSection
        title="Meet Our Team"
        subtitle="Passionate educators, technologists, and community builders working together to transform campus life."
        members={teamMembers}
        testimonial={testimonial}
      />

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Campus?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of students and hundreds of institutions already using PulsePlatform to create vibrant, connected communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-base font-semibold text-blue-600 shadow-lg hover:bg-gray-50 transition-colors">
              <Users className="mr-2 h-5 w-5" />
              Get Started Today
            </button>
            <button className="inline-flex items-center justify-center rounded-full border-2 border-white px-8 py-3 text-base font-semibold text-white hover:bg-white hover:text-blue-600 transition-colors">
              <Calendar className="mr-2 h-5 w-5" />
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EnhancedAboutPage;
