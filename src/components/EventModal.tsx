
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
                  <div className="text-gray-600">{event.time}</div>
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
                  <div className="text-gray-600">{event.attendeeCount} people attending</div>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">You're all set!</h3>
                <p className="text-gray-600">Thanks for RSVPing. We'll see you at the event!</p>
              </div>
            ) : showRSVPForm ? (
              <RSVPForm
                event={event}
                onSuccess={handleRSVPSuccess}
                onCancel={() => setShowRSVPForm(false)}
              />
            ) : (
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Join This Event</h3>
                <p className="text-gray-600 mb-6">Reserve your spot and we'll send you event updates.</p>
                <button
                  onClick={() => setShowRSVPForm(true)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  RSVP Now
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
