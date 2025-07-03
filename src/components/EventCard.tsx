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

  const handleCheckDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onClick();
  };

  const handleLocationClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const encodedLocation = encodeURIComponent(event.location);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    window.open(googleMapsUrl, '_blank');
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
      className="bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 overflow-hidden relative cursor-pointer flex flex-col h-full"
    >
      {/* Colored line at the top */}
      <div className="h-1 bg-gradient-to-r from-pink-400 to-pink-500"></div>
      
      <div className="p-6 flex flex-col flex-1">
        {/* Attend Counter - Top Right */}
        <div className="absolute top-6 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1 text-sm font-medium text-gray-700 shadow-sm">
          <Users size={14} />
          <span>{attendeeCount}</span>
        </div>

        {/* Society Name with hover effect - only text has gray background */}
        <div className="mb-3">
          <span className="bg-gray-200 hover:bg-black hover:text-white transition-all duration-300 px-3 py-1 rounded-lg text-sm text-gray-700 cursor-pointer">
            {event.societyName}
          </span>
        </div>

        {/* Event Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {event.eventName}
        </h3>

        {/* Event Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
          {event.description}
        </p>
        
        {/* Event Details */}
        <div className="space-y-3 mb-6">
          {/* Time */}
          {event.date && event.endTime && (
            <div className="flex items-center text-gray-700">
              <Clock size={18} className="mr-3 text-pink-500" />
              <span className="text-sm font-medium">
                {format(new Date(event.date), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
              </span>
            </div>
          )}
          
          {/* Location - Now clickable with hover effect */}
          <div 
            className="flex items-center text-gray-700 hover:text-pink-600 cursor-pointer transition-colors group"
            onClick={handleLocationClick}
            title="Click to open in Google Maps"
          >
            <MapPin size={18} className="mr-3 text-pink-500 group-hover:text-pink-600" />
            <span className="text-sm group-hover:underline">{event.location}</span>
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
        
        {/* Bottom buttons - Push to bottom */}
        <div className="flex justify-between items-center mt-auto">
          {/* Check Detail Button */}
          <button
            onClick={handleCheckDetailClick}
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
