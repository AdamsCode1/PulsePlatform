import { format } from 'date-fns';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Event } from '@/types/Event';

interface ScheduleEventCardProps {
    event: Event;
    onClick?: () => void;
    compact?: boolean;
}

const ScheduleEventCard = ({ event, onClick, compact = false }: ScheduleEventCardProps) => {
    const startTime = new Date(event.time);
    const endTime = event.endTime ? new Date(event.endTime) : null;

    // Format time in 12-hour format as specified
    const formatTime = (date: Date) => format(date, 'h:mm a');

    const handleRSVPClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Trigger RSVP action
        if (event.signup_link) {
            window.open(event.signup_link, '_blank');
        }
    };

    if (compact) {
        return (
            <div
                onClick={onClick}
                className="p-3 bg-white rounded-lg border border-pink-200 hover:border-purple-400 cursor-pointer transition-all duration-200 hover:shadow-md group"
            >
                <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        {formatTime(startTime)}
                        {endTime && ` - ${formatTime(endTime)}`}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {event.societyName.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div className="text-sm font-bold text-gray-800 mb-1 group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-colors">
                    {event.eventName}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                </div>
            </div>
        );
    }

    return (
        <Card
            className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white cursor-pointer group rounded-xl overflow-hidden"
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    {/* Society Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                            {event.societyName.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 min-w-0">
                        {/* Society Name */}
                        <div className="text-sm font-medium text-gray-800 mb-1">
                            {event.societyName}
                        </div>

                        {/* Event Headline/Name */}
                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                            {event.eventName}
                        </h3>

                        {/* Event Details */}
                        <div className="space-y-1 text-sm text-gray-600">
                            {/* Location */}
                            <div className="flex items-center gap-1">
                                <span>•</span>
                                <span>{event.location}</span>
                            </div>

                            {/* Time */}
                            <div className="flex items-center gap-1">
                                <span>•</span>
                                <span>
                                    {formatTime(startTime)}
                                    {endTime && ` - ${formatTime(endTime)}`}
                                </span>
                            </div>

                            {/* Attendees */}
                            <div className="flex items-center gap-1">
                                <span>•</span>
                                <span>{event.attendeeCount || 0} attendees</span>
                            </div>
                        </div>
                    </div>

                    {/* Event Thumbnail */}
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
                            {event.imageUrl && event.imageUrl !== '/placeholder.svg' ? (
                                <img
                                    src={event.imageUrl}
                                    alt={event.eventName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-purple-400" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RSVP Button - Compact version */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <Button
                        onClick={handleRSVPClick}
                        size="sm"
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-xs font-medium h-7 px-3"
                    >
                        RSVP
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ScheduleEventCard;
