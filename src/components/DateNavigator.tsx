
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

  return (
    <div className="flex items-center justify-center bg-gradient-to-r from-pink-500 via-purple-500 to-pink-400 rounded-2xl shadow-lg p-4 sm:p-6 mx-auto w-full max-w-sm sm:max-w-md border border-white/20">
      <button
        onClick={handlePrevious}
        disabled={!canGoPrevious}
        className={`p-2 sm:p-3 rounded-full transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center ${canGoPrevious
          ? 'text-white hover:bg-white/20 active:scale-95 backdrop-blur-sm'
          : 'text-white/50 cursor-not-allowed'
          }`}
      >
        <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
      </button>

      <div className="flex-1 text-center mx-3 sm:mx-6">
        <div className="text-xl sm:text-2xl font-bold text-white mb-1 drop-shadow-sm">
          {format(currentDate, 'EEEE')}
        </div>
        <div className="text-xs sm:text-sm text-white/90 drop-shadow-sm">
          {format(currentDate, 'd MMM')}
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={!canGoNext}
        className={`p-2 sm:p-3 rounded-full transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center ${canGoNext
          ? 'text-white hover:bg-white/20 active:scale-95 backdrop-blur-sm'
          : 'text-white/50 cursor-not-allowed'
          }`}
      >
        <ChevronRight size={20} className="sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

export default DateNavigator;
