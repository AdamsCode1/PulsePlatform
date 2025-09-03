import { useState } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Event } from '@/types/Event';
import ScheduleEventCard from './ScheduleEventCard';
import DateSwitcher from './DateSwitcher';

type ViewType = 'day' | '4-day' | 'week' | 'month';

interface TimetableGridProps {
    view: ViewType;
    events: Event[];
    currentDate: Date;
    onDateChange: (date: Date) => void;
    onEventClick?: (eventId: string) => void;
}

const TimetableGrid = ({ view, events, currentDate, onDateChange, onEventClick }: TimetableGridProps) => {
    const getEventsForDate = (date: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return isSameDay(eventDate, date);
        }).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    };

    const handlePrevious = () => {
        let newDate: Date;
        switch (view) {
            case 'day':
                newDate = addDays(currentDate, -1);
                break;
            case '4-day':
                newDate = addDays(currentDate, -4);
                break;
            case 'week':
                newDate = addDays(currentDate, -7);
                break;
            case 'month':
                newDate = addDays(startOfMonth(currentDate), -1);
                newDate = startOfMonth(newDate);
                break;
            default:
                newDate = currentDate;
        }
        onDateChange(newDate);
    };

    const handleNext = () => {
        let newDate: Date;
        switch (view) {
            case 'day':
                newDate = addDays(currentDate, 1);
                break;
            case '4-day':
                newDate = addDays(currentDate, 4);
                break;
            case 'week':
                newDate = addDays(currentDate, 7);
                break;
            case 'month':
                newDate = addDays(endOfMonth(currentDate), 1);
                newDate = startOfMonth(newDate);
                break;
            default:
                newDate = currentDate;
        }
        onDateChange(newDate);
    };

    const renderDayView = () => {
        const dayEvents = getEventsForDate(currentDate);

        return (
            <div className="space-y-4">
                {/* Date Switcher */}
                <DateSwitcher
                    currentDate={currentDate}
                    onDateChange={onDateChange}
                    daysToShow={7}
                />

                {/* Day Header */}
                <div className="text-center space-y-1">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        {format(currentDate, 'EEEE')}
                    </h2>
                    <p className="text-gray-600">
                        {format(currentDate, 'MMMM d, yyyy')}
                    </p>
                </div>

                {/* Events */}
                <div className="space-y-3">
                    {dayEvents.length === 0 ? (
                        <Card className="border-none shadow-sm bg-white/70">
                            <CardContent className="p-8 text-center">
                                <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                <h3 className="text-lg font-medium text-gray-600 mb-1">No events scheduled</h3>
                                <p className="text-gray-500">Enjoy your free day!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        dayEvents.map(event => (
                            <ScheduleEventCard
                                key={event.id}
                                event={event}
                                onClick={() => onEventClick?.(event.id)}
                            />
                        ))
                    )}
                </div>
            </div>
        );
    };

    const renderWeekView = (daysToShow: number = 7) => {
        let startDate: Date;
        if (daysToShow === 4) {
            // 4-day view: show current date + next 3 days
            startDate = currentDate;
        } else {
            // Week view: show full week
            startDate = startOfWeek(currentDate);
        }

        const days = Array.from({ length: daysToShow }, (_, i) => addDays(startDate, i));

        return (
            <div className="space-y-4">
                {/* Date Switcher */}
                <DateSwitcher
                    currentDate={currentDate}
                    onDateChange={onDateChange}
                    daysToShow={7}
                />

                {/* Week Header */}
                <div className="text-center space-y-1">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        {daysToShow === 4 ? '4-Day View' : 'Week View'}
                    </h2>
                    <p className="text-gray-600">
                        {format(days[0], 'MMM d')} - {format(days[days.length - 1], 'MMM d, yyyy')}
                    </p>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                    {days.map(day => {
                        const dayEvents = getEventsForDate(day);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <Card key={day.toISOString()} className="border-none shadow-sm bg-white/70 hover:bg-white/90 transition-colors">
                                <CardContent className="p-4 space-y-3">
                                    {/* Day Header */}
                                    <div className={`text-center pb-2 border-b ${isToday ? 'border-pink-400' : 'border-gray-200'}`}>
                                        <div className={`text-sm font-medium ${isToday ? 'text-pink-600' : 'text-gray-600'}`}>
                                            {format(day, 'EEE')}
                                        </div>
                                        <div className={`text-xl font-bold ${isToday ? 'bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent' : 'text-gray-800'}`}>
                                            {format(day, 'd')}
                                        </div>
                                    </div>

                                    {/* Events */}
                                    <div className="space-y-2 min-h-[100px]">
                                        {dayEvents.length === 0 ? (
                                            <div className="text-center text-gray-400 text-sm py-4">
                                                No events
                                            </div>
                                        ) : (
                                            dayEvents.slice(0, 3).map(event => (
                                                <div
                                                    key={event.id}
                                                    onClick={() => onEventClick?.(event.id)}
                                                    className="p-2 bg-white rounded-lg border border-pink-200 hover:border-purple-400 cursor-pointer transition-all duration-200 hover:shadow-md group"
                                                >
                                                    <div className="text-xs bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-medium">
                                                        {format(new Date(event.time), 'h:mm a')}
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-800 truncate group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent">
                                                        {event.eventName}
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate">
                                                        {event.societyName}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        {dayEvents.length > 3 && (
                                            <div className="text-xs bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-medium text-center">
                                                +{dayEvents.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);
        const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

        return (
            <div className="space-y-4">
                {/* Month Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <p className="text-gray-600">Month View</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrevious}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleNext}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <Card className="border-none shadow-sm bg-white/70">
                    <CardContent className="p-0">
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 bg-gradient-to-r from-pink-100 to-purple-100">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="p-3 text-center text-sm font-medium bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent border-r border-white/50 last:border-r-0">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7">
                            {calendarDays.map(day => {
                                const dayEvents = getEventsForDate(day);
                                const isCurrentMonth = day >= monthStart && day <= monthEnd;
                                const isToday = isSameDay(day, new Date());

                                return (
                                    <div
                                        key={day.toISOString()}
                                        className={`
                      min-h-[100px] p-2 border-r border-b border-white/30 last:border-r-0
                      ${isCurrentMonth
                                                ? 'bg-white/50 hover:bg-white/80'
                                                : 'bg-gray-50/50 text-gray-400'
                                            }
                      transition-colors cursor-pointer
                    `}
                                        onClick={() => onDateChange(day)}
                                    >
                                        <div className={`
                      text-sm font-medium mb-1
                      ${isToday
                                                ? 'bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-bold'
                                                : isCurrentMonth
                                                    ? 'text-gray-800'
                                                    : 'text-gray-400'
                                            }
                    `}>
                                            {format(day, 'd')}
                                        </div>

                                        {isCurrentMonth && (
                                            <div className="space-y-1">
                                                {dayEvents.slice(0, 2).map(event => (
                                                    <div
                                                        key={event.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEventClick?.(event.id);
                                                        }}
                                                        className="text-xs p-1 bg-pink-100 hover:bg-purple-200 rounded truncate cursor-pointer transition-colors"
                                                    >
                                                        {event.eventName}
                                                    </div>
                                                ))}
                                                {dayEvents.length > 2 && (
                                                    <div className="text-xs bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-medium">
                                                        +{dayEvents.length - 2}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderView = () => {
        switch (view) {
            case 'day':
                return renderDayView();
            case '4-day':
                return renderWeekView(4);
            case 'week':
                return renderWeekView(7);
            case 'month':
                return renderMonthView();
            default:
                return renderDayView();
        }
    };

    return (
        <div className="w-full">
            {renderView()}
        </div>
    );
};

export default TimetableGrid;
