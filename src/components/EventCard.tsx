import React, { useState } from 'react';
import { format } from 'date-fns';
import { MapPin, Clock, Users, Check, ArrowRight } from 'lucide-react';
import { Event } from '../types/Event';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

const EventCard = ({ event, onClick }: EventCardProps) => {
  const [hasRSVPed, setHasRSVPed] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(event.attendeeCount || 0);
  const [isClicked, setIsClicked] = useState(false);
  const navigate = useNavigate();

  const handleQuickRSVP = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal

    // If event requires external signup, redirect
    if (event.requiresOrganizerSignup && event.organizerEmail) {
      window.location.href = `mailto:${event.organizerEmail}`;
      return;
    }

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

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

  const handleCardClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
    onClick();
  };

  // Check if user has already RSVP'd on component mount
  React.useEffect(() => {
    const existingRSVPs = JSON.parse(localStorage.getItem('rsvps') || '[]');
    const hasUserRSVPed = existingRSVPs.some((rsvp: any) => rsvp.eventId === event.id);
    setHasRSVPed(hasUserRSVPed);
  }, [event.id]);

  return (
    <div 
      onClick={handleCardClick}
      className={`bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.02] active:scale-[0.98] overflow-hidden relative cursor-pointer flex flex-col h-full group ${
        isClicked ? 'animate-pulse' : ''
      }`}
    >
      {/* Colored line at the top with animation */}
      <div className="h-1 bg-gradient-to-r from-pink-400 to-pink-500 group-hover:from-pink-500 group-hover:to-purple-500 transition-all duration-300"></div>
      
      <div className="p-4 sm:p-6 flex flex-col flex-1">
        {/* Attend Counter - Top Right with hover animation */}
        <div className="absolute top-4 sm:top-6 right-3 sm:right-4 bg-white rounded-full px-2 sm:px-3 py-1 flex items-center space-x-1 text-xs sm:text-sm font-medium text-gray-700 shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
          <Users size={12} />
          <span>{attendeeCount}</span>
        </div>

        {/* Society Name with enhanced hover effect */}
        <div className="mb-3">
          <span className="bg-gray-200 hover:bg-black hover:text-white transition-all duration-500 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm text-gray-700 cursor-pointer transform hover:scale-105 inline-block">
            {event.societyName}
          </span>
        </div>

        {/* Event Name with hover effect - Responsive text size */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors duration-300 leading-tight">
          {event.eventName}
        </h3>

        {/* Event Description */}
        <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2 flex-1 group-hover:text-gray-800 transition-colors duration-300 leading-relaxed">
          {event.description}
        </p>
        {/* Signup Link */}
        {event.signup_link && (
          <a
            href={event.signup_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 text-xs sm:text-sm mb-4 underline hover:text-pink-800 transition-colors duration-300 block"
          >
            External Signup Required: Click here to sign up
          </a>
        )}
        
        {/* Event Details */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          {/* Time */}
          {event.date && event.endTime && (
            <div className="flex items-center text-gray-700">
              <Clock size={16} className="mr-2 sm:mr-3 text-pink-500 group-hover:text-pink-600 transition-colors duration-300 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">
                {format(new Date(event.date), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
              </span>
            </div>
          )}
          
          {/* Location - Enhanced with hover animation */}
          <div 
            className="flex items-center text-gray-700 hover:text-pink-600 cursor-pointer transition-all duration-300 group transform hover:translate-x-1"
            onClick={handleLocationClick}
            title="Click to open in Google Maps"
          >
            <MapPin size={16} className="mr-2 sm:mr-3 text-pink-500 group-hover:text-pink-600 transition-all duration-300 group-hover:scale-110 flex-shrink-0" />
            <span className="text-xs sm:text-sm group-hover:underline truncate">{event.location}</span>
          </div>
        </div>
        
        {/* Organizer Signup Notice */}
        {event.requiresOrganizerSignup && (
          <div className="mb-4 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg group-hover:bg-yellow-100 transition-colors duration-300">
            <p className="text-xs text-yellow-800">
              ⚠️ Direct signup required with organizer
            </p>
          </div>
        )}
        
        {/* Bottom buttons - Enhanced with animations and responsive design */}
        <div className="flex justify-between items-center mt-auto gap-2">
          {/* Check Detail Button */}
          <button
            onClick={handleCheckDetailClick}
            className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-800 transition-all duration-300 font-medium text-xs sm:text-sm transform hover:translate-x-1 group flex-shrink-0"
          >
            <span className="hidden sm:inline">Check Detail</span>
            <span className="sm:hidden">Details</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>

          {/* RSVP or Sign Up Button */}
          {event.signup_link && event.signup_link.trim() !== '' ? (
            <a
              href={event.signup_link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FF1493] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold text-xs sm:text-sm hover:bg-[#E6127F] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl transform flex-shrink-0"
            >
              Sign Up
            </a>
          ) : (
            <button
              onClick={handleQuickRSVP}
              className="bg-[#FF1493] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold text-xs sm:text-sm hover:bg-[#E6127F] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl transform flex-shrink-0"
            >
              {hasRSVPed ? 'Remove' : 'RSVP'}
              {hasRSVPed && <Check size={12} className="animate-bounce" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
