
import { Skeleton } from "@/components/ui/skeleton";

const EventCardSkeleton = () => {
  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden relative flex flex-col h-full">
      {/* Colored line at the top */}
      <div className="h-1 bg-gray-200"></div>
      
      <div className="p-4 sm:p-6 flex flex-col flex-1">
        {/* Attend Counter - Top Right */}
        <div className="absolute top-4 sm:top-6 right-3 sm:right-4">
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>

        {/* Society Name */}
        <div className="mb-3">
          <Skeleton className="h-6 w-24 rounded-lg" />
        </div>

        {/* Event Name */}
        <Skeleton className="h-6 w-3/4 mb-3" />

        {/* Event Description */}
        <div className="space-y-2 mb-4 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* Event Details */}
        <div className="space-y-3 mb-6">
          {/* Time */}
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-3 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          {/* Location */}
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-3 rounded" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        
        {/* Bottom buttons */}
        <div className="flex justify-between items-center mt-auto">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;
