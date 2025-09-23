import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, MapPin, Users, Calendar, Mail } from 'lucide-react';
import { Event } from '../types/Event';
import RSVPForm from './RSVPForm';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { toast } from '../hooks/use-toast';

interface EventModalProps {
  event: Event & { locations?: { name: string; formatted_address: string } };
  onClose: () => void;
  isSocietyView?: boolean;
}

const EventModal = ({ event, onClose, isSocietyView }: EventModalProps) => {
  const [showRSVPForm, setShowRSVPForm] = useState(false);
  const [hasRSVPed, setHasRSVPed] = useState(false);
  const [user, setUser] = useState(null);
  const [attendeeCount, setAttendeeCount] = useState(event.attendeeCount || 0);
  const navigate = useNavigate();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    // Store the current scroll position
    const scrollY = window.scrollY;

    // Lock body scroll when modal opens
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    // Cleanup: restore body scroll and position when modal closes
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      // Restore the scroll position instantly without animation
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    };
  }, []);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    fetchUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Check if user has already RSVP'd on component mount
  useEffect(() => {
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

  const handleRSVPSuccess = () => {
    setHasRSVPed(true);
    setShowRSVPForm(false);
  };

  const handleQuickRSVP = async () => {
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
      }
    } catch (error) {
      console.error('Error handling RSVP:', error);
    }
  };

  // Ensure email ends with @durham.ac.uk
  const formatEmail = (email: string) => {
    if (!email || email === 'No email provided') {
      return 'No email provided';
    }
    if (email.endsWith('@durham.ac.uk')) {
      return email;
    }
    // Replace domain with @durham.ac.uk
    const emailParts = email.split('@');
    return `${emailParts[0]}@durham.ac.uk`;
  };

  // RSVP cutoff logic
  const isRSVPCutoffPassed = event.rsvp_cutoff && new Date(event.rsvp_cutoff).getTime() <= Date.now();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative">
          <div className="h-48 sm:h-64 bg-gradient-to-br from-pink-400 to-pink-500 relative">
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 bg-black bg-opacity-30 rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{event.eventName}</h1>
              <p className="text-pink-100 text-base sm:text-lg">{event.societyName}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8">
          {/* Event Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Date & Time */}
            <div className="flex items-start space-x-3">
              <Calendar className="text-pink-500 mt-1 flex-shrink-0" size={20} />
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-sm sm:text-base">Date & Time</div>
                <div className="text-gray-600 text-sm sm:text-base">
                  {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                </div>
                {event.time && (
                  <div className="text-gray-600 text-sm sm:text-base">
                    {new Date(event.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    {event.endTime && (
                      ` - ${new Date(event.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start space-x-3">
              <MapPin className="text-pink-500 mt-1 flex-shrink-0" size={20} />
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-sm sm:text-base">Location</div>
                <div className="text-gray-600 text-sm sm:text-base break-words">{event.locations?.name || 'Location TBD'}</div>
              </div>
            </div>

            {/* Attendees */}
            {attendeeCount !== undefined && (
              <div className="flex items-start space-x-3">
                <Users className="text-pink-500 mt-1 flex-shrink-0" size={20} />
                <div>
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">Attendees</div>
                  <div className="text-gray-600 text-sm sm:text-base">{attendeeCount} people interested</div>
                </div>
              </div>
            )}

            {/* Society Email */}
            <div className="flex items-start space-x-3">
              <Mail className="text-pink-500 mt-1 flex-shrink-0" size={20} />
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-sm sm:text-base">Society Contact</div>
                <div className="text-gray-600 text-sm sm:text-base">
                  <a
                    href={`mailto:${formatEmail(event.organizerEmail)}`}
                    className="text-pink-600 hover:text-pink-700 hover:underline transition-colors break-all"
                  >
                    {formatEmail(event.organizerEmail)}
                  </a>
                </div>
              </div>
            </div>

            {/* Organizer Contact */}
            {event.requiresOrganizerSignup && event.organizerEmail && (
              <div className="flex items-start space-x-3 md:col-span-2">
                <div className="text-pink-500 mt-1 flex-shrink-0">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">Registration</div>
                  <div className="text-gray-600 text-sm sm:text-base">Contact organizer to complete signup</div>
                  <a href={`mailto:${formatEmail(event.organizerEmail)}`} className="text-pink-600 hover:text-pink-700 text-sm break-all">
                    {formatEmail(event.organizerEmail)}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Description - Now Short */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">About This Event</h3>
            <div className="text-gray-600 leading-relaxed text-sm sm:text-base">
              {event.description || ''}
            </div>
          </div>

          {/* RSVP Section */}
          <div className="border-t pt-4 sm:pt-6">
            {event.signup_link && event.signup_link.trim() !== '' ? (
              <div className="text-center py-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  This event requires external signup
                </h3>
                <p className="text-gray-600 text-sm sm:text-base px-4 mb-4">
                  Please use the button below to sign up for this event on the organizer's website.
                </p>
                <a
                  href={event.signup_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-pink-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors text-sm sm:text-base inline-block"
                >
                  Sign Up
                </a>
              </div>
            ) : isRSVPCutoffPassed ? (
              <div className="text-center py-8">
                <button
                  className="bg-gray-300 text-gray-500 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold cursor-not-allowed opacity-70 text-sm sm:text-base"
                  disabled
                >
                  RSVP Closed
                </button>
              </div>
            ) : hasRSVPed ? (
              <div className="text-center py-4 sm:py-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  {event.requiresOrganizerSignup ? "Interest Registered!" : "You're all set!"}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base px-4">
                  {event.requiresOrganizerSignup
                    ? "We've recorded your interest. Please contact the organizer to complete your registration."
                    : "Thanks for RSVPing. We'll see you at the event!"
                  }
                </p>
                <div className="mt-4 space-y-3">
                  {event.requiresOrganizerSignup && event.organizerEmail && (
                    <a
                      href={`mailto:${formatEmail(event.organizerEmail)}`}
                      className="bg-pink-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-pink-700 transition-colors inline-block text-sm sm:text-base"
                    >
                      Contact Organizer
                    </a>
                  )}
                  <button
                    onClick={handleQuickRSVP}
                    className="bg-gray-200 text-gray-700 px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm sm:text-base"
                  >
                    Remove RSVP
                  </button>
                </div>
              </div>
            ) : user ? (
              <div className="text-center">
                <button
                  onClick={() => {
                    if (event.requiresOrganizerSignup && event.organizerEmail) {
                      window.location.href = `mailto:${event.organizerEmail}`;
                      return;
                    }
                    handleQuickRSVP();
                  }}
                  className="bg-pink-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors text-sm sm:text-base"
                >
                  {event.requiresOrganizerSignup ? "Register Interest" : "RSVP Now"}
                </button>
              </div>
            ) : showRSVPForm ? (
              <RSVPForm
                event={event}
                onSuccess={handleRSVPSuccess}
                onCancel={() => setShowRSVPForm(false)}
              />
            ) : (
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  {event.requiresOrganizerSignup ? "Show Your Interest" : "Join This Event"}
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-4">
                  {event.requiresOrganizerSignup
                    ? "Let us know you're interested and we'll help you connect with the organizer."
                    : "Reserve your spot and we'll send you event updates."
                  }
                </p>
                {event.requiresOrganizerSignup && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mx-4">
                    <p className="text-xs sm:text-sm text-yellow-800">
                      ⚠️ Final registration must be completed directly with the organizer
                    </p>
                  </div>
                )}
                <button
                  onClick={async () => {
                    if (event.requiresOrganizerSignup && event.organizerEmail) {
                      window.location.href = `mailto:${event.organizerEmail}`;
                      return;
                    }
                    navigate('/login');
                  }}
                  className="bg-pink-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors text-sm sm:text-base"
                >
                  {event.requiresOrganizerSignup ? "Register Interest" : "RSVP Now"}
                </button>
              </div>
            )}
            {isSocietyView && (
              <div className="text-center mt-4">
                <button
                  onClick={() => navigate(`/viewRSVPlist/${event.id}`)}
                  className="w-full bg-purple-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm sm:text-base"
                >
                  View RSVP List
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;