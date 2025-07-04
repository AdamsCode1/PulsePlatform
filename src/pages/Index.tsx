import { useState, useEffect } from 'react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import DateNavigator from '../components/DateNavigator';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';
import EventFilters from '../components/EventFilters';
import { Event } from '../types/Event';
import { mockEvents } from '../data/mockEvents';
import { start } from 'repl';
import NavBar from '../components/NavBar';
import HeroSection from '../components/HeroSection';
import FAQSection from '../components/FAQSection';
import Footer from '../components/Footer';
import CommunityCTA from '../components/CommunityCTA';
import { supabase } from '../lib/supabase';

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState('all');

  /*
  // Simulate API call to fetch events for a specific date
  const fetchEventsForDate = async (date: Date) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter mock events for the selected date
    const dayEvents = mockEvents.filter(event => 
      isSameDay(new Date(event.date), date)
    );
    
    setEvents(dayEvents);
    setIsLoading(false);
  };
 */
  // Uncomment the above block to use mock data instead of a real API call

  // API call to fetch events from the server can be implemented here
  // Attempt using a real API:
  const fetchEventsForDate = async (date: Date) => {
    setIsLoading(true);

    try { 
      // Format date to YYYY-MM-DD for API request
      const formattedDate = format(startOfDay(date), 'yyyy-MM-dd');
      //const response = await fetch(`/api/events/by-date?date=${formattedDate}`);
      const { data: eventsData, error: eventsError } = await supabase
        .from('event')
        .select('*')
        .gte('start_time', `${formattedDate}T00:00:00`)
        .lte('start_time',`${formattedDate}T23:59:59`)

      if (eventsError) throw eventsError;
      if (!eventsData) return;

      /*
      // Log the fetched events for debugging
      console.log('Fetched events for date:', formattedDate, dayEvents);
      */

      // Get unique society IDs
      const societyIDs = [...new Set(eventsData.map(event => event.society_id))];

      // Fetch society details (name and contact_email)
      const { data: societiesData, error: societiesError } = await supabase
        .from('society')
        .select('id, name, contact_email')
        .in('id', societyIDs);

      if (societiesError) throw societiesError;

      // Create society details mapping
      const societyDetailsMap = new Map(
        societiesData?.map(society => [society.id, {
          name: society.name,
          email: society.contact_email
        }])
      );

      // Remap event data to match the Event type
      const mappedEvents: Event[] = eventsData.map((event: any) => ({
        id: event.id,
        eventName: event.name,
        date: event.start_time,
        location: event.location,
        description: event.description,
        organiserID: event.society_id,
        societyName: societyDetailsMap.get(event.society_id)?.name || 'Miscellaneous', // TODO: fetch society name from societies table
        time: event.start_time,
        endTime: event.end_time,
        attendeeCount: 100, // TODO: calculate using RSVPs table from another endpoint
        imageUrl: event.imageUrl || '/placeholder.svg', // Default image if not provided
        requiresOrganizerSignup: event.requiresOrganizerSignup || false,
        organizerEmail: societyDetailsMap.get(event.society_id)?.email || event.organizerEmail || 'No email provided',
        category : event.category || 'general', // Default category if not provided
      }));

      // DEBUG: Log the mapped events
      console.log('Mapped events:', mappedEvents);

      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to events
  const applyFilters = (eventsToFilter: Event[], filterType: string, value: string) => {
    let filtered = [...eventsToFilter];

    if (filterType === 'sort' && value === 'attendees-desc') {
      filtered.sort((a, b) => (b.attendeeCount || 0) - (a.attendeeCount || 0));
    } else if (filterType === 'category' && value !== 'all') {
      // Simple category filtering based on event name or description
      filtered = filtered.filter(event => {
        const searchText = `${event.eventName} ${event.description}`.toLowerCase();
        return searchText.includes(value.toLowerCase());
      });
    }

    return filtered;
  };

  useEffect(() => {
    fetchEventsForDate(currentDate);
  }, [currentDate]);

  useEffect(() => {
    // Apply current filter whenever events change
    const [filterType, value] = currentFilter.includes('-') 
      ? ['sort', currentFilter] 
      : ['category', currentFilter];
    const filtered = applyFilters(events, filterType, value);
    setFilteredEvents(filtered);
  }, [events, currentFilter]);

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleCloseModal = () => {
    setSelectedEventId(null);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    const newFilter = filterType === 'sort' ? value : value;
    setCurrentFilter(newFilter);
  };

  const selectedEvent = selectedEventId 
    //? mockEvents.find(event => event.id === selectedEventId)
    ? events.find(event => event.id === selectedEventId)
    : null;

  const displayEvents = filteredEvents.length > 0 ? filteredEvents : events;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavBar />
      <HeroSection />
      <CommunityCTA />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Today's{' '}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-pink-300 bg-clip-text text-transparent animate-pulse">
              Schedule
            </span>
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <EventFilters 
                onFilterChange={handleFilterChange}
                currentFilter={currentFilter}
              />
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full border border-blue-200 w-full sm:w-auto flex justify-center">
                <span className="text-base sm:text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {displayEvents.length} events
                </span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Events Grid - Centered */}
          {!isLoading && (
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
                {displayEvents.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-500">Try a different filter or check back later!</p>
                  </div>
                ) : (
                  displayEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => handleEventClick(event.id)}
                    />
                  ))
                )}
              </div>
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
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
