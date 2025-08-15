import React from 'react';

interface Stat {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

interface StatsShowcaseProps {
  title?: string;
  subtitle?: string;
  stats: Stat[];
  variant?: 'default' | 'gradient' | 'glass';
}

const StatsShowcase: React.FC<StatsShowcaseProps> = ({
  title,
  subtitle,
  stats,
  variant = 'default',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white';
      case 'glass':
        return 'bg-white/20 backdrop-blur-lg border border-white/30';
      default:
        return 'bg-white border border-gray-200';
    }
  };

  const sectionBg = variant === 'gradient' 
    ? 'bg-gradient-to-br from-blue-50 to-purple-50' 
    : variant === 'glass'
    ? 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100'
    : 'bg-gray-50';

  return (
    <section className={`py-24 ${sectionBg}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            {title && (
              <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${
                variant === 'gradient' ? 'text-gray-900' : 'text-gray-900'
              }`}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`mt-6 text-xl leading-8 ${
                variant === 'gradient' ? 'text-gray-700' : 'text-gray-600'
              }`}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-3xl p-8 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-2 ${getVariantClasses()}`}
            >
              {/* Background decoration */}
              {variant !== 'gradient' && (
                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 opacity-20 transition-all group-hover:scale-110"></div>
              )}

              {/* Content */}
              <div className="relative">
                {/* Icon */}
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-6 transition-transform group-hover:scale-110 ${
                  variant === 'gradient' 
                    ? 'bg-white/20 text-white' 
                    : variant === 'glass'
                    ? 'bg-white/30 text-gray-700'
                    : 'bg-blue-600 text-white'
                }`}>
                  <stat.icon className="h-6 w-6" />
                </div>

                {/* Value */}
                <div className="mb-2">
                  <span className={`text-4xl font-bold transition-all group-hover:scale-105 inline-block ${
                    variant === 'gradient' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </span>
                  {stat.trend && (
                    <span className={`ml-2 text-sm font-medium ${
                      stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend.isPositive ? '↗' : '↘'} {stat.trend.value}
                    </span>
                  )}
                </div>

                {/* Label */}
                <p className={`text-sm font-medium uppercase tracking-wider mb-2 ${
                  variant === 'gradient' ? 'text-white/80' : 'text-gray-600'
                }`}>
                  {stat.label}
                </p>

                {/* Description */}
                {stat.description && (
                  <p className={`text-sm leading-relaxed ${
                    variant === 'gradient' ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {stat.description}
                  </p>
                )}
              </div>

              {/* Hover effect border */}
              <div className={`absolute inset-0 rounded-3xl border-2 border-transparent transition-all ${
                variant === 'gradient' 
                  ? 'group-hover:border-white/30' 
                  : 'group-hover:border-blue-200'
              }`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsShowcase;
