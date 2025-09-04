import { useState, useEffect } from 'react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import DateNavigator from '../../components/DateNavigator';
import EventFilters from '../../components/EventFilters';
import EventModal from '../../components/EventModal';
import { Event } from '../../types/Event';
import HeroSection from '../../components/HeroSection';
import FAQFeedbackSection from '../../components/FAQFeedbackSection';
import Footer from '../../components/Footer';
import CommunityCTA from '../../components/CommunityCTA';
import { supabase } from '../../lib/supabaseClient';

// Enhanced components
import EnhancedNavBar from '../../components/enhanced/EnhancedNavBar';
import EnhancedEventCard from '../../components/enhanced/EnhancedEventCard';
import EnhancedDealsGrid from '../../components/enhanced/EnhancedDealsGrid';
import EnhancedLoadingSpinner from '../../components/enhanced/EnhancedLoadingSpinner';
import EnhancedEmptyState from '../../components/enhanced/EnhancedEmptyState';

const EnhancedIndex = () => {
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

  // Fetch events for a specific date
  const fetchEventsForDate = async (date: Date) => {
    setIsLoading(true);

    try {
      const startOfDayDate = startOfDay(date);
      const endOfDayDate = addDays(startOfDayDate, 1);

      // Fetch events from Supabase
      const { data: eventData, error } = await supabase
        .from('event')
        .select('*')
        .gte('start_time', startOfDayDate.toISOString())
        .lt('start_time', endOfDayDate.toISOString())
        .eq('status', 'approved')
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
        setFilteredEvents([]);
        return;
      }

      // Transform the data to match our Event interface
      const transformedEvents: Event[] = (eventData || []).map((event) => ({
        id: event.id.toString(),
        eventName: event.name || event.title || 'Untitled Event',
        date: event.start_time || new Date().toISOString(),
        endTime: event.end_time || new Date().toISOString(),
        location: event.location || 'Location TBD',
        description: event.description || 'No description available',
        category: event.category || 'General',
        organiserID: event.society_id?.toString() || '',
        societyName: event.society?.name || 'Unknown Society',
        imageUrl: event.image_url || undefined,
        attendeeCount: event.rsvp?.length || 0,
        requiresOrganizerSignup: event.requires_organizer_signup || false,
        organizerEmail: event.organizer_email || '',
        signup_link: event.signup_link || '',
        status: event.status
      }));

      // Filter out test events
      const cleanedEvents = filterTestEvents(transformedEvents);
      
      setEvents(cleanedEvents);
      setFilteredEvents(cleanedEvents);
    } catch (error) {
      console.error('Error in fetchEventsForDate:', error);
      setEvents([]);
      setFilteredEvents([]);
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
      filtered = filtered.filter(event => event.category.toLowerCase() === value.toLowerCase());
    }

    return filtered;
  };

  useEffect(() => {
    fetchEventsForDate(currentDate);
  }, [currentDate]);

  useEffect(() => {
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

  const handleRefreshEvents = () => {
    fetchEventsForDate(currentDate);
  };

  const selectedEvent = selectedEventId
    ? events.find(event => event.id === selectedEventId)
    : null;

  const displayEvents = filteredEvents;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Enhanced Navigation */}
      <EnhancedNavBar />
      
      {/* Hero Section */}
      <div className="pt-16">
        <HeroSection />
      </div>

      {/* Events Section */}
      <div id="events-section" className="container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Today's{' '}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Schedule
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover amazing events happening around Durham University and connect with your community
          </p>
        </div>

        {/* Date Navigator */}
        <div className="sticky top-20 z-40 bg-gradient-to-br from-blue-50/95 via-purple-50/95 to-pink-50/95 backdrop-blur-sm py-4 -mx-4 px-4 mb-8 border-y border-white/50">
          <DateNavigator
            currentDate={currentDate}
            onDateChange={handleDateChange}
          />
        </div>

        {/* Filters and Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <EventFilters
            onFilterChange={handleFilterChange}
            currentFilter={currentFilter}
          />
          
          <div className="flex items-center gap-4">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-purple-200 shadow-sm">
              <span className="text-sm font-medium text-gray-700">
                {isLoading ? 'Loading...' : `${displayEvents.length} events found`}
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-96">
          {/* Loading State */}
          {isLoading && (
            <EnhancedLoadingSpinner 
              size="lg" 
              type="card" 
              text="Finding amazing events for you..."
              context="events"
            />
          )}

          {/* Events Grid */}
          {!isLoading && displayEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {displayEvents.map(event => (
                <EnhancedEventCard
                  key={event.id}
                  event={event}
                  onClick={() => handleEventClick(event.id)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && displayEvents.length === 0 && (
            <EnhancedEmptyState
              type="events"
              title="No events scheduled"
              description={`No events found for ${format(currentDate, 'EEEE, MMMM d')}. Try exploring other dates or check back later!`}
              showRefresh={true}
              onRefresh={handleRefreshEvents}
              actionLabel="Browse All Events"
              onAction={() => {
                // Navigate to full events page or clear filters
                setCurrentFilter('all');
                setCurrentDate(new Date());
              }}
            />
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

      {/* Community CTA */}
      <CommunityCTA />

      {/* Deals Section */}
      <div id="deals-section" className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Exclusive{' '}
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Deals
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Unlock amazing student discounts and offers from local businesses
          </p>
        </div>
        
        <EnhancedDealsGrid />
      </div>

      {/* FAQ Section */}
      <FAQFeedbackSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default EnhancedIndex;
