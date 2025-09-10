import { format, addDays, isSameDay, startOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateSwitcherProps {
    currentDate: Date;
    onDateChange: (date: Date) => void;
    daysToShow?: number;
}

const DateSwitcher = ({ currentDate, onDateChange, daysToShow = 7 }: DateSwitcherProps) => {
    // Get the start of the week containing the current date
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday

    // Generate array of dates to display
    const dates = Array.from({ length: daysToShow }, (_, i) => addDays(weekStart, i));

    const handleDateClick = (date: Date) => {
        onDateChange(date);
    };

    const handlePreviousWeek = () => {
        const newDate = addDays(currentDate, -7);
        onDateChange(newDate);
    };

    const handleNextWeek = () => {
        const newDate = addDays(currentDate, 7);
        onDateChange(newDate);
    };

    return (
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 px-2 sm:px-4">
            {/* Previous Week Button */}
            <Button
                onClick={handlePreviousWeek}
                variant="ghost"
                size="sm"
                className="h-8 w-8 sm:h-12 sm:w-12 p-0 rounded-full hover:bg-gray-100 flex-shrink-0"
            >
                <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600" />
            </Button>

            {/* Date Selector */}
            <div className="flex items-center gap-1 sm:gap-3 flex-1 justify-center overflow-x-auto">
                {dates.map((date, index) => {
                    const isSelected = isSameDay(date, currentDate);
                    const dayNumber = format(date, 'd');
                    const dayName = format(date, 'EEE');

                    return (
                        <Button
                            key={index}
                            onClick={() => handleDateClick(date)}
                            variant="ghost"
                            className={`
                                flex-shrink-0 h-14 w-12 sm:h-20 sm:w-20 flex flex-col items-center justify-center
                                rounded-2xl sm:rounded-3xl transition-all duration-200 border-2
                                ${isSelected
                                    ? 'bg-slate-800 text-white border-slate-700 shadow-lg scale-105'
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:scale-102'
                                }
                            `}
                        >
                            <span className={`text-sm sm:text-xl font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                {dayNumber}
                            </span>
                            <span className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-gray-200' : 'text-gray-500'}`}>
                                {dayName}
                            </span>
                        </Button>
                    );
                })}
            </div>

            {/* Next Week Button */}
            <Button
                onClick={handleNextWeek}
                variant="ghost"
                size="sm"
                className="h-8 w-8 sm:h-12 sm:w-12 p-0 rounded-full hover:bg-gray-100 flex-shrink-0"
            >
                <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600" />
            </Button>
        </div>
    );
};

export default DateSwitcher;
