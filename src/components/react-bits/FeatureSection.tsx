import React from 'react';

interface Feature {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface FeatureSectionProps {
  title: string;
  description: string;
  features: Feature[];
}

const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  description,
  features,
}) => {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="mt-6 text-xl leading-8 text-gray-600">
            {description}
          </p>
          <div className="mt-8 flex justify-center">
            <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-8 transition-all hover:shadow-2xl hover:-translate-y-1 border border-gray-200/50"
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 opacity-50 transition-all group-hover:scale-110"></div>
              
              {/* Icon */}
              <div className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color} mb-6 transition-transform group-hover:scale-110`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Hover effect border */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-blue-200 transition-all"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
