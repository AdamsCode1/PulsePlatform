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
            <div className="relative z-10 flex items-center justify-center px-4 sm:px-6 w-screen py-16">
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

            {/* Section 4: Meet the Team */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 w-screen py-12">
                <div className="text-center w-full max-w-6xl">
                    <div className="mb-12">
                        <Users className="w-12 h-12 text-pink-600 mx-auto mb-6" />
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Meet the Team
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                            The passionate students behind DUPulse, working to make Durham life better for everyone.
                        </p>
                    </div>

                    {/* Teams Grid */}
                    <div className="space-y-16 mb-20">
                        {/* Tech/Website Team */}
                        <div className="bg-white backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Tech & Website Team</h3>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Building and maintaining the platform that brings Durham together. From code to design, we make it all work seamlessly.
                                </p>
                                <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    Development • Design • UX
                                </div>
                            </div>

                            {/* Team Members */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                                {/* Adam - Tech Leader */}
                                <div className="text-center">
                                    <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                        A
                                    </div>
                                    <h4 className="font-semibold text-gray-900">Adam</h4>
                                    <p className="text-sm text-gray-600">Tech Leader</p>
                                </div>

                                {/* Jose Stewart */}
                                <div className="text-center">
                                    <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                        JS
                                    </div>
                                    <h4 className="font-semibold text-gray-900">Jose Stewart</h4>
                                    <p className="text-sm text-gray-600">Full Stack Engineer</p>
                                </div>

                                {/* Mohamed Hamed */}
                                <div className="text-center">
                                    <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                        MH
                                    </div>
                                    <h4 className="font-semibold text-gray-900">Mohamed Hamed</h4>
                                    <p className="text-sm text-gray-600">Front-end Engineer</p>
                                </div>

                                {/* Jakub Nosek */}
                                <div className="text-center">
                                    <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                        JN
                                    </div>
                                    <h4 className="font-semibold text-gray-900">Jakub Nosek</h4>
                                    <p className="text-sm text-gray-600">Backend Engineer</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Media Team */}
                        <div className="bg-white backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Social Media Team</h3>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Spreading the word and keeping you updated. We create content, engage with the community, and make sure everyone knows what's happening.
                                </p>
                                <div className="inline-block px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                                    Content • Engagement • Growth
                                </div>
                            </div>

                            {/* Team Members - Placeholder */}
                            <div className="text-center text-gray-500 italic mt-8">
                                Team members coming soon...
                            </div>
                        </div>

                        {/* Outreach Team */}
                        <div className="bg-white backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Outreach Team</h3>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Connecting with societies, students, and partners. We build relationships that make Durham's social life thrive.
                                </p>
                                <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    Partnerships • Community • Events
                                </div>
                            </div>

                            {/* Team Members - Placeholder */}
                            <div className="text-center text-gray-500 italic mt-8">
                                Team members coming soon...
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Footer */}
            <Footer />
        </div>
    );
};

export default About;