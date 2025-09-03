import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MonthlyCalendar from './MonthlyCalendar';
import { Event } from '@/types/Event';

interface MonthlyCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

const MonthlyCalendarModal = ({ isOpen, onClose, events, onDateSelect, selectedDate }: MonthlyCalendarModalProps) => {
  const handleDateSelect = (date: Date) => {
    onDateSelect?.(date);
    onClose(); // Close modal after selecting a date
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-dupulse-pink via-dupulse-purple to-dupulse-pink bg-clip-text text-transparent">
            Monthly Event Calendar
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 p-6 pt-2 h-full">
          <MonthlyCalendar
            events={events}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MonthlyCalendarModal;