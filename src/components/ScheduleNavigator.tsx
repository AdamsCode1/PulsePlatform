import { useState } from 'react';
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Video, BookOpen, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types/Event';

interface ScheduleNavigatorProps {
    events: Event[];
    onDateSelect?: (date: Date) => void;
    selectedDate?: Date;
    onMonthlyViewClick?: () => void;
}

const ScheduleNavigator = ({ events, onDateSelect, selectedDate, onMonthlyViewClick }: ScheduleNavigatorProps) => {
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
    const [currentSelectedDate, setCurrentSelectedDate] = useState(selectedDate || new Date());

    // Generate the week dates (5 days for work week)
    const weekDays = Array.from({ length: 5 }, (_, i) => addDays(currentWeekStart, i));

    const getEventsForDay = (date: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return isSameDay(eventDate, date);
        });
    };

    const handlePreviousWeek = () => {
        setCurrentWeekStart(addDays(currentWeekStart, -7));
    };

    const handleNextWeek = () => {
        setCurrentWeekStart(addDays(currentWeekStart, 7));
    };

    const handleDateClick = (date: Date) => {
        setCurrentSelectedDate(date);
        onDateSelect?.(date);
    };

    const selectedDayEvents = getEventsForDay(currentSelectedDate);

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-dupulse-off-white via-dupulse-light-pink/10 to-dupulse-purple/5">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm border-b border-dupulse-purple/10">
                <h1 className="text-3xl font-bold text-gray-800">My Schedule</h1>
                <Button
                    onClick={onMonthlyViewClick}
                    variant="outline"
                    className="bg-gradient-to-r from-dupulse-pink to-dupulse-purple text-white border-none hover:shadow-lg transition-all duration-300"
                >
                    <Calendar className="h-4 w-4 mr-2" />
                    Monthly View
                </Button>
            </div>

            {/* Date Navigator */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePreviousWeek}
                        className="h-10 w-10 p-0 hover:bg-dupulse-purple/10"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <div className="flex space-x-2">
                        {weekDays.map((day, index) => {
                            const isSelected = isSameDay(day, currentSelectedDate);
                            const isTodayDate = isToday(day);
                            const dayEvents = getEventsForDay(day);

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleDateClick(day)}
                                    className={`
                    relative cursor-pointer p-4 rounded-2xl transition-all duration-300 min-w-[80px] text-center
                    ${isSelected
                                            ? 'bg-gradient-to-br from-dupulse-pink to-dupulse-purple text-white shadow-lg scale-105'
                                            : isTodayDate
                                                ? 'bg-dupulse-yellow/20 border-2 border-dupulse-yellow'
                                                : 'bg-white/70 hover:bg-dupulse-light-pink/20 border border-gray-200'
                                        }
                  `}
                                >
                                    <div className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                        {format(day, 'dd')}
                                    </div>
                                    <div className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                                        {format(day, 'EEE')}
                                    </div>
                                    {dayEvents.length > 0 && (
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-dupulse-red rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">{dayEvents.length}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextWeek}
                        className="h-10 w-10 p-0 hover:bg-dupulse-purple/10"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Events List */}
            <div className="px-6 pb-6">
                <div className="space-y-4">
                    {selectedDayEvents.length === 0 ? (
                        <Card className="p-8 text-center bg-white/50 border-dupulse-purple/20">
                            <div className="text-gray-500">
                                <Calendar className="h-12 w-12 mx-auto mb-4 text-dupulse-purple/50" />
                                <p className="text-lg font-medium">No events scheduled</p>
                                <p className="text-sm">for {format(currentSelectedDate, 'EEEE, MMMM d')}</p>
                            </div>
                        </Card>
                    ) : (
                        selectedDayEvents.map((event, index) => (
                            <Card key={event.id} className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                                <CardContent className="p-0">
                                    <div className="flex">
                                        {/* Left Content */}
                                        <div className="flex-1 p-6">
                                            <div className="flex items-start space-x-4">
                                                {/* Instructor Avatar Placeholder */}
                                                <div className="h-12 w-12 bg-gradient-to-r from-dupulse-pink to-dupulse-purple rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">
                                                        {event.societyName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </span>
                                                </div>

                                                <div className="flex-1">
                                                    {/* Instructor Name */}
                                                    <p className="text-sm text-gray-600 mb-1">{event.societyName}</p>

                                                    {/* Event Title */}
                                                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                                                        {event.eventName}
                                                    </h3>

                                                    {/* Time Badge */}
                                                    {event.time && (
                                                        <Badge className="bg-gradient-to-r from-dupulse-cyan to-dupulse-green text-white mb-3">
                                                            {event.time} {event.endTime && `- ${event.endTime}`}
                                                        </Badge>
                                                    )}

                                                    {/* Location */}
                                                    {event.location && (
                                                        <p className="text-sm text-gray-600 mb-3">📍 {event.location}</p>
                                                    )}

                                                    {/* Materials/Activities */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Video className="h-4 w-4 text-dupulse-purple" />
                                                            <span className="text-sm text-gray-700">Videos</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <BookOpen className="h-4 w-4 text-dupulse-purple" />
                                                            <span className="text-sm text-gray-700">Reading Materials</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <ClipboardCheck className="h-4 w-4 text-dupulse-purple" />
                                                            <span className="text-sm text-gray-700">Test</span>
                                                        </div>
                                                    </div>

                                                    {/* Live Badge */}
                                                    {index === 0 && isToday(currentSelectedDate) && (
                                                        <Badge className="absolute top-4 left-4 bg-dupulse-red text-white animate-pulse">
                                                            Live
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Image */}
                                        <div className="w-48 h-full bg-gradient-to-br from-dupulse-light-pink/30 to-dupulse-purple/30 flex items-center justify-center">
                                            {event.imageUrl ? (
                                                <img
                                                    src={event.imageUrl}
                                                    alt={event.eventName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-32 bg-gradient-to-br from-dupulse-light-pink/50 to-dupulse-purple/50 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mb-2 mx-auto">
                                                            <Calendar className="h-8 w-8 text-dupulse-purple" />
                                                        </div>
                                                        <p className="text-xs text-dupulse-purple font-medium">Event Image</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScheduleNavigator;
