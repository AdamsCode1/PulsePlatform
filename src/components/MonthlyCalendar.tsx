import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types/Event';

interface MonthlyCalendarProps {
  events: Event[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

const MonthlyCalendar = ({ events, onDateSelect, selectedDate }: MonthlyCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of the week for the month (to properly align calendar)
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  // Get last day of the week for the month
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, date);
    });
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    onDateSelect?.(date);
  };

  return (
    <div className="w-full h-full">
      {/* Full-width container with gradient background using DU Pulse colors */}
      <Card className="w-full h-full border-none shadow-2xl bg-gradient-to-br from-dupulse-light-pink/20 via-dupulse-purple/20 to-dupulse-off-white dark:from-dupulse-purple/30 dark:via-dupulse-pink/30 dark:to-gray-950">
        <CardContent className="p-0 h-full">
          {/* Header with DU Pulse gradient */}
          <div
            className="flex items-center justify-between p-6 bg-gradient-to-r from-dupulse-pink via-dupulse-purple to-dupulse-pink text-white"
          >
            <Button
              variant="ghost"
              size="lg"
              onClick={handlePreviousMonth}
              className="h-12 w-12 p-0 bg-white/20 hover:bg-white/30 text-white border-none transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8" />
              <h2 className="text-3xl font-bold tracking-wide">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>

            <Button
              variant="ghost"
              size="lg"
              onClick={handleNextMonth}
              className="h-12 w-12 p-0 bg-white/20 hover:bg-white/30 text-white border-none transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Day labels with DU Pulse gradient */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-dupulse-light-pink/30 via-dupulse-purple/30 to-dupulse-light-pink/30 dark:from-dupulse-purple/50 dark:via-dupulse-pink/50 dark:to-dupulse-purple/50">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="text-center py-4 text-sm font-semibold text-dupulse-pink dark:text-dupulse-light-pink border-r border-white/50 last:border-r-0">
                <div className="hidden sm:block">{day}</div>
                <div className="sm:hidden">{day.slice(0, 3)}</div>
              </div>
            ))}
          </div>

          {/* Calendar Grid - Full width with no gaps */}
          <div
            className="grid grid-cols-7 h-full border-l border-t border-white/30"
          >
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const eventCount = dayEvents.length;
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const isHovered = hoveredDate && isSameDay(day, hoveredDate);

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(day)}
                  onMouseEnter={() => setHoveredDate(day)}
                  onMouseLeave={() => setHoveredDate(null)}
                  className={`
                    relative min-h-[100px] lg:min-h-[120px] p-3 border-r border-b border-white/30 cursor-pointer 
                    transition-all duration-300 transform hover:scale-[1.02] hover:z-10
                    ${isCurrentMonth
                      ? isToday
                        ? 'bg-gradient-to-br from-dupulse-light-pink/40 via-dupulse-purple/40 to-dupulse-light-pink/60 dark:from-dupulse-pink/50 dark:via-dupulse-purple/50 dark:to-dupulse-pink/60'
                        : 'bg-gradient-to-br from-dupulse-off-white via-dupulse-light-pink/10 to-dupulse-purple/10 hover:from-dupulse-light-pink/20 hover:via-dupulse-purple/20 hover:to-dupulse-light-pink/20 dark:from-gray-800 dark:via-dupulse-purple/20 dark:to-dupulse-pink/20'
                      : 'bg-gray-100/50 text-gray-400 dark:bg-gray-900/50'
                    }
                    ${isSelected ? 'ring-4 ring-dupulse-pink shadow-lg shadow-dupulse-pink/30 dark:shadow-dupulse-pink/50' : ''}
                    ${isHovered && isCurrentMonth ? 'shadow-xl shadow-dupulse-purple/40 dark:shadow-dupulse-purple/60' : ''}
                  `}
                >
                  {/* Day number with DU Pulse gradient text */}
                  <div className={`
                    text-lg font-bold mb-2 
                    ${isToday
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-dupulse-pink to-dupulse-purple'
                      : isCurrentMonth
                        ? 'text-gray-800 dark:text-gray-200'
                        : 'text-gray-400'
                    }
                  `}>
                    {format(day, 'd')}
                    {isToday && <Star className="inline ml-1 h-4 w-4 text-dupulse-yellow animate-pulse" />}
                  </div>

                  {/* Event indicators with DU Pulse gradient badges */}
                  {eventCount > 0 && isCurrentMonth && (
                    <div className="space-y-1">
                      {/* Main event count badge */}
                      <Badge
                        variant="secondary"
                        className="absolute top-2 right-2 bg-gradient-to-r from-dupulse-pink to-dupulse-purple text-white border-none shadow-md text-xs px-2 py-1"
                      >
                        {eventCount}
                      </Badge>

                      {/* Event dots with DU Pulse colors */}
                      <div className="flex flex-wrap gap-1 mt-6">
                        {Array.from({ length: Math.min(eventCount, 6) }, (_, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-gradient-to-r from-dupulse-pink to-dupulse-purple shadow-sm animate-pulse"
                            style={{ animationDelay: `${i * 100}ms` }}
                          />
                        ))}
                        {eventCount > 6 && (
                          <div className="text-xs text-dupulse-purple dark:text-dupulse-light-pink font-semibold">
                            +{eventCount - 6}
                          </div>
                        )}
                      </div>

                      {/* Event preview on hover with DU Pulse styling */}
                      {isHovered && dayEvents.length > 0 && (
                        <div className="absolute z-20 bottom-full left-0 mb-2 w-48 p-3 bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-xl border border-dupulse-purple/30 dark:border-dupulse-pink/30 backdrop-blur-sm">
                          <div className="text-xs font-semibold text-dupulse-pink dark:text-dupulse-light-pink mb-1">
                            Events on {format(day, 'MMM d')}:
                          </div>
                          {dayEvents.slice(0, 3).map((event, idx) => (
                            <div key={idx} className="text-xs text-gray-600 dark:text-gray-300 truncate">
                              • {event.eventName}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-dupulse-purple font-medium">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
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

export default MonthlyCalendar;