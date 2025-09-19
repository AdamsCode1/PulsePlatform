import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, startOfDay, endOfDay, isSameDay, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Calendar, ChevronDown, Filter, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Event } from '@/types/Event';
import TimetableLoadingSkeleton from './TimetableLoadingSkeleton';
import EventCard from './EventCard';

// Academic Terms
const ACADEMIC_TERMS = [
    {
        id: 'michaelmas',
        label: 'Michaelmas Term',
        startDate: new Date(2025, 9, 6), // October 6, 2025
        endDate: new Date(2025, 11, 12), // December 12, 2025
        color: 'bg-blue-500',
        checked: true
    },
    {
        id: 'epiphany',
        label: 'Epiphany Term',
        startDate: new Date(2026, 0, 12), // January 12, 2026
        endDate: new Date(2026, 2, 20), // March 20, 2026
        color: 'bg-green-500',
        checked: false
    },
    {
        id: 'easter',
        label: 'Easter Term',
        startDate: new Date(2026, 3, 27), // April 27, 2026
        endDate: new Date(2026, 5, 26), // June 26, 2026
        color: 'bg-purple-500',
        checked: false
    },
];

// View options
const VIEWS = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' }
] as const;

type ViewType = typeof VIEWS[number]['id'];

interface TimetableProps {
    events: Event[];
    onEventClick?: (eventId: string) => void;
    isLoading?: boolean;
    error?: string | null;
}

