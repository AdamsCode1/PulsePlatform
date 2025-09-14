import { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Event } from '@/types/Event';

interface WeeklyScheduleNavigatorProps {
    events: Event[];
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    onEventClick?: (eventId: string) => void;
}

const WeeklyScheduleNavigator = ({ events, selectedDate, onDateChange, onEventClick }: WeeklyScheduleNavigatorProps) => {
    const [currentWeek, setCurrentWeek] = useState(startOfWeek(selectedDate));

    // Generate week days starting from the current week
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

    // Get events for the selected date
    const getEventsForDate = (date: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return isSameDay(eventDate, date);
        });
    };

    const selectedDateEvents = getEventsForDate(selectedDate);

    const handlePreviousWeek = () => {
        const newWeek = subDays(currentWeek, 7);
        setCurrentWeek(newWeek);
    };

    const handleNextWeek = () => {
        const newWeek = addDays(currentWeek, 7);
        setCurrentWeek(newWeek);
    };

    const handleDateSelect = (date: Date) => {
        onDateChange(date);
    };

    return (
        <div className="w-full space-y-6">
            {/* Header with Month/Year and Navigation */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-dupulse-pink via-dupulse-purple to-dupulse-pink bg-clip-text text-transparent">
                    {format(selectedDate, 'MMMM yyyy')}
                </h1>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousWeek}
                        className="border-dupulse-purple/30 hover:bg-dupulse-purple/10"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextWeek}
                        className="border-dupulse-purple/30 hover:bg-dupulse-purple/10"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Top Navigation Bar - Horizontal Date Picker */}
            <Card className="w-full border-none shadow-lg bg-gradient-to-r from-dupulse-light-pink/20 via-dupulse-purple/20 to-dupulse-light-pink/20">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide">
                        {weekDays.map((day, index) => {
                            const isSelected = isSameDay(day, selectedDate);
                            const isToday = isSameDay(day, new Date());
                            const dayEvents = getEventsForDate(day);

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleDateSelect(day)}
                                    className={`
                    flex-shrink-0 flex flex-col items-center justify-center min-w-[70px] lg:min-w-[80px] 
                    h-16 lg:h-20 rounded-2xl transition-all duration-300 transform hover:scale-105
                    ${isSelected
                                            ? 'bg-gradient-to-br from-dupulse-pink to-dupulse-purple text-white shadow-lg shadow-dupulse-purple/30'
                                            : isToday
                                                ? 'bg-gradient-to-br from-dupulse-light-pink/40 to-dupulse-purple/40 text-dupulse-purple border border-dupulse-purple/30'
                                                : 'bg-white/50 text-gray-600 hover:bg-gradient-to-br hover:from-dupulse-light-pink/30 hover:to-dupulse-purple/30 hover:text-dupulse-purple'
                                        }
                  `}
                                >
                                    <div className="text-xs lg:text-sm font-medium uppercase tracking-wide">
                                        {format(day, 'EEE')}
                                    </div>
                                    <div className={`text-lg lg:text-xl font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                        {format(day, 'd')}
                                    </div>

                                    {/* Event indicator */}
                                    {dayEvents.length > 0 && (
                                        <div className={`
                      w-2 h-2 rounded-full mt-1 
                      ${isSelected ? 'bg-white' : 'bg-dupulse-pink'}
                    `} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Selected Date Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                        {format(selectedDate, 'EEEE')}
                    </h2>
                    <div className="text-lg text-gray-600">
                        {format(selectedDate, 'd MMM')}
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-gradient-to-r from-dupulse-pink to-dupulse-purple text-white px-4 py-2 rounded-full">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">
                        {selectedDateEvents.length} events
                    </span>
                </div>
            </div>

            {/* Event Cards Section */}
            <div className="space-y-4">
                {selectedDateEvents.length === 0 ? (
                    <Card className="w-full border-none shadow-lg bg-gradient-to-br from-dupulse-off-white via-dupulse-light-pink/10 to-dupulse-purple/10">
                        <CardContent className="p-8 text-center">
                            <div className="mb-4">
                                <Calendar className="mx-auto h-16 w-16 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No events found</h3>
                            <p className="text-gray-500">
                                Try a different filter or check back later!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    selectedDateEvents.map((event, index) => (
                        <Card
                            key={event.id}
                            className="w-full border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-r from-white via-dupulse-light-pink/5 to-dupulse-purple/5 cursor-pointer"
                            onClick={() => onEventClick?.(event.id)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    {/* Instructor Avatar - Placeholder for now */}
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-dupulse-pink to-dupulse-purple flex items-center justify-center text-white font-bold text-lg">
                                            {event.societyName.charAt(0).toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Event Details */}
                                    <div className="flex-1 min-w-0">
                                        {/* Society/Organizer Name */}
                                        <div className="text-sm text-gray-600 mb-1">
                                            {event.societyName}
                                        </div>

                                        {/* Event Name */}
                                        <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                                            {event.eventName}
                                        </h3>

                                        {/* Event Details List */}
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-dupulse-pink"></div>
                                                <span>Time: {format(new Date(event.time), 'HH:mm')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-dupulse-purple"></div>
                                                <span>Location: {event.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-dupulse-light-pink"></div>
                                                <span>Attendees: {event.attendeeCount}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Event Thumbnail */}
                                    <div className="flex-shrink-0 hidden sm:block">
                                        <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg bg-gradient-to-br from-dupulse-light-pink/30 to-dupulse-purple/30 flex items-center justify-center">
                                            {event.imageUrl && event.imageUrl !== '/placeholder.svg' ? (
                                                <img
                                                    src={event.imageUrl}
                                                    alt={event.eventName}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <Calendar className="h-8 w-8 text-dupulse-purple" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default WeeklyScheduleNavigator;
