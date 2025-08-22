import React from 'react';
import Aurora from '@/blocks/Backgrounds/Aurora/Aurora';
import CircularText from '@/blocks/TextAnimations/CircularText/CircularText';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Users, Heart, Sparkles, Calendar, Coffee, PartyPopper } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-purple-100 overflow-x-hidden">
            {/* Aurora Background */}
            <div className="fixed inset-0 w-full h-full">
                <Aurora
                    colorStops={["#f9a8d4", "#e879f9", "#ffffff", "#fce7f3", "#ddd6fe"]}
                    amplitude={1.2}
                    blend={0.5}
                    speed={0.7}
                />
            </div>

            {/* Global Navigation */}
            <NavBar />

            {/* Section 1: What is DUPulse */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 w-screen py-24">
                <div className="text-center w-full max-w-6xl">
                    {/* Circular Animation */}
                    <div className="mb-8 sm:mb-12 flex justify-center">
                        <div className="relative">
                            <CircularText
                                text="•WHAT IS DUPULSE•WHAT IS DUPULSE"
                                spinDuration={15}
                                onHover="speedUp"
                                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-full bg-white p-1 shadow-lg border border-gray-200">
                                    <img
                                        src="/image-uploads/f80b99b9-ff76-4acc-912c-49d8bd435a7b.png"
                                        alt="DUPulse Logo"
                                        className="w-full h-full object-contain rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-gray-900 mb-8 px-2 sm:px-0">
                        Your social life at Durham, all in one place
                    </h1>

                    {/* Subtitle (concise) */}
                    <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-10 leading-relaxed max-w-3xl mx-auto">
                        Discover events. Meet people. Make memories — all in one place.
                    </p>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        {/* Discover Events */}
                        <div className="bg-white backdrop-blur-sm border border-gray-200 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <Calendar className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Find Your Thing</h3>
                            <p className="text-gray-600 leading-relaxed">From society socials to study groups, find what's happening around campus that matches your interests.</p>
                        </div>

                        {/* Connect with People */}
                        <div className="bg-white backdrop-blur-sm border border-gray-200 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Meet Your People</h3>
                            <p className="text-gray-600 leading-relaxed">Connect with students who share your passions and build real communities.</p>
                        </div>

                        {/* Create Memories */}
                        <div className="bg-white backdrop-blur-sm border border-gray-200 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Make Memories</h3>
                            <p className="text-gray-600 leading-relaxed">Never miss the moments that matter during your time at Durham.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Why We Started DUPulse */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 w-screen pt-4 pb-12">
                <div className="text-center w-full max-w-4xl">
                    <div className="mb-8">
                        <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-6" />
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Why We Started DUPulse
                        </h2>
                    </div>

                    <div className="text-left max-w-3xl mx-auto">
                        <div className="bg-white rounded-2xl p-8 border border-gray-200 backdrop-blur-sm shadow-lg">
                            <p className="text-lg text-gray-800 leading-relaxed mb-4">
                                We were Durham students too. Finding your place on campus is hard when info is scattered across platforms.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed mb-4">
                                DUPulse brings events, societies, and people together in one simple, easy-to-use place.
                            </p>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                No more FOMO. Just a more connected, inclusive Durham for everyone.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: Our Dream for Durham */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 w-screen py-12">
                <div className="text-center w-full max-w-6xl">
                    <div className="mb-8">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Our Dream for Durham
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                            We envision a Durham where every student feels connected, included, and excited about campus life.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center mb-16">
                        <div className="bg-white rounded-xl p-6 border border-gray-200 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">200+</div>
                            <div className="text-sm text-gray-600 font-medium">Student Societies</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">10K+</div>
                            <div className="text-sm text-gray-600 font-medium">Durham Students</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="text-3xl sm:text-4xl font-bold text-red-600 mb-2">500+</div>
                            <div className="text-sm text-gray-600 font-medium">Events Every Month</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">∞</div>
                            <div className="text-sm text-gray-600 font-medium">Memories to Make</div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="text-center">
                        <div className="inline-flex items-center space-x-2 text-gray-600 mb-4">
                            <Coffee className="w-5 h-5" />
                            <PartyPopper className="w-5 h-5" />
                            <Heart className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Ready to dive into Durham life?</h3>
                        <p className="text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed mb-24">Help us build a more connected, vibrant, and inclusive Durham experience.</p>
                    </div>
                </div>
            </div>

            {/* Global Footer */}
            <Footer />
        </div>
    );
};

export default About;