import { useState, useEffect } from 'react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import DateNavigator from '../components/DateNavigator';
import EventCard from '../components/EventCard';
import EventCardSkeleton from '../components/EventCardSkeleton';
import EventModal from '../components/EventModal';
import EventFilters from '../components/EventFilters';
import LoadingSpinner from '../components/LoadingSpinner';
import { Event } from '../types/Event';
import { mockEvents } from '../data/mockEvents';
import { start } from 'repl';
import NavBar from '../components/NavBar';
import HeroSection from '../components/HeroSection';
import FAQFeedbackSection from '../components/FAQFeedbackSection';
import Footer from '../components/Footer';
import CommunityCTA from '../components/CommunityCTA';
import DealsGrid from '../components/DealsGrid';
import { supabase } from '../lib/supabaseClient';

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState('all');

  // Helper function to filter out test events
  const filterTestEvents = (events: Event[]): Event[] => {
    return events.filter(event => {
      const eventName = event.eventName.toLowerCase();
      const description = event.description.toLowerCase();
      const societyName = event.societyName.toLowerCase();

      // Filter out events that contain test-related keywords
      const testKeywords = [
        'test event',
        'rsvp event',
        'test location',
        'rsvp location',
        'test event description',
        'rsvp event description',
        'event test society',
        'rsvp society'
      ];

      return !testKeywords.some(keyword =>
        eventName.includes(keyword) ||
        description.includes(keyword) ||
        societyName.includes(keyword)
      );
    });
  };

  // API call to fetch events from the server using unified API
  const fetchEventsForDate = async (date: Date) => {
    setIsLoading(true);

    try {
      // Format date to YYYY-MM-DD for database query
      const formattedDate = format(startOfDay(date), 'yyyy-MM-dd');

      // Fetch events for the specific date using direct Supabase call
      const { data: eventsData, error: eventsError } = await supabase
        .from('event')
        .select('*')
        .eq('status', 'approved')
        .gte('start_time', `${formattedDate}T00:00:00`)
        .lte('start_time', `${formattedDate}T23:59:59`)
        .order('start_time', { ascending: true });
      
      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        throw new Error(`Failed to fetch events: ${eventsError.message}`);
      }
      
      if (!eventsData || eventsData.length === 0) {
        setEvents([]);
        setFilteredEvents([]);
        setIsLoading(false);
        return;
      }

      // Get unique society IDs and event IDs
      const societyIDs = [...new Set(eventsData.map((event: any) => event.society_id))];
      const eventIds = eventsData.map((event: any) => event.id);

      // Fetch society details using direct Supabase call
      const { data: allSocieties, error: societiesError } = await supabase
        .from('society')
        .select('*');
      
      if (societiesError) {
        console.error('Error fetching societies:', societiesError);
        throw new Error(`Failed to fetch societies: ${societiesError.message}`);
      }
      
      const societiesData = allSocieties?.filter((society: any) => societyIDs.includes(society.id)) || [];

      // Fetch RSVP counts using direct Supabase call
      const { data: allRsvps, error: rsvpsError } = await supabase
        .from('rsvp')
        .select('*');
      
      let rsvpCounts: any[] = [];
      if (!rsvpsError && allRsvps) {
        rsvpCounts = allRsvps.filter((rsvp: any) => eventIds.includes(rsvp.event_id));
      }

      // Count RSVPs per event
      const rsvpCountMap = new Map();
      if (rsvpCounts) {
        rsvpCounts.forEach((rsvp: any) => {
          const eventId = rsvp.event_id;
          rsvpCountMap.set(eventId, (rsvpCountMap.get(eventId) || 0) + 1);
        });
      }

      // Create society details mapping
      const societyDetailsMap = new Map(
        societiesData?.map((society: any) => [society.id, {
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
        societyName: (societyDetailsMap.get(event.society_id) as any)?.name || 'Miscellaneous',
        time: event.start_time,
        endTime: event.end_time,
        attendeeCount: Number(rsvpCountMap.get(event.id)) || 0,
        imageUrl: event.imageUrl || '/placeholder.svg',
        requiresOrganizerSignup: event.requires_organizer_signup || false,
        organizerEmail: (societyDetailsMap.get(event.society_id) as any)?.email || event.organizer_email || 'No email provided',
        category: event.category || 'general',
        signup_link: event.signup_link || '',
      }));

      // Filter out test events
      const filteredMappedEvents = filterTestEvents(mappedEvents);
      setEvents(filteredMappedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to event(s)
  const applyFilters = (eventsToFilter: Event[], filterType: string, value: string) => {
    let filtered = [...eventsToFilter];

    if (filterType === 'sort' && value === 'attendees-desc') {
      filtered.sort((a, b) => (b.attendeeCount || 0) - (a.attendeeCount || 0));
    } else if (filterType === 'category' && value !== 'all') {
      filtered = filtered.filter(event => event.category.toLowerCase() === value.toLowerCase());
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
    ? events.find(event => event.id === selectedEventId)
    : null;

  //const displayEvents = filteredEvents.length > 0 ? filteredEvents : events;
  const displayEvents = filteredEvents;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavBar />
      <HeroSection />
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Today's{' '}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-pink-300 bg-clip-text text-transparent animate-pulse">
              Schedule
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 px-4">
            Discover and join amazing events happening around you
          </p>
        </div>

        {/* Date Navigator */}
        <DateNavigator
          currentDate={currentDate}
          onDateChange={handleDateChange}
        />

        {/* Events Section */}
        <div className="mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 text-center sm:text-left">
              Events for {format(currentDate, 'EEEE, MMMM d')}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <EventFilters
                onFilterChange={handleFilterChange}
                currentFilter={currentFilter}
              />
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-3 sm:px-4 py-2 rounded-full border border-blue-200 w-full sm:w-auto flex justify-center">
                <span className="text-sm sm:text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {isLoading ? '...' : `${displayEvents.length} events`}
                </span>
              </div>
            </div>
          </div>

          {/* Loading State with Spinner */}
          {isLoading && <LoadingSpinner />}

          {/* Events Grid - Centered with responsive design */}
          {!isLoading && (
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl w-full">
                {displayEvents.length === 0 ? (
                  <div className="col-span-full text-center py-8 sm:py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No events found</h3>
                    <p className="text-sm sm:text-base text-gray-500 px-4">Try a different filter or check back later!</p>
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
      <CommunityCTA />
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            DuPulse <span className="bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-pink-300 bg-clip-text text-transparent animate-pulse">Deals</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 px-4">
            Discover and join amazing deals through DuPulse.
          </p>
        </div>
        <DealsGrid />
      </div>
      <FAQFeedbackSection />
      <Footer />
    </div>
  );
};

export default Index;
