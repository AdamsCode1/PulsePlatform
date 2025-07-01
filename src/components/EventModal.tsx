
import { useState } from 'react';
import { format } from 'date-fns';
import { X, MapPin, Clock, Users, Calendar } from 'lucide-react';
import { Event } from '../types/Event';
import RSVPForm from './RSVPForm';

interface EventModalProps {
  event: Event;
  onClose: () => void;
}

const EventModal = ({ event, onClose }: EventModalProps) => {
  const [showRSVPForm, setShowRSVPForm] = useState(false);
  const [hasRSVPed, setHasRSVPed] = useState(false);

  const handleRSVPSuccess = () => {
    setHasRSVPed(true);
    setShowRSVPForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="relative">
          <div className="h-64 bg-gradient-to-br from-blue-400 to-purple-500 relative">
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 bg-black bg-opacity-30 rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{event.eventName}</h1>
              <p className="text-blue-100 text-lg">{event.societyName}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Event Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Date & Time */}
            <div className="flex items-start space-x-3">
              <Calendar className="text-blue-500 mt-1" size={20} />
              <div>
                <div className="font-semibold text-gray-900">Date & Time</div>
                <div className="text-gray-600">
                  {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                </div>
                {event.time && (
                  <div className="text-gray-600">
                    {event.time}
                    {event.endTime && ` - ${event.endTime}`}
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start space-x-3">
              <MapPin className="text-blue-500 mt-1" size={20} />
              <div>
                <div className="font-semibold text-gray-900">Location</div>
                <div className="text-gray-600">{event.location}</div>
              </div>
            </div>

            {/* Attendees */}
            {event.attendeeCount && (
              <div className="flex items-start space-x-3">
                <Users className="text-blue-500 mt-1" size={20} />
                <div>
                  <div className="font-semibold text-gray-900">Attendees</div>
                  <div className="text-gray-600">{event.attendeeCount} people interested</div>
                </div>
              </div>
            )}

            {/* Organizer Contact */}
            {event.requiresOrganizerSignup && event.organizerEmail && (
              <div className="flex items-start space-x-3">
                <div className="text-blue-500 mt-1">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Registration</div>
                  <div className="text-gray-600">Contact organizer to complete signup</div>
                  <a href={`mailto:${event.organizerEmail}`} className="text-blue-600 hover:text-blue-700 text-sm">
                    {event.organizerEmail}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">About This Event</h3>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>

          {/* RSVP Section */}
          <div className="border-t pt-6">
            {hasRSVPed ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {event.requiresOrganizerSignup ? "Interest Registered!" : "You're all set!"}
                </h3>
                <p className="text-gray-600">
                  {event.requiresOrganizerSignup 
                    ? "We've recorded your interest. Please contact the organizer to complete your registration."
                    : "Thanks for RSVPing. We'll see you at the event!"
                  }
                </p>
                {event.requiresOrganizerSignup && event.organizerEmail && (
                  <a
                    href={`mailto:${event.organizerEmail}`}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
                  >
                    Contact Organizer
                  </a>
                )}
              </div>
            ) : showRSVPForm ? (
              <RSVPForm
                event={event}
                onSuccess={handleRSVPSuccess}
                onCancel={() => setShowRSVPForm(false)}
              />
            ) : (
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {event.requiresOrganizerSignup ? "Show Your Interest" : "Join This Event"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {event.requiresOrganizerSignup 
                    ? "Let us know you're interested and we'll help you connect with the organizer."
                    : "Reserve your spot and we'll send you event updates."
                  }
                </p>
                {event.requiresOrganizerSignup && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Final registration must be completed directly with the organizer
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setShowRSVPForm(true)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {event.requiresOrganizerSignup ? "Register Interest" : "RSVP Now"}
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
