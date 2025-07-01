
import { format } from 'date-fns';
import { MapPin, Clock, Users } from 'lucide-react';
import { Event } from '../types/Event';

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

const EventCard = ({ event, onClick }: EventCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden"
    >
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
              <span className="text-sm font-medium">{event.time}</span>
            </div>
          )}
          
          {/* Location */}
          <div className="flex items-center text-gray-600">
            <MapPin size={18} className="mr-3 text-blue-500" />
            <span className="text-sm">{event.location}</span>
          </div>
          
          {/* Attendees */}
          {event.attendeeCount && (
            <div className="flex items-center text-gray-600">
              <Users size={18} className="mr-3 text-blue-500" />
              <span className="text-sm">{event.attendeeCount} attending</span>
            </div>
          )}
        </div>
        
        {/* Description Preview */}
        <p className="text-gray-600 text-sm mt-4 line-clamp-2">
          {event.description.substring(0, 120)}...
        </p>
        
        {/* View Details Button */}
        <div className="mt-6">
          <div className="text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors">
            View Details →
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
