import { useState, useEffect } from 'react';
import EventModal from '../../components/EventModal';
import Timetable from '../../components/Timetable';
import { Event } from '../../types/Event';
import HeroSection from '../../components/HeroSection';
import FAQFeedbackSection from '../../components/FAQFeedbackSection';
import Footer from '../../components/Footer';
import CommunityCTA from '../../components/CommunityCTA';
import { supabase } from '../../lib/supabaseClient';

// Enhanced components
import EnhancedNavBar from '../../components/enhanced/EnhancedNavBar';
import EnhancedDealsGrid from '../../components/enhanced/EnhancedDealsGrid';

const EnhancedIndex = () => {
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

    // Fetch all events
    const fetchEvents = async () => {
        setIsLoading(true);

        try {
            // Fetch all upcoming events
            const { data: eventsData, error: eventsError } = await supabase
                .from('event')
                .select(`*, locations:location (id, name, formatted_address, latitude, longitude, city, region, country)`)
                .eq('status', 'approved')
                .gte('start_time', new Date().toISOString())
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
                locations: Array.isArray(event.locations) ? event.locations[0] : event.locations,
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
        fetchEvents();
    }, []);

    const handleEventClick = (eventId: string) => {
        setSelectedEventId(eventId);
    };

    const handleCloseModal = () => {
        setSelectedEventId(null);
    };

    const selectedEvent = selectedEventId
        ? events.find(event => event.id === selectedEventId)
        : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <EnhancedNavBar />
            <HeroSection />

            {/* New Timetable Section */}
            <div id="schedule" className="container mx-auto px-4 py-6 sm:py-8 min-h-[900px]">
                <Timetable
                    events={events}
                    onEventClick={setSelectedEventId}
                    isLoading={isLoading}
                />
            </div>

            {/* Event Modal */}
            {selectedEvent && (
                <EventModal
                    event={selectedEvent}
                    onClose={handleCloseModal}
                />
            )}

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
                <EnhancedDealsGrid />
            </div>
            <FAQFeedbackSection />
            <Footer />
        </div>
    );
};

export default EnhancedIndex;
