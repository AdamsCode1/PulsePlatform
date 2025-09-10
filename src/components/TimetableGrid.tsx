import { useState } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Event } from '@/types/Event';

// Add custom styles for hiding scrollbar
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

type ViewType = 'day' | '4-day' | 'week' | 'month';

interface TimetableGridProps {
    view: ViewType;
    events: Event[];
    currentDate: Date;
    onDateChange: (date: Date) => void;
    onEventClick?: (eventId: string) => void;
}

// Academic terms with date ranges
const ACADEMIC_TERMS = [
    {
        id: 'michaelmas',
        label: 'Michaelmas Term',
        startDate: new Date(2025, 9, 6), // October 6, 2025
        endDate: new Date(2025, 11, 12), // December 12, 2025
        color: 'bg-blue-500',
        lightColor: 'bg-blue-100',
        textColor: 'text-blue-700'
    },
    {
        id: 'epiphany',
        label: 'Epiphany Term',
        startDate: new Date(2026, 0, 12), // January 12, 2026
        endDate: new Date(2026, 2, 20), // March 20, 2026
        color: 'bg-green-500',
        lightColor: 'bg-green-100',
        textColor: 'text-green-700'
    },
    {
        id: 'easter',
        label: 'Easter Term',
        startDate: new Date(2026, 3, 27), // April 27, 2026
        endDate: new Date(2026, 5, 26), // June 26, 2026
        color: 'bg-purple-500',
        lightColor: 'bg-purple-100',
        textColor: 'text-purple-700'
    },
];

// Event categories with colors
const EVENT_CATEGORIES = [
    { id: 'work-orders', label: 'Work Orders', color: 'bg-orange-500', lightColor: 'bg-orange-100', textColor: 'text-orange-700' },
    { id: 'move-ins', label: 'Move-Ins', color: 'bg-green-500', lightColor: 'bg-green-100', textColor: 'text-green-700' },
    { id: 'move-outs', label: 'Move-Outs', color: 'bg-purple-500', lightColor: 'bg-purple-100', textColor: 'text-purple-700' },
    { id: 'notes', label: 'Notes & Reminders', color: 'bg-amber-500', lightColor: 'bg-amber-100', textColor: 'text-amber-700' },
];

