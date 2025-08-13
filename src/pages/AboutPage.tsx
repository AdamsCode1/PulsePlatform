import NavBar from '../components/NavBar';

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            {/* Hero section with gradient background */}
            <div className="bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left side - Text content */}
                        <div className="space-y-8">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                About PulsePlatform
                            </h1>

                            <div className="w-16 h-1 bg-blue-600"></div>

                            <p className="text-xl text-gray-700 leading-relaxed">
                                We're building the future of student engagement and campus life through innovative technology solutions.
                            </p>
                        </div>

                        {/* Right side - Team image */}
                        <div className="flex justify-center lg:justify-end">
                            <img
                                src="/image-uploads/about_us1.jpeg"
                                alt="Our team collaborating"
                                className="rounded-2xl shadow-2xl max-w-lg w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content section */}
            <div className="bg-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-8">
                        <div className="prose prose-lg max-w-none">
                            <p className="text-xl text-gray-800 leading-relaxed mb-8">
                                <span className="text-6xl font-bold text-gray-900 float-left mr-4 mt-2 leading-none">P</span>
                                ulsePlatform is a comprehensive platform designed to enhance student life and campus engagement.
                                We empower students, faculty, and staff to connect, collaborate, and thrive in an integrated
                                digital ecosystem that brings campus communities together.
                            </p>

                            <p className="text-lg text-gray-700 leading-relaxed mb-6">
                                Our mission is to revolutionize how educational institutions manage events, facilitate
                                communication, and foster meaningful connections within their communities. Through cutting-edge
                                technology and user-centric design, we're making campus life more accessible, engaging,
                                and connected than ever before.
                            </p>

                            <p className="text-lg text-gray-700 leading-relaxed mb-6">
                                From event management and scheduling to social networking and resource sharing,
                                PulsePlatform provides the tools that modern educational communities need to succeed.
                                We believe in the power of technology to break down barriers and create opportunities
                                for every member of the campus community.
                            </p>

                            <p className="text-lg text-gray-700 leading-relaxed">
                                Since our founding, we've been committed to innovation, accessibility, and creating
                                solutions that truly make a difference in people's educational journey. We're not just
                                building software—we're building the future of connected campus communities.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats section */}
            <div className="bg-gradient-to-br from-cyan-300 via-purple-300 via-pink-300 to-emerald-200 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-purple-700">200+</div>
                            <div className="text-sm text-purple-600 uppercase tracking-wide">Societies</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-pink-700">10K+</div>
                            <div className="text-sm text-pink-600 uppercase tracking-wide">Active Students</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-cyan-700">500+</div>
                            <div className="text-sm text-cyan-600 uppercase tracking-wide">Events Monthly</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-emerald-700">24/7</div>
                            <div className="text-sm text-emerald-600 uppercase tracking-wide">Platform Support</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
