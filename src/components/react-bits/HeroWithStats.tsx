import React from 'react';
import { ArrowRight, Users, Calendar, Zap, Heart } from 'lucide-react';

interface Stat {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface HeroWithStatsProps {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  stats: Stat[];
  ctaText?: string;
  onCtaClick?: () => void;
}

const HeroWithStats: React.FC<HeroWithStatsProps> = ({
  title,
  subtitle,
  description,
  imageUrl,
  stats,
  ctaText = "Get Started",
  onCtaClick,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Content */}
          <div className="flex flex-col justify-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 w-fit">
              <Zap className="mr-2 h-4 w-4" />
              {subtitle}
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            {/* Description */}
            <p className="text-xl leading-8 text-gray-600 max-w-lg">
              {description}
            </p>

            {/* CTA Button */}
            {onCtaClick && (
              <button
                onClick={onCtaClick}
                className="group inline-flex items-center rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 w-fit"
              >
                {ctaText}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              {stats.slice(0, 4).map((stat, index) => (
                <div
                  key={index}
                  className="group cursor-default rounded-2xl bg-white/70 backdrop-blur-sm p-6 shadow-lg transition-all hover:shadow-xl hover:bg-white/80 border border-white/20"
                >
                  <div className={`inline-flex rounded-lg p-2 ${stat.color} mb-3`}>
                    {stat.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900 group-hover:scale-105 transition-transform">
                      {stat.value}
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-200 to-purple-200 blur-2xl opacity-20"></div>
              <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-blue-200/30 blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-purple-200/30 blur-3xl"></div>
              
              {/* Main image */}
              <img
                src={imageUrl}
                alt="Team collaboration"
                className="relative rounded-3xl shadow-2xl w-full max-w-lg h-auto object-cover ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroWithStats;
