import { useState, useEffect } from 'react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import DateNavigator from '../components/DateNavigator';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';
import LoadingSpinner from '../components/LoadingSpinner';
import Timetable from '../components/Timetable';
import { Event } from '../types/Event';
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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

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

  // Fetch events from the database directly
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

  const selectedEvent = selectedEventId
    ? events.find(event => event.id === selectedEventId)
    : null;

  const displayEvents = events;

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <HeroSection />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Timetable Schedule System */}
          <Timetable
            events={displayEvents}
            onEventClick={handleEventClick}
            isLoading={isLoading}
          />
        </div>
      </div>

      <CommunityCTA />
      <div id="deals" className="container mx-auto px-4 py-6 sm:py-8">
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
