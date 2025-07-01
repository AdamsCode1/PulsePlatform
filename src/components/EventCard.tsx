
import React, { useState } from 'react';
import { format } from 'date-fns';
import { MapPin, Clock, Users } from 'lucide-react';
import { Event } from '../types/Event';

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

const EventCard = ({ event, onClick }: EventCardProps) => {
  const [hasRSVPed, setHasRSVPed] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(event.attendeeCount || 0);

  const handleQuickRSVP = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal
    
    if (!hasRSVPed) {
      // Simulate RSVP - in real app this would call the API
      setHasRSVPed(true);
      setAttendeeCount(prev => prev + 1);
      
      // Store RSVP info in localStorage for demo purposes
      const existingRSVPs = JSON.parse(localStorage.getItem('rsvps') || '[]');
      const newRSVP = {
        eventId: event.id,
        timestamp: new Date().toISOString(),
        quickRSVP: true
      };
      localStorage.setItem('rsvps', JSON.stringify([...existingRSVPs, newRSVP]));
    }
  };

  // Check if user has already RSVP'd on component mount
  React.useEffect(() => {
    const existingRSVPs = JSON.parse(localStorage.getItem('rsvps') || '[]');
    const hasUserRSVPed = existingRSVPs.some((rsvp: any) => rsvp.eventId === event.id);
    setHasRSVPed(hasUserRSVPed);
  }, [event.id]);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden relative"
    >
      {/* Attend Counter - Top Right */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1 text-sm font-medium text-gray-700 z-10">
        <Users size={14} />
        <span>{attendeeCount}</span>
      </div>

      {/* Event Image */}
      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-white font-semibold text-lg mb-1">
            {event.eventName}
          </div>
          <div className="text-blue-100 text-sm">
            {event.societyName}
          </div>
        </div>
      </div>
      
      {/* Event Details */}
      <div className="p-6">
        <div className="space-y-3">
          {/* Time */}
          {event.time && (
            <div className="flex items-center text-gray-600">
              <Clock size={18} className="mr-3 text-blue-500" />
              <span className="text-sm font-medium">
                {event.time}
                {event.endTime && ` - ${event.endTime}`}
              </span>
            </div>
          )}
          
          {/* Location */}
          <div className="flex items-center text-gray-600">
            <MapPin size={18} className="mr-3 text-blue-500" />
            <span className="text-sm">{event.location}</span>
          </div>
        </div>
        
        {/* Organizer Signup Notice */}
        {event.requiresOrganizerSignup && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              ⚠️ Direct signup required with organizer
            </p>
          </div>
        )}
        
        {/* Description Preview */}
        <p className="text-gray-600 text-sm mt-4 line-clamp-2">
          {event.description.substring(0, 120)}...
        </p>
        
        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors">
            View Details →
          </div>
          
          {event.requiresOrganizerSignup ? (
            <div className="text-xs text-gray-500 font-medium">
              Contact organizer
            </div>
          ) : (
            <button
              onClick={handleQuickRSVP}
              disabled={hasRSVPed}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                hasRSVPed
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-pink-500 text-white hover:bg-pink-600 active:scale-95'
              }`}
            >
              {hasRSVPed ? 'RSVP\'d ✓' : 'Quick RSVP'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
