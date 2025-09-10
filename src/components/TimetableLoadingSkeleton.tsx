import { Card, CardContent } from '@/components/ui/card';

const TimetableLoadingSkeleton = () => {
    return (
        <div className="w-full space-y-6">
            {/* Header Skeleton */}
            <div className="text-center space-y-2">
                <div className="h-10 bg-gradient-to-r from-pink-200 to-purple-200 rounded-lg w-48 mx-auto animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded w-64 mx-auto animate-pulse"></div>
            </div>

            {/* Controls Skeleton */}
            <Card className="border border-pink-200 shadow-lg bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50">
                <CardContent className="p-6 space-y-4">
                    {/* Term and Week Selectors */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-pink-200 rounded w-12 animate-pulse"></div>
                            <div className="h-10 bg-gradient-to-r from-pink-200 to-purple-200 rounded animate-pulse"></div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-pink-200 rounded w-12 animate-pulse"></div>
                            <div className="h-10 bg-gradient-to-r from-pink-200 to-purple-200 rounded animate-pulse"></div>
                        </div>
                    </div>

                    {/* View Switcher */}
                    <div className="space-y-2">
                        <div className="h-4 bg-pink-200 rounded w-8 animate-pulse"></div>
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 4 }, (_, i) => (
                                <div key={i} className="h-10 w-20 bg-gradient-to-r from-pink-200 to-purple-200 rounded animate-pulse"></div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Filters */}
                    <div className="flex items-center justify-between pt-2 border-t border-pink-200">
                        <div className="h-4 bg-pink-200 rounded w-32 animate-pulse"></div>
                        <div className="h-4 bg-purple-200 rounded w-20 animate-pulse"></div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Skeleton */}
            <div className="min-h-[600px] bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 rounded-lg p-6 border border-pink-200">
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="h-8 bg-gradient-to-r from-pink-300 to-purple-300 rounded w-32 animate-pulse"></div>
                            <div className="h-4 bg-pink-200 rounded w-48 animate-pulse"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-pink-200 rounded animate-pulse"></div>
                            <div className="h-8 w-8 bg-pink-200 rounded animate-pulse"></div>
                        </div>
                    </div>

                    {/* Event Cards Skeleton */}
                    <div className="space-y-3">
                        {Array.from({ length: 3 }, (_, i) => (
                            <Card key={i} className="border border-pink-200 shadow-lg bg-white">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className="w-14 h-14 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full animate-pulse"></div>

                                        {/* Content */}
                                        <div className="flex-1 space-y-3">
                                            <div className="h-4 bg-pink-200 rounded w-24 animate-pulse"></div>
                                            <div className="h-6 bg-gradient-to-r from-purple-200 to-purple-100 rounded w-3/4 animate-pulse"></div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                                    <div className="h-4 bg-pink-200 rounded w-20 animate-pulse"></div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                    <div className="h-4 bg-pink-200 rounded w-32 animate-pulse"></div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                                                    <div className="h-4 bg-pink-200 rounded w-24 animate-pulse"></div>
                                                </div>
                                            </div>

                                            <div className="h-10 bg-gradient-to-r from-pink-300 to-purple-300 rounded w-24 animate-pulse"></div>
                                        </div>

                                        {/* Thumbnail */}
                                        <div className="w-24 h-24 bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg animate-pulse"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Context Information Skeleton */}
            <Card className="border border-pink-200 shadow-sm bg-white/80">
                <CardContent className="p-4">
                    <div className="text-center space-y-2">
                        <div className="h-4 bg-pink-200 rounded w-64 mx-auto animate-pulse"></div>
                        <div className="h-3 bg-pink-100 rounded w-48 mx-auto animate-pulse"></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TimetableLoadingSkeleton;
