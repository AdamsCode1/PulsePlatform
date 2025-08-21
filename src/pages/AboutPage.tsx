import React from 'react';
import Aurora from '@/blocks/Backgrounds/Aurora/Aurora';
import CircularText from '@/blocks/TextAnimations/CircularText/CircularText';
import { Users, Heart, Sparkles, Calendar, Coffee, PartyPopper } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-purple-100 overflow-x-hidden">
            {/* Single Light Background for entire page */}
            <div className="fixed inset-0 w-full h-full">
                <Aurora
                    colorStops={["#f9a8d4", "#e879f9", "#ffffff", "#fce7f3", "#ddd6fe"]}
                    amplitude={1.2}
                    blend={0.5}
                    speed={0.7}
                />
            </div>

            {/* Logo - Top Left */}
            <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-20">
                <div className="flex items-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 p-1 shadow-lg border border-pink-200">
                        <img
                            src="/image-uploads/f80b99b9-ff76-4acc-912c-49d8bd435a7b.png"
                            alt="DUPulse Logo"
                            className="w-full h-full object-contain rounded-full"
                        />
                    </div>
                </div>
            </div>

            {/* Section 1: What is DUPulse */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 w-screen py-20">
                <div className="text-center w-full max-w-6xl">
                    {/* Circular Animation */}
                    <div className="mb-8 sm:mb-12 flex justify-center">
                        <div className="relative">
                            <CircularText
                                text="•WHAT IS DUPULSE•WHAT IS DUPULSE"
                                spinDuration={15}
                                onHover="speedUp"
                                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 text-pink-500 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 p-1 shadow-lg border border-pink-200">
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
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8 px-2 sm:px-0">
                        Your social life at Durham, all in one place
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg sm:text-xl md:text-2xl text-purple-700 mb-12 leading-relaxed max-w-4xl mx-auto">
                        We're making it easier for Durham students to discover events, meet people, and create unforgettable memories together.
                    </p>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        {/* Discover Events */}
                        <div className="bg-gradient-to-br from-white/90 to-pink-50/90 backdrop-blur-sm border border-pink-200 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300">
                            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <Calendar className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">Find Your Thing</h3>
                            <p className="text-purple-600 leading-relaxed">
                                From society socials to study groups, from sports events to cultural celebrations - discover what's happening around campus that matches your interests.
                            </p>
                        </div>

                        {/* Connect with People */}
                        <div className="bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-sm border border-purple-200 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Meet Your People</h3>
                            <p className="text-purple-600 leading-relaxed">
                                Connect with students who share your passions. Whether you're into gaming, hiking, or theatre - find your community and make lasting friendships.
                            </p>
                        </div>

                        {/* Create Memories */}
                        <div className="bg-gradient-to-br from-white/90 to-pink-50/90 backdrop-blur-sm border border-pink-200 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300">
                            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">Make Memories</h3>
                            <p className="text-purple-600 leading-relaxed">
                                Your university years fly by fast. We help you make the most of them by ensuring you never miss the moments that matter.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Why We Started DUPulse */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 w-screen py-20">
                <div className="text-center w-full max-w-4xl">
                    <div className="mb-12">
                        <Sparkles className="w-12 h-12 text-pink-500 mx-auto mb-6" />
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-8">
                            Why We Started DUPulse
                        </h2>
                    </div>

                    <div className="text-left max-w-3xl mx-auto">
                        <div className="bg-gradient-to-r from-white/95 to-pink-50/95 rounded-2xl p-8 border border-pink-200 backdrop-blur-sm shadow-xl">
                            <p className="text-lg text-purple-700 leading-relaxed mb-6">
                                <span className="text-4xl font-bold text-pink-500 float-left mr-4 mt-1">W</span>
                                e were Durham students too. We know how overwhelming it can feel trying to find your place on campus.
                                With so many societies, events, and opportunities, it's easy to feel lost or miss out on amazing experiences.
                            </p>
                            <p className="text-lg text-purple-600 leading-relaxed mb-6">
                                We saw friends struggle to find events they'd love, societies that matched their interests, or even just
                                a place to grab coffee and study with like-minded people. The information was scattered everywhere -
                                Facebook groups, Instagram stories, random posters around campus.
                            </p>
                            <p className="text-lg text-purple-600 leading-relaxed">
                                So we decided to change that. DUPulse brings everything together in one simple, easy-to-use place.
                                No more FOMO, no more missed opportunities. Just your Durham social life, organized and accessible.
                            </p>
                        </div>
                    </div>
                </div>
            </div>            {/* Section 3: Our Dream for Durham */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 w-screen py-20">
                <div className="text-center w-full max-w-6xl">
                    <div className="mb-12">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-6">
                            Our Dream for Durham
                        </h2>
                        <p className="text-lg sm:text-xl text-purple-600 max-w-3xl mx-auto leading-relaxed">
                            We envision a Durham where every student feels connected, included, and excited about campus life.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center mb-16">
                        <div className="bg-gradient-to-br from-white/90 to-pink-50/90 rounded-xl p-6 border border-pink-200 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">200+</div>
                            <div className="text-sm text-purple-600 font-medium">Student Societies</div>
                        </div>
                        <div className="bg-gradient-to-br from-white/90 to-purple-50/90 rounded-xl p-6 border border-purple-200 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">10K+</div>
                            <div className="text-sm text-purple-600 font-medium">Durham Students</div>
                        </div>
                        <div className="bg-gradient-to-br from-white/90 to-pink-50/90 rounded-xl p-6 border border-pink-200 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">500+</div>
                            <div className="text-sm text-purple-600 font-medium">Events Every Month</div>
                        </div>
                        <div className="bg-gradient-to-br from-white/90 to-purple-50/90 rounded-xl p-6 border border-purple-200 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">∞</div>
                            <div className="text-sm text-purple-600 font-medium">Memories to Make</div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="text-center">
                        <div className="inline-flex items-center space-x-2 text-pink-500 mb-4">
                            <Coffee className="w-5 h-5" />
                            <PartyPopper className="w-5 h-5" />
                            <Heart className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                            Ready to dive into Durham life?
                        </h3>
                        <p className="text-purple-600 text-lg max-w-2xl mx-auto leading-relaxed mb-20">
                            Join us in creating a more connected, vibrant, and inclusive Durham experience for everyone.
                            Your university years are waiting - let's make them unforgettable.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;