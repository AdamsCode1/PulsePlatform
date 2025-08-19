
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'page' | 'inline' | 'button';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'page', 
  text, 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Full page loading variant
  if (variant === 'page') {
    return (
      <div className={cn(
        "flex flex-col justify-center items-center",
        "min-h-[calc(100vh-6rem)] w-full",
        "px-4 sm:px-6 lg:px-8 py-8",
        // Mobile-specific improvements
        "safe-area-inset-bottom safe-area-inset-top",
        className
      )}>
        <div className="relative flex flex-col items-center">
          <div className={cn(
            sizeClasses[size],
            "border-gray-200 border-t-pink-500 rounded-full animate-spin mb-4"
          )}></div>
          {text && (
            <div className="text-center max-w-xs sm:max-w-sm mx-auto px-2">
              <p className={cn(
                textSizeClasses[size],
                "text-gray-600 animate-pulse break-words leading-relaxed"
              )}>
                {text}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Inline loading variant (prevents layout shift)
  if (variant === 'inline') {
    return (
      <div className={cn(
        "inline-flex items-center justify-center",
        size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8',
        className
      )}>
        <div className={cn(
          size === 'sm' ? 'w-3 h-3 border' : size === 'md' ? 'w-4 h-4 border-2' : 'w-6 h-6 border-2',
          "border-gray-300 border-t-pink-500 rounded-full animate-spin"
        )}></div>
      </div>
    );
  }

  // Button loading variant
  if (variant === 'button') {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        <div className={cn(
          size === 'sm' ? 'w-3 h-3 border' : 'w-4 h-4 border-2',
          "border-white/30 border-t-white rounded-full animate-spin"
        )}></div>
        {text && (
          <span className={cn(textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // Default fallback
  return (
    <div className={cn(
      "flex justify-center items-center py-6 sm:py-12 px-4",
      className
    )}>
      <div className="relative">
        <div className={cn(
          sizeClasses[size],
          "border-gray-200 border-t-pink-500 rounded-full animate-spin"
        )}></div>
        {text && (
          <div className="mt-4 text-center">
            <p className={cn(
              textSizeClasses[size],
              "text-gray-600 animate-pulse"
            )}>
              {text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
