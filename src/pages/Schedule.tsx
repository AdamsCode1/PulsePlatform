import NavBar from '../components/NavBar';

const Schedule = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
            <NavBar />
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="text-center max-w-2xl mx-auto pt-20">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/20 shadow-2xl">
                        <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
                            Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Schedule</span>
                        </h1>
                        <div className="space-y-6 text-lg text-gray-200">
                            <p>
                                Your comprehensive guide to all events happening at Durham University.
                            </p>
                            <p>
                                From society meetups to academic talks, sports events to social gatherings -
                                discover everything happening around campus in one convenient place.
                            </p>
                            <div className="mt-8 p-6 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl border border-pink-500/30">
                                <h2 className="text-2xl font-bold text-pink-300 mb-4">🗓️ Coming Soon</h2>
                                <p className="text-gray-300">
                                    We're building an amazing event calendar and schedule view. Soon you'll be able to:
                                </p>
                                <ul className="text-left mt-4 space-y-2 text-gray-300">
                                    <li>• View events by day, week, or month</li>
                                    <li>• Filter by event type, society, or location</li>
                                    <li>• RSVP to events you're interested in</li>
                                    <li>• Get personalized event recommendations</li>
                                    <li>• Sync events to your personal calendar</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Schedule;
