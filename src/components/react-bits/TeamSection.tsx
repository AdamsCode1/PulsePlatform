import React from 'react';
import { Quote } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

interface TeamSectionProps {
  title: string;
  subtitle: string;
  members: TeamMember[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
}

const TeamSection: React.FC<TeamSectionProps> = ({
  title,
  subtitle,
  members,
  testimonial,
}) => {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="mt-6 text-xl leading-8 text-gray-600">
            {subtitle}
          </p>
        </div>

        {/* Team Members */}
        {members.length > 0 && (
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 mb-20">
            {members.map((member, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-2"
              >
                {/* Member Image */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="relative h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                    />
                  </div>
                </div>

                {/* Member Info */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium text-sm uppercase tracking-wide mb-4">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Testimonial */}
        {testimonial && (
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-5"></div>
            
            <div className="relative bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
              <div className="text-center max-w-4xl mx-auto">
                {/* Quote Icon */}
                <div className="flex justify-center mb-8">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                    <Quote className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-2xl font-medium text-gray-900 italic leading-relaxed mb-8">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-blue-600 font-medium">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TeamSection;
