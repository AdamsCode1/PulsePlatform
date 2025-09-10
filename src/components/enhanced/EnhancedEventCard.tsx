import React, { useState } from 'react';
import { format } from 'date-fns';
import { MapPin, Clock, Users, Check, ArrowRight, Calendar, Star, Heart, Share } from 'lucide-react';
import { Event } from '../../types/Event';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Badge } from '../ui/badge';
import { toast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface EnhancedEventCardProps {
  event: Event;
  onClick: () => void;
  onRSVPChange?: () => void;
  rightAction?: React.ReactNode;
}

const EnhancedEventCard = ({ event, onClick, onRSVPChange, rightAction }: EnhancedEventCardProps) => {
  const [hasRSVPed, setHasRSVPed] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(event.attendeeCount || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const navigate = useNavigate();

  const eventDate = new Date(event.date);
  const isToday = format(eventDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isUpcoming = eventDate > new Date();

  const handleQuickRSVP = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Simulate RSVP logic (replace with actual implementation)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasRSVPed(!hasRSVPed);
      setAttendeeCount(prev => hasRSVPed ? prev - 1 : prev + 1);
      
      toast({
        title: hasRSVPed ? "RSVP Cancelled" : "RSVP Confirmed!",
        description: hasRSVPed ? "You've cancelled your RSVP" : "You're now registered for this event",
      });
      
      onRSVPChange?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites",
      description: isFavorited ? "Event removed from your favorites" : "Event saved to your favorites",
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: event.eventName,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Event link copied to clipboard",
      });
    }
  };

  return (
    <Card 
      className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-0 bg-gradient-to-br from-white to-purple-50/20 backdrop-blur-sm ${
        isHovered ? 'shadow-2xl' : 'shadow-lg'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Status Badge */}
      {isToday && (
        <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg">
          <Star className="w-3 h-3 mr-1" />
          Today
        </Badge>
      )}
      
      <CardContent className="p-6 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">
              {event.eventName}
            </h3>
            <p className="text-sm text-purple-600 font-medium">{event.societyName}</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-4">
            <Button
              size="sm"
              variant="ghost"
              className="p-2 hover:bg-purple-100 transition-colors"
              onClick={handleFavorite}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="p-2 hover:bg-purple-100 transition-colors"
              onClick={handleShare}
            >
              <Share className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-gray-700">
            <Calendar className="w-4 h-4 mr-2 text-purple-500" />
            <span className="text-sm font-medium">
              {format(eventDate, 'EEE, MMM d • h:mm a')}
            </span>
          </div>
          <div className="flex items-center text-gray-700">
            <MapPin className="w-4 h-4 mr-2 text-purple-500" />
            <span className="text-sm">{event.location}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Users className="w-4 h-4 mr-2 text-purple-500" />
            <span className="text-sm">
              {attendeeCount} attending
            </span>
          </div>
        </div>

        {/* Action Area */}
        <div className="flex items-center justify-between">
          {rightAction || (
            <>
              <Button
                variant="outline"
                size="sm"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
              >
                View Details
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              
              <Button
                onClick={handleQuickRSVP}
                disabled={isLoading || !isUpcoming}
                className={`${
                  hasRSVPed
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                } border-0 shadow-lg transition-all duration-200`}
                size="sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : hasRSVPed ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    RSVP'd
                  </>
                ) : (
                  'RSVP'
                )}
              </Button>
            </>
          )}
        </div>
      </CardContent>

      {/* Animated Border */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
           style={{ padding: '1px' }}>
        <div className="w-full h-full rounded-lg bg-white" />
      </div>
    </Card>
  );
};

export default EnhancedEventCard;
