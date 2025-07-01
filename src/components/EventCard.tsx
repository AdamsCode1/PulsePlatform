import React, { useState, useEffect } from 'react';
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

  // Fetch RSVP count from backend
  useEffect(() => {
    async function fetchRSVPCount() {
      try {
        const res = await fetch(`/api/rsvps?event_id=${event.id}`);
        if (res.ok) {
          const data = await res.json();
          setAttendeeCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchRSVPCount();
  }, [event.id]);

  const handleQuickRSVP = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal
    if (!hasRSVPed) {
      setHasRSVPed(true);
      setAttendeeCount(prev => prev + 1);
      const existingRSVPs = JSON.parse(localStorage.getItem('rsvps') || '[]');
      const newRSVP = {
        eventId: event.id,
        timestamp: new Date().toISOString(),
        quickRSVP: true
      };
      localStorage.setItem('rsvps', JSON.stringify([...existingRSVPs, newRSVP]));
    }
  };

  useEffect(() => {
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
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-white font-semibold text-lg mb-1">
            {event.name}
          </div>
        </div>
      </div>
      {/* Event Details */}
      <div className="p-6">
        <div className="space-y-3">
          {/* Time */}
          <div className="flex items-center text-gray-600">
            <Clock size={18} className="mr-3 text-blue-500" />
            <span className="text-sm font-medium">
              {format(new Date(event.start_time), 'EEE, MMM d, h:mm a')}
              {event.end_time && ` - ${format(new Date(event.end_time), 'h:mm a')}`}
            </span>
          </div>
          {/* Location */}
          <div className="flex items-center text-gray-600">
            <MapPin size={18} className="mr-3 text-blue-500" />
            <span className="text-sm">{event.location}</span>
          </div>
        </div>
        {/* Description Preview */}
        {event.description && (
          <p className="text-gray-600 text-sm mt-4 line-clamp-2">
            {event.description.substring(0, 120)}{event.description.length > 120 ? '...' : ''}
          </p>
        )}
        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors">
            View Details →
          </div>
          <button
            onClick={handleQuickRSVP}
            disabled={hasRSVPed}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              hasRSVPed
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-pink-500 text-white hover:bg-pink-600 active:scale-95'
            }`}
          >
            {hasRSVPed ? "RSVP'd ✓" : 'Quick RSVP'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
