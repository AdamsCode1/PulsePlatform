import React from 'react';
import { Loader2, Calendar, Users, Gift } from 'lucide-react';

interface EnhancedLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  type?: 'default' | 'pulse' | 'dots' | 'card' | 'inline';
  text?: string;
  context?: 'events' | 'deals' | 'users' | 'general';
}

const EnhancedLoadingSpinner = ({ 
  size = 'md', 
  type = 'default', 
  text,
  context = 'general' 
}: EnhancedLoadingSpinnerProps) => {
  const sizeClasses = {
    sm: { spinner: 'w-4 h-4', text: 'text-sm', container: 'gap-2' },
    md: { spinner: 'w-6 h-6', text: 'text-base', container: 'gap-3' },
    lg: { spinner: 'w-8 h-8', text: 'text-lg', container: 'gap-4' },
    xl: { spinner: 'w-12 h-12', text: 'text-xl', container: 'gap-6' }
  };

  const contextConfig = {
    events: { 
      icon: Calendar, 
      defaultText: 'Loading events...',
      color: 'text-purple-600'
    },
    deals: { 
      icon: Gift, 
      defaultText: 'Loading deals...',
      color: 'text-pink-600'
    },
    users: { 
      icon: Users, 
      defaultText: 'Loading users...',
      color: 'text-blue-600'
    },
    general: { 
      icon: Loader2, 
      defaultText: 'Loading...',
      color: 'text-gray-600'
    }
  };

  const config = contextConfig[context];
  const sizes = sizeClasses[size];

  if (type === 'inline') {
    return (
      <div className={`flex items-center ${sizes.container}`}>
        <Loader2 className={`${sizes.spinner} ${config.color} animate-spin`} />
        {text && <span className={`${sizes.text} ${config.color} font-medium`}>{text}</span>}
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative">
          <div className={`${sizes.spinner} bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse`} />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-ping opacity-75" />
        </div>
        {(text || config.defaultText) && (
          <p className={`mt-4 ${sizes.text} text-gray-600 font-medium animate-pulse`}>
            {text || config.defaultText}
          </p>
        )}
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="flex space-x-2 mb-4">
          <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
        {(text || config.defaultText) && (
          <p className={`${sizes.text} text-gray-600 font-medium`}>
            {text || config.defaultText}
          </p>
        )}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-8 bg-gradient-to-br from-white to-purple-50/30 rounded-2xl border border-purple-100">
        <div className="relative mb-6">
          <div className={`${sizes.spinner} mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center`}>
            <config.icon className={`${size === 'xl' ? 'w-6 h-6' : 'w-4 h-4'} text-white animate-spin`} />
          </div>
          
          {/* Floating decorative elements */}
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.5s'}} />
          <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-bounce" style={{animationDelay: '1s'}} />
        </div>
        
        {(text || config.defaultText) && (
          <p className={`${sizes.text} text-gray-700 font-medium text-center`}>
            {text || config.defaultText}
          </p>
        )}
        
        {/* Progress indicator */}
        <div className="mt-4 w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  // Default type
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <Loader2 className={`${sizes.spinner} ${config.color} animate-spin`} />
        
        {/* Outer ring */}
        <div className={`absolute inset-0 ${sizes.spinner} border-2 border-gray-200 rounded-full`} />
        <div className={`absolute inset-0 ${sizes.spinner} border-2 border-transparent border-t-purple-600 rounded-full animate-spin`} style={{animationDuration: '0.8s'}} />
      </div>
      
      {(text || config.defaultText) && (
        <p className={`mt-4 ${sizes.text} text-gray-600 font-medium animate-pulse`}>
          {text || config.defaultText}
        </p>
      )}
    </div>
  );
};

export default EnhancedLoadingSpinner;