const TimetableGrid = ({ view, events, currentDate, onDateChange, onEventClick }: TimetableGridProps) => {
    const [activeTerms, setActiveTerms] = useState<string[]>(ACADEMIC_TERMS.map(term => term.id));
    const [currentView, setCurrentView] = useState<ViewType>('day');

    const getEventsForDate = (date: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return isSameDay(eventDate, date);
        }).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    };

    const isDateInActiveTerm = (date: Date) => {
        // If no terms are selected, show all dates
        if (activeTerms.length === 0) return true;

        return activeTerms.some(termId => {
            const term = ACADEMIC_TERMS.find(t => t.id === termId);
            if (!term) return false;

            return date >= term.startDate && date <= term.endDate;
        });
    };

    const isDateInAnyTerm = (date: Date) => {
        return ACADEMIC_TERMS.some(term =>
            date >= term.startDate && date <= term.endDate
        );
    };

    const getCategoryForEvent = (event: Event) => {
        // Mock categorization based on event name - in production this would come from event data
        const eventName = event.eventName.toLowerCase();
        if (eventName.includes('work') || eventName.includes('order')) return EVENT_CATEGORIES[0];
        if (eventName.includes('move') && eventName.includes('in')) return EVENT_CATEGORIES[1];
        if (eventName.includes('move') && eventName.includes('out')) return EVENT_CATEGORIES[2];
        return EVENT_CATEGORIES[3]; // Default to Notes & Reminders
    };

    const handlePrevMonth = () => {
        onDateChange(subMonths(currentDate, 1));
    };

    const handleNextMonth = () => {
        onDateChange(addMonths(currentDate, 1));
    };

    const toggleTerm = (termId: string) => {
        setActiveTerms(prev =>
            prev.includes(termId)
                ? prev.filter(id => id !== termId)
                : [...prev, termId]
        );
    };

    const renderMiniCalendar = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);
        const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

        return (
            <div className="bg-white rounded-lg shadow-sm border p-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                        {format(currentDate, 'MMM yyyy')}
                    </span>
                    <div className="flex gap-1">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded">
                            <ChevronLeft className="h-3 w-3" />
                        </button>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded">
                            <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-xs">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                        <div key={day} className="text-center text-gray-500 font-medium p-1">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-xs">
                    {calendarDays.map(day => {
                        const isCurrentMonth = day >= monthStart && day <= monthEnd;
                        const isToday = isSameDay(day, new Date());

                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => onDateChange(day)}
                                className={`
                                    p-1 rounded text-center hover:bg-gray-100
                                    ${isCurrentMonth ? 'text-gray-800' : 'text-gray-300'}
                                    ${isToday ? 'bg-orange-500 text-white hover:bg-orange-600' : ''}
                                `}
                            >
                                {format(day, 'd')}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderSidebar = () => {
        return (
            <div className="w-64 space-y-4">
                {/* Academic Term Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Academic Terms</h3>
                    <div className="space-y-3">
                        {ACADEMIC_TERMS.map(term => (
                            <label key={term.id} className="flex items-start space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={activeTerms.includes(term.id)}
                                    onChange={() => toggleTerm(term.id)}
                                    className="sr-only"
                                />
                                <div className={`w-3 h-3 rounded-full ${term.color} mt-0.5`}></div>
                                <div className="flex-1">
                                    <span className="text-sm text-gray-700 font-medium block">{term.label}</span>
                                    <span className="text-xs text-gray-500">
                                        {format(term.startDate, 'MMM d, yyyy')} - {format(term.endDate, 'MMM d, yyyy')}
                                    </span>
                                </div>
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5
                                    ${activeTerms.includes(term.id)
                                        ? 'bg-gray-800 border-gray-800'
                                        : 'border-gray-300'
                                    }`}
                                >
                                    {activeTerms.includes(term.id) && (
                                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Mini Calendar */}
                {renderMiniCalendar()}

                {/* View Toggle */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">View</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => setCurrentView('day')}
                            className={`w-full text-left text-sm p-2 rounded ${currentView === 'day' ? 'bg-gray-100' : ''}`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setCurrentView('week')}
                            className={`w-full text-left text-sm p-2 rounded ${currentView === 'week' ? 'bg-gray-100' : ''}`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setCurrentView('month')}
                            className={`w-full text-left text-sm p-2 rounded ${currentView === 'month' ? 'bg-gray-100' : ''}`}
                        >
                            Monthly
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderEventTag = (event: Event, compact = false) => {
        const category = getCategoryForEvent(event);

        if (compact) {
            // Compact view - just show category icon and count (handled in calendar grid)
            return null;
        }

        // Comfort view - full event details
        return (
            <div className={`p-2 rounded-lg ${category.lightColor} border-l-4 ${category.color} hover:shadow-sm transition-all`}>
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1">
                        <span className={`text-sm font-bold ${category.textColor}`}>
                            {category.id === 'move-ins' ? '↗' : category.id === 'move-outs' ? '↗' : category.id === 'work-orders' ? '📋' : '📄'}
                        </span>
                        <span className={`text-sm font-bold ${category.textColor}`}>
                            {event.id}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                        {format(new Date(event.time), 'h:mm a')}
                    </div>
                </div>
                <div className="text-sm font-semibold text-gray-800">
                    {event.societyName || 'Nicole Spencer'}
                </div>
                {/* Add description for single entry comfort view */}
                {event.description && (
                    <div className="text-xs text-gray-600 mt-1">
                        {event.description}
                    </div>
                )}
            </div>
        );
    };

    const renderCompactEventDisplay = (dayEvents: Event[], category: any) => {
        const categoryEvents = dayEvents.filter(event =>
            getCategoryForEvent(event).id === category.id
        );

        if (categoryEvents.length === 0) return null;

        const eventCount = categoryEvents.length;

        return (
            <div className="flex items-center justify-between p-1 rounded" key={category.id}>
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-sm ${category.color} flex items-center justify-center`}>
                        <span className="text-white text-xs font-bold">
                            {category.id === 'move-ins' ? '↗' : category.id === 'move-outs' ? '↗' : category.id === 'work-orders' ? '📋' : '📄'}
                        </span>
                    </div>
                    <span className="text-xs text-gray-700 font-medium">
                        {category.label}
                    </span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${category.color} text-white`}>
                    {eventCount}
                </span>
            </div>
        );
    };

    const renderComfortEventDisplay = (dayEvents: Event[]) => {
        if (dayEvents.length === 0) return null;

        // Show different layouts based on number of events
        if (dayEvents.length === 1) {
            // Single entry - show with description
            const event = dayEvents[0];
            const category = getCategoryForEvent(event);

            return (
                <div className={`p-3 rounded-lg ${category.lightColor} border-l-4 ${category.color}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1">
                            <span className={`text-sm font-bold ${category.textColor}`}>
                                {category.id === 'move-ins' ? '↗' : category.id === 'move-outs' ? '↗' : category.id === 'work-orders' ? '📋' : '📄'}
                            </span>
                            <span className={`text-sm font-bold ${category.textColor}`}>
                                {event.id}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                            {format(new Date(event.time), 'h:mm a')}
                        </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-800 mb-1">
                        {event.societyName || 'Nicole Spencer'}
                    </div>
                    <div className="text-xs text-gray-600">
                        Lorem ipsum dolor sit amet laboris est
                    </div>
                </div>
            );
        } else {
            // Multiple entries - show stacked format
            return (
                <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => {
                        const category = getCategoryForEvent(event);

                        return (
                            <div
                                key={event.id}
                                className={`p-2 rounded-lg ${category.lightColor} border-l-4 ${category.color} cursor-pointer hover:shadow-sm transition-all`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEventClick?.(event.id);
                                }}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center space-x-1">
                                        <span className={`text-sm font-bold ${category.textColor}`}>
                                            {category.id === 'move-ins' ? '↗' : category.id === 'move-outs' ? '↗' : category.id === 'work-orders' ? '📋' : '📄'}
                                        </span>
                                        <span className={`text-sm font-bold ${category.textColor}`}>
                                            {event.id}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">
                                        {format(new Date(event.time), 'h:mm a')}
                                    </div>
                                </div>
                                <div className="text-sm font-semibold text-gray-800">
                                    {event.societyName || 'Nicole Spencer'}
                                </div>
                            </div>
                        );
                    })}
                    {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 text-center pt-1">
                            +{dayEvents.length - 2} more
                        </div>
                    )}
                </div>
            );
        }
    };

    const renderDailyView = () => {
        const dayEvents = getEventsForDate(currentDate).filter(event => {
            const category = getCategoryForEvent(event);
            return true; // Show all events for now
        });

        return (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-lg font-semibold text-gray-800">Schedule</h2>
                    </div>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
                    </Button>
                </div>

                {/* Centered Date Navigation */}
                <div className="p-6 border-b">
                    <div className="flex items-center justify-center space-x-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                            {format(currentDate, 'MMMM d, EEEE')}
                        </h3>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => onDateChange(addDays(currentDate, -1))}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <button
                                onClick={() => onDateChange(addDays(currentDate, 1))}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronRight className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>                {/* Event Cards */}
                <div className="p-6">
                    {dayEvents.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-lg">No events scheduled for {format(currentDate, 'MMMM d, yyyy')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-2xl mx-auto">
                            {dayEvents.map((event, eventIndex) => {
                                const category = getCategoryForEvent(event);
                                const startTime = format(new Date(event.time), 'HH:mm');
                                const endTime = format(addDays(new Date(event.time), 0).setHours(new Date(event.time).getHours() + 1, 30), 'HH:mm');

                                return (
                                    <div
                                        key={event.id}
                                        className="p-6 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                                        onClick={() => onEventClick?.(event.id)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.eventName}</h3>
                                                <p className="text-sm text-gray-600">{event.societyName}</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                {/* Participant avatars */}
                                                <div className="flex -space-x-2">
                                                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                                                    <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-white"></div>
                                                    <div className="w-8 h-8 rounded-full bg-green-400 border-2 border-white"></div>
                                                </div>
                                                {event.eventName.toLowerCase().includes('meeting') && (
                                                    <div className="w-6 h-6 text-gray-400">
                                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <span className="font-medium">{startTime} - {endTime}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    };
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const renderCalendarGrid = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);
        const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

        return (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Header with navigation */}
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <div className="flex space-x-1">
                            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-200 rounded">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-200 rounded">
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
                    </Button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 bg-gray-50 border-b">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                        <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 border-r last:border-r-0">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                    {calendarDays.map(day => {
                        const dayEvents = getEventsForDate(day).filter(event => {
                            const category = getCategoryForEvent(event);
                            return true; // Show all events, filtering is now by term dates
                        });
                        const isCurrentMonth = day >= monthStart && day <= monthEnd;
                        const isToday = isSameDay(day, new Date());
                        const isInActiveTerm = isDateInActiveTerm(day);
                        const isInAnyTerm = isDateInAnyTerm(day);

                        return (
                            <div
                                key={day.toISOString()}
                                className={`
                                    relative min-h-[120px] p-2 border-r border-b last:border-r-0
                                    ${isCurrentMonth ?
                                        (isInActiveTerm ? 'bg-white' : 'bg-gray-100 opacity-50')
                                        : 'bg-gray-50 opacity-30'
                                    }
                                    ${isInActiveTerm ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed'} 
                                    transition-colors
                                `}
                                onClick={() => isInActiveTerm && onDateChange(day)}
                            >
                                <div className={`
                                    text-sm font-medium mb-2
                                    ${isToday && isInActiveTerm ? 'text-orange-600 font-bold' :
                                        isCurrentMonth && isInActiveTerm ? 'text-gray-900' : 'text-gray-400'}
                                `}>
                                    {format(day, 'd')}
                                </div>

                                {/* Show "break" for dates not in any term */}
                                {isCurrentMonth && !isInAnyTerm && (
                                    <div className="flex items-center justify-center h-16">
                                        <span className="text-xs text-gray-500 font-medium italic">
                                            break
                                        </span>
                                    </div>
                                )}

                                {isCurrentMonth && isInActiveTerm && (
                                    <div className="space-y-1">
                                        {renderComfortEventDisplay(dayEvents)}
                                    </div>
                                )}

                                {/* Show term indicator for term start/end dates */}
                                {isCurrentMonth && ACADEMIC_TERMS.some(term =>
                                    (isSameDay(day, term.startDate) || isSameDay(day, term.endDate)) &&
                                    activeTerms.includes(term.id)
                                ) && (
                                        <div className="absolute top-1 right-1">
                                            {ACADEMIC_TERMS.map(term => {
                                                if (!activeTerms.includes(term.id)) return null;
                                                if (isSameDay(day, term.startDate)) {
                                                    return <div key={term.id} className={`w-2 h-2 rounded-full ${term.color}`} title={`${term.label} starts`}></div>;
                                                }
                                                if (isSameDay(day, term.endDate)) {
                                                    return <div key={term.id} className={`w-2 h-2 rounded-full ${term.color} opacity-50`} title={`${term.label} ends`}></div>;
                                                }
                                                return null;
                                            })}
                                        </div>
                                    )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderWeeklyView = () => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        const weekDays = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            return date;
        });

        const timeSlots = Array.from({ length: 9 }, (_, i) => {
            const hour = 9 + i;
            return `${hour}:00`;
        });

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-8 gap-2">
                    <div className="p-2"></div>
                    {weekDays.map((date, index) => {
                        const isToday = isSameDay(date, today);
                        const isInTerm = isDateInAnyTerm(date);

                        return (
                            <div
                                key={index}
                                className={`p-3 text-center rounded-lg border ${isToday
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'bg-white border-gray-200'
                                    }`}
                            >
                                <div className="text-sm font-medium">
                                    {format(date, 'EEE')}
                                </div>
                                <div className="text-lg font-semibold">
                                    {format(date, 'd')}
                                </div>
                                {!isInTerm && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        Break
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-8 gap-2">
                    <div className="space-y-2">
                        {timeSlots.map((time, index) => (
                            <div key={index} className="h-16 flex items-center text-sm text-gray-500 pr-2">
                                {time}
                            </div>
                        ))}
                    </div>

                    {weekDays.map((date, dayIndex) => {
                        const dayEvents = events.filter(event =>
                            isSameDay(parseISO(event.date), date) &&
                            (activeTerms.length === 0 || isDateInAnyTerm(date))
                        );

                        return (
                            <div key={dayIndex} className="space-y-2">
                                {timeSlots.map((time, timeIndex) => {
                                    const hour = 9 + timeIndex;
                                    const slotEvents = dayEvents.filter(event => {
                                        const eventHour = parseInt(event.time.split(':')[0]);
                                        return eventHour === hour;
                                    });

                                    return (
                                        <div key={timeIndex} className="h-16 border border-gray-100 rounded p-1">
                                            {slotEvents.map((event, eventIndex) => (
                                                <div
                                                    key={eventIndex}
                                                    className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-xs mb-1"
                                                >
                                                    <div className="font-medium text-blue-900 truncate">
                                                        {event.eventName}
                                                    </div>
                                                    <div className="text-blue-600">
                                                        {event.time}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderView = () => {
        switch (currentView) {
            case 'day':
                return renderDailyView();
            case 'week':
                return renderWeeklyView();
            case 'month':
                return renderCalendarGrid();
            default:
                return renderCalendarGrid();
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: scrollbarHideStyles }} />
            <div className="flex space-x-6">
                {renderSidebar()}
                <div className="flex-1">
                    {renderView()}
                </div>
            </div>
        </>
    );
};

export default TimetableGrid;

