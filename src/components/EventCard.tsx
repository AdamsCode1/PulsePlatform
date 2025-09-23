import React, { useState } from 'react';
import { format } from 'date-fns';
import { MapPin, Clock, Users, Check, ArrowRight, Calendar } from 'lucide-react';
import { Event } from '../types/Event';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Badge } from './ui/badge';
import { toast } from '../hooks/use-toast';

// Academic Terms (matching Timetable and MonthlyCalendar components)
const ACADEMIC_TERMS = [
  {
    id: 'michaelmas',
    label: 'Michaelmas Term',
    startDate: new Date(2025, 9, 6), // October 6, 2025
    endDate: new Date(2025, 11, 12), // December 12, 2025
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'epiphany',
    label: 'Epiphany Term',
    startDate: new Date(2026, 0, 12), // January 12, 2026
    endDate: new Date(2026, 2, 20), // March 20, 2026
    color: 'from-green-400 to-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'easter',
    label: 'Easter Term',
    startDate: new Date(2026, 3, 27), // April 27, 2026
    endDate: new Date(2026, 5, 26), // June 26, 2026
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
];

interface EventCardProps {
  event: Event & {
    locations?: { name: string; formatted_address: string };
    isRSVPCutoffPassed?: boolean;
  };
  onClick: () => void;
  onRSVPChange?: () => void;
  rightAction?: React.ReactNode; // Optional override for right-side action (replaces RSVP/sign-up)
}

const EventCard = ({ event, onClick, onRSVPChange, rightAction }: EventCardProps) => {
  const [hasRSVPed, setHasRSVPed] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(event.attendeeCount || 0);
  const [isClicked, setIsClicked] = useState(false);
  const navigate = useNavigate();

  // Get the term that an event falls into
  const getEventTerm = (eventDate: Date) => {
    return ACADEMIC_TERMS.find(term =>
      eventDate >= term.startDate && eventDate <= term.endDate
    );
  };

  // Get styling for event based on its term
  const getEventTermStyling = (eventDate: Date) => {
    const term = getEventTerm(eventDate);
    if (!term) return {
      color: 'from-gray-400 to-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    };

    return {
      color: term.color,
      bgColor: term.bgColor,
      borderColor: term.borderColor,
    };
  };

  const eventDate = new Date(event.date);
  const termStyling = getEventTermStyling(eventDate);

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

    try {
      // First, get the student_id from the student table
      const { data: studentData, error: studentError } = await supabase
        .from('student')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (studentError) {
        console.error('Error fetching student ID:', studentError);
        return;
      }

      // If no student record exists, user is not a student
      if (!studentData) {
        console.log('User is not a student - cannot RSVP');
        toast({
          title: "Access Restricted",
          description: "Only student accounts can RSVP to events.",
          variant: "destructive",
        });
        return;
      }

      const studentId = studentData.id;

      if (!hasRSVPed) {
        // Add RSVP to database
        const { data, error } = await supabase
          .from('rsvp')
          .insert([
            {
              student_id: studentId,
              event_id: event.id,
            }
          ]);

        if (error) {
          console.error('Error creating RSVP:', error);
          return;
        }

        // Update local state
        setHasRSVPed(true);
        setAttendeeCount(prev => prev + 1);
        if (onRSVPChange) onRSVPChange();
      } else {
        // Remove RSVP from database
        const { error } = await supabase
          .from('rsvp')
          .delete()
          .eq('student_id', studentId)
          .eq('event_id', event.id);

        if (error) {
          console.error('Error removing RSVP:', error);
          return;
        }

        // Update local state
        setHasRSVPed(false);
        setAttendeeCount(prev => Math.max(0, prev - 1));
        if (onRSVPChange) onRSVPChange();
      }
    } catch (error) {
      console.error('Error handling RSVP:', error);
    }
  };

  const handleCheckDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    e.preventDefault(); // Prevent any default behavior
    onClick();
  };

  const handleLocationClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const encodedLocation = encodeURIComponent(event.locations?.name || '');
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleCardClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
    // Don't call onClick on card click - only on Details button
    // onClick();
  };

  // Check if user has already RSVP'd on component mount
  React.useEffect(() => {
    const checkExistingRSVP = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        // First, get the student_id from the student table
        const { data: studentData, error: studentError } = await supabase
          .from('student')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (studentError) {
          console.error('Error fetching student ID:', studentError);
          return;
        }

        // If no student record exists, user is not a student
        if (!studentData) {
          console.log('User is not a student or student record not found');
          return;
        }

        const studentId = studentData.id;

        // Now check if this student has RSVP'd for this event
        const { data, error } = await supabase
          .from('rsvp')
          .select('id')
          .eq('student_id', studentId)
          .eq('event_id', event.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking RSVP status:', error);
          return;
        }

        setHasRSVPed(!!data);
      } catch (error) {
        console.error('Error checking RSVP status:', error);
      }
    };

    checkExistingRSVP();
  }, [event.id]);

  // RSVP cutoff logic
  const isRSVPCutoffPassed = event.isRSVPCutoffPassed || (event.rsvp_cutoff && new Date(event.rsvp_cutoff).getTime() <= Date.now());

  return (
    <div
      onClick={handleCardClick}
      className={`${termStyling.bgColor} rounded-xl border ${termStyling.borderColor} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.99] overflow-hidden relative cursor-pointer flex flex-col h-full group ${isClicked ? 'animate-pulse' : ''
        }`}
    >
      {/* Colored line at the top with term-specific animation */}
      <div className={`h-1 bg-gradient-to-r ${termStyling.color} group-hover:from-pink-500 group-hover:to-purple-500 transition-all duration-300`}></div>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Attend Counter - Top Right with hover animation */}
        <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 flex items-center space-x-1 text-xs font-medium text-gray-700 shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
          <Users size={10} />
          <span>{attendeeCount}</span>
        </div>

        {/* Society Name and Term Badge with enhanced hover effect */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-gray-200 hover:bg-black hover:text-white transition-all duration-500 px-2 py-1 rounded-lg text-xs text-gray-700 cursor-pointer transform hover:scale-105 inline-block">
              {event.societyName}
            </span>
            {(() => {
              const term = getEventTerm(eventDate);
              if (term) {
                return (
                  <Badge
                    variant="secondary"
                    className={`bg-gradient-to-r ${termStyling.color} text-white text-xs px-2 py-0.5 border-none`}
                  >
                    {term.label.split(' ')[0]}
                  </Badge>
                );
              }
              return null;
            })()}
          </div>
        </div>

        {/* Event Name with hover effect - Responsive text size */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors duration-300 leading-tight">
          {event.eventName}
        </h3>

        {/* Event Description */}
        <p className="text-gray-600 text-xs mb-2 line-clamp-2 flex-1 group-hover:text-gray-800 transition-colors duration-300 leading-relaxed">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
          {/* Time */}
          {event.date && event.endTime && (
            <div className="flex items-center text-gray-700">
              <Clock size={14} className="mr-2 text-pink-500 group-hover:text-pink-600 transition-colors duration-300 flex-shrink-0" />
              <span className="text-xs font-medium">
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
            <MapPin size={14} className="mr-2 text-pink-500 group-hover:text-pink-600 transition-all duration-300 group-hover:scale-110 flex-shrink-0" />
            <span className="text-xs group-hover:underline truncate">
              {event.locations?.name
                ? event.locations.name
                : event.locations?.formatted_address
                  ? event.locations.formatted_address
                  : 'Location TBD'}
            </span>
          </div>
        </div>

        {/* Organizer Signup Notice */}
        {event.requiresOrganizerSignup && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg group-hover:bg-yellow-100 transition-colors duration-300">
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
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-all duration-300 font-medium text-xs transform hover:translate-x-1 group flex-shrink-0"
          >
            <span className="hidden sm:inline">Details</span>
            <span className="sm:hidden">Details</span>
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>

          {/* Right action: status tag (if provided) OR RSVP/Sign Up */}
          {rightAction ? (
            <div className="flex-shrink-0 select-none pointer-events-none bg-transparent">{rightAction}</div>
          ) : event.signup_link && event.signup_link.trim() !== '' ? (
            <a
              href={event.signup_link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FF1493] text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold text-xs hover:bg-[#E6127F] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-1 shadow-lg hover:shadow-xl transform flex-shrink-0"
            >
              Sign Up
            </a>
          ) : (
            <button
              onClick={handleQuickRSVP}
              className={`bg-[#FF1493] text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-semibold text-xs hover:bg-[#E6127F] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-1 shadow-lg hover:shadow-xl transform flex-shrink-0 ${isRSVPCutoffPassed ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
              disabled={!!isRSVPCutoffPassed}
            >
              {isRSVPCutoffPassed ? 'RSVP Closed' : hasRSVPed ? 'Remove' : 'RSVP'}
              {hasRSVPed && !isRSVPCutoffPassed && <Check size={10} className="animate-bounce" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
