import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types/Event';

// Academic Terms (matching Timetable component)
const ACADEMIC_TERMS = [
  {
    id: 'michaelmas',
    label: 'Michaelmas Term',
    startDate: new Date(2025, 8, 25), // September 25, 2025 (start of freshers week)
    endDate: new Date(2025, 11, 12), // December 12, 2025
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'epiphany',
    label: 'Epiphany Term',
    startDate: new Date(2026, 0, 12), // January 12, 2026
    endDate: new Date(2026, 2, 20), // March 20, 2026
    color: 'from-green-400 to-green-600',
  },
  {
    id: 'easter',
    label: 'Easter Term',
    startDate: new Date(2026, 3, 27), // April 27, 2026
    endDate: new Date(2026, 5, 26), // June 26, 2026
    color: 'from-purple-400 to-purple-600',
  },
];

interface MonthlyCalendarProps {
  events: Event[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  activeTerms?: string[];
}

const MonthlyCalendar = ({ events, onDateSelect, selectedDate, activeTerms = ['michaelmas', 'epiphany', 'easter'] }: MonthlyCalendarProps) => {
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
      const isSameDate = isSameDay(eventDate, date);

      // Apply term filtering
      if (activeTerms && activeTerms.length > 0) {
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
    if (!term) return 'from-dupulse-pink to-dupulse-purple'; // Default DUPulse colors

    return term.color;
  };

  const handlePreviousMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      console.log('MonthlyCalendar: handlePreviousMonth called, current month:', currentMonth);
      const newMonth = subMonths(currentMonth, 1);
      console.log('MonthlyCalendar: navigating to month:', newMonth);
      setCurrentMonth(newMonth);
    } catch (error) {
      console.error('Error navigating to previous month:', error);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      console.log('MonthlyCalendar: handleNextMonth called, current month:', currentMonth);
      const newMonth = addMonths(currentMonth, 1);
      console.log('MonthlyCalendar: navigating to month:', newMonth);
      setCurrentMonth(newMonth);
    } catch (error) {
      console.error('Error navigating to next month:', error);
    }
  };

  const handleDateClick = (date: Date) => {
    try {
      console.log('MonthlyCalendar: handleDateClick called with:', date);
      onDateSelect?.(date);
    } catch (error) {
      console.error('Error selecting date:', error);
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Full-width container with gradient background using DU Pulse colors */}
      <Card className="w-full border-none shadow-lg sm:shadow-2xl bg-gradient-to-br from-dupulse-light-pink/20 via-dupulse-purple/20 to-dupulse-off-white dark:from-dupulse-purple/30 dark:via-dupulse-pink/30 dark:to-gray-950">
        <CardContent className="p-0">
          {/* Header with DU Pulse gradient */}
          <div
            className="flex items-center justify-between p-2 sm:p-3 sm:p-6 bg-gradient-to-r from-dupulse-pink via-dupulse-purple to-dupulse-pink text-white"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousMonth}
              className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 p-0 bg-white/20 hover:bg-white/30 text-white border-none transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6" />
            </Button>

            <div className="flex items-center space-x-1 sm:space-x-3 min-w-0 flex-1 justify-center">
              <Calendar className="h-3 w-3 sm:h-5 sm:w-5 lg:h-8 lg:w-8 flex-shrink-0" />
              <h2 className="text-sm sm:text-lg lg:text-3xl font-bold tracking-wide truncate">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 animate-pulse flex-shrink-0" />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 p-0 bg-white/20 hover:bg-white/30 text-white border-none transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6" />
            </Button>
          </div>

          {/* Day labels with DU Pulse gradient */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-dupulse-light-pink/30 via-dupulse-purple/30 to-dupulse-light-pink/30 dark:from-dupulse-purple/50 dark:via-dupulse-pink/50 dark:to-dupulse-purple/50">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="text-center py-1 sm:py-2 lg:py-4 text-xs sm:text-sm font-semibold text-dupulse-pink dark:text-dupulse-light-pink border-r border-white/50 last:border-r-0 min-w-0">
                <div className="hidden lg:block truncate">{day}</div>
                <div className="hidden sm:block lg:hidden truncate">{day.slice(0, 3)}</div>
                <div className="sm:hidden truncate">{day.slice(0, 2)}</div>
              </div>
            ))}
          </div>

          {/* Calendar Grid - Full width with no gaps */}
          <div
            className="grid grid-cols-7 flex-1 border-l border-t border-white/30 min-h-0"
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDateClick(day);
                  }}
                  onMouseEnter={() => setHoveredDate(day)}
                  onMouseLeave={() => setHoveredDate(null)}
                  className={`
                    relative min-h-16 sm:min-h-20 lg:min-h-28 p-2 sm:p-2 lg:p-3 border-r border-b border-white/30 cursor-pointer 
                    transition-all duration-300 sm:hover:scale-[1.02] hover:z-10 min-w-0
                    ${isCurrentMonth
                      ? isToday
                        ? 'bg-gradient-to-br from-dupulse-light-pink/40 via-dupulse-purple/40 to-dupulse-light-pink/60 dark:from-dupulse-pink/50 dark:via-dupulse-purple/50 dark:to-dupulse-pink/60'
                        : 'bg-gradient-to-br from-dupulse-off-white via-dupulse-light-pink/10 to-dupulse-purple/10 hover:from-dupulse-light-pink/20 hover:via-dupulse-purple/20 hover:to-dupulse-light-pink/20 dark:from-gray-800 dark:via-dupulse-purple/20 dark:to-dupulse-pink/20'
                      : 'bg-gray-100/50 text-gray-400 dark:bg-gray-900/50'
                    }
                    ${isSelected ? 'ring-1 sm:ring-2 lg:ring-4 ring-dupulse-pink shadow-lg shadow-dupulse-pink/30 dark:shadow-dupulse-pink/50' : ''}
                    ${isHovered && isCurrentMonth ? 'shadow-xl shadow-dupulse-purple/40 dark:shadow-dupulse-purple/60' : ''}
                  `}
                >
                  {/* Day number with DU Pulse gradient text */}
                  <div className={`
                    text-sm sm:text-sm lg:text-lg font-bold mb-2 text-center
                    ${isToday
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-dupulse-pink to-dupulse-purple'
                      : isCurrentMonth
                        ? 'text-gray-800 dark:text-gray-200'
                        : 'text-gray-400'
                    }
                  `}>
                    {format(day, 'd')}
                    {isToday && <Star className="inline ml-1 h-3 w-3 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-dupulse-yellow animate-pulse" />}
                  </div>

                  {/* Event indicators with DU Pulse gradient badges */}
                  {eventCount > 0 && isCurrentMonth && (
                    <div className="space-y-0.5">
                      {/* Main event count badge with term-specific color */}
                      {(() => {
                        const firstEventDate = new Date(dayEvents[0].date);
                        const termColors = getEventTermColor(firstEventDate);

                        return (
                          <Badge
                            variant="secondary"
                            className={`absolute top-1 right-1 sm:top-1 sm:right-1 lg:top-2 lg:right-2 bg-gradient-to-r ${termColors} text-white border-none shadow-md text-xs px-1.5 py-0.5 sm:px-1.5 sm:py-0.5 lg:px-2 lg:py-1`}
                          >
                            {eventCount}
                          </Badge>
                        );
                      })()}

                      {/* Event dots with term-specific colors - only show on larger screens */}
                      <div className="hidden lg:flex flex-wrap gap-1 mt-4">
                        {dayEvents.slice(0, 4).map((event, i) => {
                          const eventDate = new Date(event.date);
                          const termColors = getEventTermColor(eventDate);

                          return (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${termColors} shadow-sm animate-pulse`}
                              style={{ animationDelay: `${i * 100}ms` }}
                            />
                          );
                        })}
                        {eventCount > 4 && (
                          <div className="text-xs text-dupulse-purple dark:text-dupulse-light-pink font-semibold">
                            +{eventCount - 4}
                          </div>
                        )}
                      </div>

                      {/* Mobile event indicator with term-specific color */}
                      <div className="lg:hidden absolute bottom-1 left-1 sm:bottom-1 sm:left-1">
                        {(() => {
                          const firstEventDate = new Date(dayEvents[0].date);
                          const termColors = getEventTermColor(firstEventDate);

                          return (
                            <div className={`w-2 h-2 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r ${termColors} animate-pulse`} />
                          );
                        })()}
                      </div>

                      {/* Event preview on hover with DU Pulse styling - only on larger screens */}
                      {isHovered && dayEvents.length > 0 && (
                        <div className="hidden lg:block absolute z-20 bottom-full left-0 mb-2 w-40 p-2 bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-xl border border-dupulse-purple/30 dark:border-dupulse-pink/30 backdrop-blur-sm">
                          <div className="text-xs font-semibold text-dupulse-pink dark:text-dupulse-light-pink mb-1">
                            Events on {format(day, 'MMM d')}:
                          </div>
                          {dayEvents.slice(0, 2).map((event, idx) => {
                            const eventDate = new Date(event.date);
                            const term = getEventTerm(eventDate);
                            const termLabel = term ? ` (${term.label.split(' ')[0]})` : '';

                            return (
                              <div key={idx} className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                • {event.eventName}{termLabel}
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-dupulse-purple font-medium">
                              +{dayEvents.length - 2} more
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