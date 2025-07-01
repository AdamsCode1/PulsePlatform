
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateNavigatorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const DateNavigator = ({ currentDate, onDateChange }: DateNavigatorProps) => {
  const today = new Date();
  const maxDate = addDays(today, 7); // One week from today
  
  const canGoPrevious = !isSameDay(currentDate, today);
  const canGoNext = currentDate < maxDate;
  
  const handlePrevious = () => {
    if (canGoPrevious) {
      onDateChange(subDays(currentDate, 1));
    }
  };
  
  const handleNext = () => {
    if (canGoNext) {
      onDateChange(addDays(currentDate, 1));
    }
  };
  
  const isToday = isSameDay(currentDate, today);
  const isTomorrow = isSameDay(currentDate, addDays(today, 1));
  
  const getDateLabel = () => {
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    return format(currentDate, 'EEEE');
  };

  return (
    <div className="flex items-center justify-center bg-white rounded-2xl shadow-lg p-6 mx-auto max-w-md">
      <button
        onClick={handlePrevious}
        disabled={!canGoPrevious}
        className={`p-3 rounded-full transition-all duration-200 ${
          canGoPrevious
            ? 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 active:scale-95'
            : 'text-gray-300 cursor-not-allowed'
        }`}
      >
        <ChevronLeft size={24} />
      </button>
      
      <div className="flex-1 text-center mx-6">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {getDateLabel()}
        </div>
        <div className="text-sm text-gray-500">
          {format(currentDate, 'MMMM d, yyyy')}
        </div>
      </div>
      
      <button
        onClick={handleNext}
        disabled={!canGoNext}
        className={`p-3 rounded-full transition-all duration-200 ${
          canGoNext
            ? 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 active:scale-95'
            : 'text-gray-300 cursor-not-allowed'
        }`}
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default DateNavigator;
