import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, startOfDay, endOfDay, isSameDay, parseISO } from 'date-fns';
import { Calendar, ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Event } from '@/types/Event';
import TimetableGrid from './TimetableGrid';
import TimetableLoadingSkeleton from './TimetableLoadingSkeleton';
import EventCard from './EventCard';
import EventFilters from './EventFilters';

// Term definitions according to specifications
const TERMS = [
    'Term 1',
    'Winter Break',
    'Term 2',
    'Spring Break',
    'Term 3',
    'Summer Break'
] as const;

// View options
const VIEWS = [
    { id: 'day', label: 'Day' },
    { id: '4-day', label: '4-Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' }
] as const;

type Term = typeof TERMS[number];
type ViewType = typeof VIEWS[number]['id'];

interface TimetableProps {
    events: Event[];
    onEventClick?: (eventId: string) => void;
    isLoading?: boolean;
    error?: string | null;
}

const Timetable = ({ events, onEventClick, isLoading, error }: TimetableProps) => {
    // Core state
    const [selectedTerm, setSelectedTerm] = useState<Term>('Term 1');
    const [selectedWeek, setSelectedWeek] = useState<number>(1);
    const [selectedView, setSelectedView] = useState<ViewType>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentFilter, setCurrentFilter] = useState<string>('all');

    // Generate week options (1-20 for academic year)
    const weekOptions = Array.from({ length: 20 }, (_, i) => i + 1);

    // Filter events by selected term and week
    const getFilteredEvents = () => {
        // For MVP, return all events as we don't have term/week metadata in events yet
        // In production, this would filter based on term and week
        return events.filter(event => {
            const eventDate = new Date(event.date);
            // Basic date filtering based on current view
            if (selectedView === 'day') {
                return isSameDay(eventDate, currentDate);
            }
            // Add more filtering logic here when term/week data is available
            return true;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    const filteredEvents = getFilteredEvents();

    const handleTermChange = (term: string) => {
        setSelectedTerm(term as Term);
        // Reset to week 1 when term changes
        setSelectedWeek(1);
    };

    const handleWeekChange = (week: string) => {
        setSelectedWeek(parseInt(week));
    };

    const handleViewChange = (view: ViewType) => {
        setSelectedView(view);
    };

    const handleFilterChange = (filterType: string, value: string) => {
        setCurrentFilter(value);
    };

    if (isLoading) {
        return <TimetableLoadingSkeleton />;
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 mb-4">
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                >
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-pink-400 bg-clip-text text-transparent">
                    Schedule
                </h1>
                <p className="text-gray-600">
                    Browse events and manage your timetable
                </p>
            </div>

            {/* Controls Section */}
            <div className="p-6 space-y-4">
                {/* Term and Week Selectors */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            Term
                        </label>
                        <Select value={selectedTerm} onValueChange={handleTermChange}>
                            <SelectTrigger className={`
              ${selectedTerm ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-pink-400' : 'bg-gradient-to-r from-pink-100 to-purple-100 border-pink-300 text-gray-700'}
              transition-all duration-200
            `}>
                                <SelectValue placeholder="Select Term" />
                                <ChevronDown className="h-4 w-4" />
                            </SelectTrigger>
                            <SelectContent>
                                {TERMS.map(term => (
                                    <SelectItem key={term} value={term} className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                        {term}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            Week
                        </label>
                        <Select value={selectedWeek.toString()} onValueChange={handleWeekChange}>
                            <SelectTrigger className={`
              ${selectedWeek ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-pink-400' : 'bg-gradient-to-r from-pink-100 to-purple-100 border-pink-300 text-gray-700'}
              transition-all duration-200
            `}>
                                <SelectValue placeholder="Select Week" />
                                <ChevronDown className="h-4 w-4" />
                            </SelectTrigger>
                            <SelectContent>
                                {weekOptions.map(week => (
                                    <SelectItem key={week} value={week.toString()} className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                        Week {week}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* View Switcher */}
                <div className="space-y-2">
                    <label className="text-sm font-medium bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        View
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {VIEWS.map(view => (
                            <Button
                                key={view.id}
                                onClick={() => handleViewChange(view.id)}
                                variant={selectedView === view.id ? "default" : "outline"}
                                className={`
                ${selectedView === view.id
                                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 border-pink-400 shadow-lg'
                                        : 'bg-gradient-to-r from-pink-100 to-purple-100 text-gray-700 border-pink-300 hover:from-pink-200 hover:to-purple-200'
                                    }
                transition-all duration-200 font-medium
              `}
                            >
                                {view.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Additional Filters */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Filter className="h-4 w-4" />
                            <span>Additional filters</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <EventFilters
                                currentFilter={currentFilter}
                                onFilterChange={handleFilterChange}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-medium">
                        <Calendar className="h-4 w-4" />
                        <span>{filteredEvents.length} events</span>
                    </div>
                </div>
            </div>

            {/* Timetable Content */}
            <div className="min-h-[600px]">
                <TimetableGrid
                    view={selectedView}
                    events={filteredEvents}
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                    onEventClick={onEventClick}
                />
            </div>

            {/* Context Information */}
            <div className="p-4">
                <div className="text-center text-sm text-gray-600 space-y-1">
                    <div>
                        <span className="font-medium bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{selectedTerm}</span>
                        {' • '}
                        <span className="font-medium bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Week {selectedWeek}</span>
                        {' • '}
                        <span className="font-medium bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{VIEWS.find(v => v.id === selectedView)?.label} View</span>
                    </div>
                    <div className="text-xs">
                        Times shown in 12-hour format • Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timetable;
