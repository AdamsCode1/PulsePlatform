import { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import DateNavigator from '../components/DateNavigator';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';
import { Event } from '../types/Event';
import { fetchEventsByDate } from '../lib/eventApi';

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Fetch events from backend for a specific date
  const fetchEventsForDate = async (date: Date) => {
    setIsLoading(true);
    try {
      const dayEvents = await fetchEventsByDate(date);
      setEvents(dayEvents);
    } catch (e) {
      setEvents([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEventsForDate(currentDate);
  }, [currentDate]);

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleCloseModal = () => {
    setSelectedEventId(null);
  };

  const selectedEvent = events.find(event => event.id === selectedEventId) || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Today's Schedule
          </h1>
          <p className="text-lg text-gray-600">
            Discover and join amazing events happening around you
          </p>
        </div>

        {/* Date Navigator */}
        <DateNavigator 
          currentDate={currentDate}
          onDateChange={handleDateChange}
        />

        {/* Events Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Events for {format(currentDate, 'EEEE, MMMM d')}
            </h2>
            <div className="text-sm text-gray-500">
              {events.length} event{events.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Events Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events scheduled</h3>
                  <p className="text-gray-500">Check back later or try another date!</p>
                </div>
              ) : (
                events.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => handleEventClick(event.id)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Index;
