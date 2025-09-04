import React from 'react';
import { Calendar, Search, Plus, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface EnhancedEmptyStateProps {
  title?: string;
  description?: string;
  type?: 'events' | 'deals' | 'search' | 'filter';
  onAction?: () => void;
  actionLabel?: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
}

const EnhancedEmptyState = ({
  title,
  description,
  type = 'events',
  onAction,
  actionLabel,
  showRefresh = false,
  onRefresh
}: EnhancedEmptyStateProps) => {
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'events':
        return {
          icon: Calendar,
          defaultTitle: 'No events found',
          defaultDescription: 'There are currently no events scheduled for this date. Check back later or explore other dates!',
          color: 'purple',
          suggestions: [
            'Try selecting a different date',
            'Check upcoming events',
            'Browse all categories'
          ]
        };
      case 'deals':
        return {
          icon: Search,
          defaultTitle: 'No deals available',
          defaultDescription: 'We\'re working hard to bring you amazing deals. Check back soon!',
          color: 'pink',
          suggestions: [
            'Sign up for deal notifications',
            'Check featured deals',
            'Browse different categories'
          ]
        };
      case 'search':
        return {
          icon: Search,
          defaultTitle: 'No results found',
          defaultDescription: 'We couldn\'t find anything matching your search. Try different keywords or filters.',
          color: 'blue',
          suggestions: [
            'Check your spelling',
            'Use different keywords',
            'Try broader search terms'
          ]
        };
      case 'filter':
        return {
          icon: RefreshCw,
          defaultTitle: 'No matches found',
          defaultDescription: 'No items match your current filters. Try adjusting your criteria.',
          color: 'green',
          suggestions: [
            'Clear some filters',
            'Try different categories',
            'Expand date range'
          ]
        };
      default:
        return {
          icon: Calendar,
          defaultTitle: 'Nothing here yet',
          defaultDescription: 'Content will appear here soon.',
          color: 'gray',
          suggestions: []
        };
    }
  };

  const config = getEmptyStateConfig();
  const IconComponent = config.icon;

  const colorClasses = {
    purple: {
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      button: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
    },
    pink: {
      gradient: 'from-pink-500 to-rose-500',
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      text: 'text-pink-600',
      button: 'from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700'
    },
    blue: {
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      button: 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
    },
    green: {
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      button: 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
    },
    gray: {
      gradient: 'from-gray-500 to-slate-500',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-600',
      button: 'from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700'
    }
  };

  const colors = colorClasses[config.color as keyof typeof colorClasses];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Card className={`max-w-md w-full ${colors.border} ${colors.bg} border-dashed`}>
        <CardContent className="text-center p-8">
          {/* Animated Icon */}
          <div className="relative mb-6">
            <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
              <IconComponent className="w-10 h-10 text-white" />
            </div>
            
            {/* Floating elements for visual interest */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.5s'}} />
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-bounce" style={{animationDelay: '1s'}} />
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {title || config.defaultTitle}
          </h3>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {description || config.defaultDescription}
          </p>

          {/* Suggestions */}
          {config.suggestions.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Try these suggestions:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {config.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-center justify-center">
                    <div className={`w-1.5 h-1.5 ${colors.text} rounded-full mr-2`} />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {showRefresh && onRefresh && (
              <Button
                variant="outline"
                onClick={onRefresh}
                className={`${colors.border} ${colors.text} hover:${colors.bg} transition-colors`}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            )}
            
            {onAction && (
              <Button
                onClick={onAction}
                className={`bg-gradient-to-r ${colors.button} text-white shadow-lg transition-all duration-200`}
              >
                <Plus className="w-4 h-4 mr-2" />
                {actionLabel || 'Take Action'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedEmptyState;
