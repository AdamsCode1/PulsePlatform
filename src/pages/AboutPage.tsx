import NavBar from '../components/NavBar';

const About = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
            <NavBar />
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="text-center max-w-2xl mx-auto pt-20">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/20 shadow-2xl">
                        <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
                            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">DUPulse</span>
                        </h1>
                        <div className="space-y-6 text-lg text-gray-200">
                            <p>
                                DUPulse is Durham University's premier platform for discovering events,
                                connecting with societies, and never missing out on what's happening around campus.
                            </p>
                            <p>
                                From academic seminars to social gatherings, from sports events to cultural celebrations -
                                we bring everything together in one place so you can make the most of your Durham experience.
                            </p>
                            <div className="mt-8 p-6 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl border border-pink-500/30">
                                <h2 className="text-2xl font-bold text-pink-300 mb-4">🚧 Coming Soon</h2>
                                <p className="text-gray-300">
                                    We're working hard to bring you more features including detailed platform information,
                                    team profiles, and our story. Stay tuned!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