const Timetable = ({ events, onEventClick, isLoading, error }: TimetableProps) => {
    // Core state
    const [selectedView, setSelectedView] = useState<ViewType>('daily');
    const [currentDate, setCurrentDate] = useState(new Date()); // Start with today's date
    const [activeTerms, setActiveTerms] = useState<string[]>(['michaelmas']);    // Get events for a specific date
    const getEventsForDate = (date: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            const isSameDate = isSameDay(eventDate, date);

            // Apply term filtering
            if (activeTerms.length > 0) {
                const isInActiveTerm = activeTerms.some(termId => {
                    const term = ACADEMIC_TERMS.find(t => t.id === termId);
                    if (!term) return false;
                    return eventDate >= term.startDate && eventDate <= term.endDate;
                });
                return isSameDate && isInActiveTerm;
            }

            return isSameDate;
        });
    };

    // Get the term that an event falls into
    const getEventTerm = (eventDate: Date) => {
        return ACADEMIC_TERMS.find(term =>
            eventDate >= term.startDate && eventDate <= term.endDate
        );
    };

    // Get color for event based on its term
    const getEventTermColor = (eventDate: Date) => {
        const term = getEventTerm(eventDate);
        if (!term) return 'from-gray-400 to-gray-500'; // Default color for events outside terms

        switch (term.id) {
            case 'michaelmas':
                return 'from-blue-400 to-blue-600';
            case 'epiphany':
                return 'from-green-400 to-green-600';
            case 'easter':
                return 'from-purple-400 to-purple-600';
            default:
                return 'from-gray-400 to-gray-500';
        }
    };

    // Check if date is in any active term
    const isDateInActiveTerm = (date: Date) => {
        if (activeTerms.length === 0) return true;

        return activeTerms.some(termId => {
            const term = ACADEMIC_TERMS.find(t => t.id === termId);
            if (!term) return false;
            return date >= term.startDate && date <= term.endDate;
        });
    };

    // Toggle term selection
    const toggleTerm = (termId: string) => {
        setActiveTerms(prev =>
            prev.includes(termId)
                ? prev.filter(id => id !== termId)
                : [...prev, termId]
        );
    };

    // Handle month navigation
    const handlePrevMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };

    // Render mini calendar
    const renderMiniCalendar = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);
        const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

        return (
            <div className="bg-white rounded-lg border p-3">
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
                        const isSelected = isSameDay(day, currentDate);

                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => setCurrentDate(day)}
                                className={`
                                    p-1 rounded text-center hover:bg-gray-100
                                    ${isCurrentMonth ? 'text-gray-800' : 'text-gray-300'}
                                    ${isToday ? 'bg-orange-500 text-white hover:bg-orange-600' : ''}
                                    ${isSelected ? 'bg-blue-500 text-white' : ''}
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

    // Render daily view (weekly layout with current day highlighted)
    const renderDailyView = () => {
        const weekStart = startOfWeek(currentDate);
        const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
        const today = new Date();

        return (
            <div className="bg-white rounded-lg border overflow-hidden">
                {/* Header with Timetable title */}
                <div className="p-3 md:p-4 border-b bg-gray-50">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Timetable</h3>
                </div>

                {/* Week days header with navigation - individual boxes */}
                <div className="relative p-3 md:p-6">
                    {/* Navigation arrows */}
                    <button
                        onClick={() => setCurrentDate(addDays(currentDate, -7))}
                        className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 p-1 md:p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
                    >
                        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                    </button>
                    <button
                        onClick={() => setCurrentDate(addDays(currentDate, 7))}
                        className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 p-1 md:p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
                    >
                        <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                    </button>

                    {/* Individual day boxes */}
                    <div className="flex justify-center gap-1 md:gap-3 px-8 md:px-0">
                        {weekDays.map((day, index) => {
                            const isToday = isSameDay(day, today);
                            const isCurrentDay = isSameDay(day, currentDate);

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`
                                        relative text-center cursor-pointer transition-all duration-200
                                        ${isCurrentDay
                                            ? 'bg-white rounded-lg shadow-md p-2 md:p-4 min-w-[50px] md:min-w-[90px]'
                                            : 'p-1 md:p-3 min-w-[45px] md:min-w-[80px] hover:bg-gray-50 rounded-lg'
                                        }
                                    `}
                                    onClick={() => setCurrentDate(day)}
                                >
                                    {/* "Now" indicator positioned above today's date */}
                                    {isToday && (
                                        <div className="absolute -top-4 md:-top-6 left-1/2 transform -translate-x-1/2">
                                            <span className="text-xs text-gray-500 font-medium">Now</span>
                                        </div>
                                    )}

                                    <div className={`text-xs font-medium mb-1 md:mb-2 ${isCurrentDay ? 'text-gray-600' : 'text-gray-400'
                                        }`}>
                                        {format(day, 'EEE')}
                                    </div>
                                    <div className={`
                                        ${isCurrentDay
                                            ? 'text-xl md:text-4xl font-black text-gray-900'
                                            : 'text-lg md:text-2xl font-normal text-gray-400'
                                        }
                                    `}>
                                        {format(day, 'd')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Events content area */}
                <div className="p-4 md:p-8">
                    {(() => {
                        const dayEvents = getEventsForDate(currentDate);

                        if (dayEvents.length === 0) {
                            return (
                                <div className="text-center">
                                    <div className="flex flex-col items-center justify-center min-h-[150px] md:min-h-[200px]">
                                        <Calendar className="h-12 w-12 md:h-16 md:w-16 text-gray-300 mb-4" />
                                        <p className="text-gray-500 text-sm">
                                            No events scheduled for {format(currentDate, 'MMMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-4">
                                <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
                                    Events for {format(currentDate, 'MMMM d, yyyy')}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">{dayEvents.map(event => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onClick={() => onEventClick?.(event.id)}
                                    />
                                ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        );
    };

    // Render weekly view
    const renderWeeklyView = () => {
        const weekStart = startOfWeek(currentDate);
        const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
        const timeSlots = Array.from({ length: 24 }, (_, i) => i); // 0-23 hours

        return (
            <div className="bg-white rounded-lg border overflow-hidden">
                {/* Header */}
                <div className="p-2 sm:p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm sm:text-lg font-semibold text-gray-900">
                            Week of {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                        </h3>
                        <div className="flex gap-1 sm:gap-2">
                            <button
                                onClick={() => setCurrentDate(addDays(currentDate, -7))}
                                className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            </button>
                            <button
                                onClick={() => setCurrentDate(addDays(currentDate, 7))}
                                className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="overflow-auto max-h-[400px] sm:max-h-[600px]">
                    <div className="grid grid-cols-8 w-full">
                        {/* Time column header */}
                        <div className="bg-gray-50 border-r border-b p-1 sm:p-2 text-xs font-medium text-gray-600 text-center">
                            <span className="hidden sm:inline">Time</span>
                            <span className="sm:hidden">T</span>
                        </div>

                        {/* Day headers */}
                        {weekDays.map((day) => {
                            const isToday = isSameDay(day, new Date());
                            const isSelected = isSameDay(day, currentDate);

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`bg-gray-50 border-r border-b p-1 sm:p-2 text-center cursor-pointer hover:bg-gray-100 ${isSelected ? 'bg-blue-100' : ''
                                        }`}
                                    onClick={() => setCurrentDate(day)}
                                >
                                    <div className="text-xs font-medium text-gray-600 mb-1">
                                        <span className="hidden sm:inline">{format(day, 'EEE').toUpperCase()}</span>
                                        <span className="sm:hidden">{format(day, 'EE')}</span>
                                    </div>
                                    <div className={`text-sm sm:text-lg font-bold ${isToday ? 'text-blue-600 bg-blue-100 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mx-auto text-xs sm:text-base' :
                                        isSelected ? 'text-blue-600' : 'text-gray-900'
                                        }`}>
                                        {format(day, 'd')}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Time slots and events */}
                        {timeSlots.map((hour) => (
                            <React.Fragment key={hour}>
                                {/* Time label */}
                                <div className="border-r border-b p-1 sm:p-2 text-xs text-gray-500 text-center bg-gray-50">
                                    <span className="hidden sm:inline">
                                        {hour === 0 ? '12:00 AM' :
                                            hour < 12 ? `${hour}:00 AM` :
                                                hour === 12 ? '12:00 PM' :
                                                    `${hour - 12}:00 PM`}
                                    </span>
                                    <span className="sm:hidden">
                                        {hour === 0 ? '12A' :
                                            hour < 12 ? `${hour}A` :
                                                hour === 12 ? '12P' :
                                                    `${hour - 12}P`}
                                    </span>
                                </div>

                                {/* Day cells */}
                                {weekDays.map((day) => {
                                    const dayEvents = getEventsForDate(day);
                                    const hourEvents = dayEvents.filter(event => {
                                        const eventHour = new Date(event.time).getHours();
                                        return eventHour === hour;
                                    });

                                    return (
                                        <div
                                            key={`${day.toISOString()}-${hour}`}
                                            className="border-r border-b min-h-[40px] sm:min-h-[80px] p-0.5 sm:p-1 relative hover:bg-gray-50 cursor-pointer"
                                            onClick={() => setCurrentDate(day)}
                                        >
                                            {hourEvents.map((event, index) => {
                                                const eventDate = new Date(event.date);
                                                const termColors = getEventTermColor(eventDate);

                                                return (
                                                    <div
                                                        key={event.id}
                                                        className={`absolute inset-x-0.5 sm:inset-x-1 bg-gradient-to-r ${termColors} text-white border-l-2 sm:border-l-4 border-white rounded p-1 sm:p-2 text-xs cursor-pointer hover:shadow-md transition-shadow overflow-hidden h-5 sm:h-12`}
                                                        style={{
                                                            top: `${index * 25}px`,
                                                            zIndex: 10
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEventClick?.(event.id);
                                                        }}
                                                    >
                                                        <div className="h-full flex flex-col justify-center">
                                                            <div className="font-medium text-white truncate text-xs leading-tight mb-0 sm:mb-1">
                                                                <span className="hidden sm:inline">{event.eventName}</span>
                                                                <span className="sm:hidden">{event.eventName.substring(0, 8)}...</span>
                                                            </div>
                                                            <div className="hidden sm:block text-white/90 text-xs truncate leading-tight">
                                                                {format(new Date(event.time), 'HH:mm')}
                                                                {event.location && ` • ${event.location}`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        );
    };
    const renderMainCalendar = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);
        const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

        return (
            <div className="bg-white rounded-lg border overflow-hidden">
                {/* Calendar Header */}
                <div className="grid grid-cols-7 bg-gray-50 border-b">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                        <div key={day} className="p-2 text-center text-xs font-medium text-gray-600 border-r last:border-r-0">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                    {calendarDays.map(day => {
                        const dayEvents = getEventsForDate(day);
                        const isCurrentMonth = day >= monthStart && day <= monthEnd;
                        const isToday = isSameDay(day, new Date());
                        const isInActiveTerm = isDateInActiveTerm(day);

                        return (
                            <div
                                key={day.toISOString()}
                                className={`
                                    relative min-h-[100px] p-2 border-r border-b last:border-r-0
                                    ${isCurrentMonth ?
                                        (isInActiveTerm ? 'bg-white' : 'bg-gray-100 opacity-50')
                                        : 'bg-gray-50 opacity-30'
                                    }
                                    ${isInActiveTerm ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed'} 
                                    transition-colors
                                `}
                                onClick={() => isInActiveTerm && setCurrentDate(day)}
                            >
                                <div className={`
                                    text-xs font-medium mb-1
                                    ${isToday && isInActiveTerm ? 'text-orange-600 font-bold' :
                                        isCurrentMonth && isInActiveTerm ? 'text-gray-900' : 'text-gray-400'}
                                `}>
                                    {format(day, 'd')}
                                </div>

                                {/* Show "break" for dates not in any term */}
                                {isCurrentMonth && !isInActiveTerm && (
                                    <div className="flex items-center justify-center h-12">
                                        <span className="text-xs text-gray-500 font-medium italic">
                                            break
                                        </span>
                                    </div>
                                )}

                                {/* Show events for dates in active terms */}
                                {isCurrentMonth && isInActiveTerm && dayEvents.length > 0 && (
                                    <div className="space-y-1">
                                        {dayEvents.slice(0, 1).map(event => {
                                            const eventDate = new Date(event.date);
                                            const termColors = getEventTermColor(eventDate);

                                            return (
                                                <div
                                                    key={event.id}
                                                    className={`p-1 bg-gradient-to-r ${termColors} text-white text-xs rounded cursor-pointer hover:opacity-80 transition-opacity`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEventClick?.(event.id);
                                                    }}
                                                >
                                                    <div className="font-medium truncate text-xs">{event.eventName}</div>
                                                    <div className="text-xs">{format(new Date(event.time), 'HH:mm')}</div>
                                                </div>
                                            );
                                        })}
                                        {dayEvents.length > 1 && (
                                            <div className="text-xs text-gray-500 text-center">
                                                +{dayEvents.length - 1} more
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
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
        <div className="w-full bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b px-4 md:px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg md:text-2xl font-semibold text-gray-900">
                        Browse events and manage your timetable
                    </h1>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm"
                        onClick={() => {
                            // Check if user is logged in (you can replace this with your actual auth check)
                            const isLoggedIn = localStorage.getItem('societyAuth') || sessionStorage.getItem('societyAuth');

                            if (isLoggedIn) {
                                // Redirect to society dashboard
                                window.location.href = '/society/dashboard';
                            } else {
                                // Redirect to society login page
                                window.location.href = '/login/society';
                            }
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Add Event</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
                {/* Left Sidebar */}
                <div className="w-full lg:w-72 bg-white border-b lg:border-r lg:border-b-0 p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-y-auto">
                    {/* Academic Terms */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Academic Terms</h3>
                        <div className="space-y-3">
                            {ACADEMIC_TERMS.map(term => (
                                <label key={term.id} className="flex items-start space-x-3 cursor-pointer">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            checked={activeTerms.includes(term.id)}
                                            onChange={() => toggleTerm(term.id)}
                                            className="sr-only"
                                        />
                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center
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
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${term.color} mt-0.5`}></div>
                                        <div className="flex-1">
                                            <span className="text-sm text-gray-700 font-medium block">{term.label}</span>
                                            <span className="text-xs text-gray-500">
                                                {format(term.startDate, 'MMM d, yyyy')} - {format(term.endDate, 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Mini Calendar */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Calendar</h3>
                        {renderMiniCalendar()}
                    </div>

                    {/* Category Filter */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Category</h3>
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="academic">Academic</SelectItem>
                                <SelectItem value="social">Social</SelectItem>
                                <SelectItem value="sports">Sports</SelectItem>
                                <SelectItem value="cultural">Cultural</SelectItem>
                                <SelectItem value="career">Career</SelectItem>
                                <SelectItem value="volunteer">Volunteer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* View Toggle */}
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4 lg:p-6">
                    {/* Tab Navigation */}
                    <div className="mb-6">
                        <div className="flex space-x-8 border-b border-gray-200">
                            <div className="text-lg font-medium text-gray-900 pb-2">
                                Calendar
                            </div>
                            <button
                                onClick={() => setSelectedView('monthly')}
                                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${selectedView === 'monthly'
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setSelectedView('weekly')}
                                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${selectedView === 'weekly'
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Weekly
                            </button>
                            <button
                                onClick={() => setSelectedView('daily')}
                                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${selectedView === 'daily'
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Daily
                            </button>
                        </div>
                    </div>

                    {selectedView === 'daily' ? (
                        renderDailyView()
                    ) : selectedView === 'weekly' ? (
                        renderWeeklyView()
                    ) : (
                        <>
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                                        {format(currentDate, 'MMMM yyyy')}
                                    </h2>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={handlePrevMonth}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={handleNextMonth}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Calendar */}
                            {renderMainCalendar()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Timetable;
