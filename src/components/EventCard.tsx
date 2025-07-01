
import React, { useState } from 'react';
import { format } from 'date-fns';
import { MapPin, Clock, Users, Check, ArrowRight } from 'lucide-react';
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
    
    const existingRSVPs = JSON.parse(localStorage.getItem('rsvps') || '[]');
    
    if (!hasRSVPed) {
      // Add RSVP
      setHasRSVPed(true);
      setAttendeeCount(prev => prev + 1);
      
      const newRSVP = {
        eventId: event.id,
        timestamp: new Date().toISOString(),
        quickRSVP: true
      };
      localStorage.setItem('rsvps', JSON.stringify([...existingRSVPs, newRSVP]));
    } else {
      // Remove RSVP
      setHasRSVPed(false);
      setAttendeeCount(prev => Math.max(0, prev - 1));
      
      const updatedRSVPs = existingRSVPs.filter((rsvp: any) => rsvp.eventId !== event.id);
      localStorage.setItem('rsvps', JSON.stringify(updatedRSVPs));
    }
  };

  // Check if user has already RSVP'd on component mount
  React.useEffect(() => {
    const existingRSVPs = JSON.parse(localStorage.getItem('rsvps') || '[]');
    const hasUserRSVPed = existingRSVPs.some((rsvp: any) => rsvp.eventId === event.id);
    setHasRSVPed(hasUserRSVPed);
  }, [event.id]);

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative">
      {/* Colored line at the top */}
      <div className="h-1 bg-gradient-to-r from-pink-400 to-pink-500"></div>
      
      <div className="p-6">
        {/* Attend Counter - Top Right */}
        <div className="absolute top-6 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1 text-sm font-medium text-gray-700 shadow-sm">
          <Users size={14} />
          <span>{attendeeCount}</span>
        </div>

        {/* Society Name with hover effect */}
        <div className="inline-block mb-3">
          <div className="bg-gray-200 hover:bg-black hover:text-white transition-all duration-300 px-3 py-1 rounded-lg text-sm text-gray-700 cursor-pointer">
            {event.societyName}
          </div>
        </div>

        {/* Event Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {event.eventName}
        </h3>

        {/* Event Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>
        
        {/* Event Details */}
        <div className="space-y-3 mb-6">
          {/* Time */}
          {event.time && (
            <div className="flex items-center text-gray-700">
              <Clock size={18} className="mr-3 text-pink-500" />
              <span className="text-sm font-medium">
                {event.time}
                {event.endTime && ` - ${event.endTime}`}
              </span>
            </div>
          )}
          
          {/* Location */}
          <div className="flex items-center text-gray-700">
            <MapPin size={18} className="mr-3 text-pink-500" />
            <span className="text-sm">{event.location}</span>
          </div>
        </div>
        
        {/* Organizer Signup Notice */}
        {event.requiresOrganizerSignup && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              ⚠️ Direct signup required with organizer
            </p>
          </div>
        )}
        
        {/* Bottom buttons */}
        <div className="flex justify-between items-center">
          {/* Check Detail Button */}
          <button
            onClick={onClick}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-medium text-sm"
          >
            Check Detail
            <ArrowRight size={16} />
          </button>

          {/* RSVP Button */}
          <button
            onClick={handleQuickRSVP}
            className="bg-[#FF1493] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-[#E6127F] transition-colors flex items-center justify-center gap-2"
          >
            {hasRSVPed ? 'Remove' : 'RSVP'}
            {hasRSVPed && <Check size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
