import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import ContactModal from './ContactModal';

// Custom SVG Icons with unique, modern styling
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
    </svg>
);

const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);

const ArrowUpRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M7 7h10v10M7 17L17 7" />
    </svg>
);

export default function Footer() {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const navigate = useNavigate();
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const handleNavigation = (path: string, sectionId?: string) => {
        if (window.location.pathname === '/' && sectionId) {
            // We're on the home page, just scroll to section
            scrollToSection(sectionId);
        } else if (sectionId) {
            // We're on a different page, navigate to home then scroll
            navigate('/');
            setTimeout(() => scrollToSection(sectionId), 100);
        } else {
            // Regular navigation
            navigate(path);
        }
    };

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
        },
    };

    return (
        <>
            <motion.footer
                ref={ref}
                variants={containerVariants}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                className="bg-gray-800 text-white relative overflow-hidden"
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-dupulse-pink/20 to-dupulse-cyan/20 rounded-full filter blur-3xl"></div>
                </div>

                <div className="relative">
                    {/* Main Footer Content */}
                    <div className="max-w-7xl mx-auto px-6 py-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12">

                            {/* Column 1: Brand & Description */}
                            <motion.div variants={itemVariants} className="lg:col-span-1">
                                <div className="mb-8">
                                    <img
                                        src="/image-uploads/DUPfooterLogo.png"
                                        alt="DUPulse Logo"
                                        className="h-12 w-auto mb-6"
                                    />
                                    <h3 className="text-lg font-bold mb-4 leading-tight">
                                        <span className="bg-gradient-to-r from-dupulse-pink to-dupulse-cyan bg-clip-text text-transparent">
                                            The vibrant core of Durham's student life
                                        </span>
                                    </h3>
                                    <p className="text-gray-300 text-sm leading-relaxed font-medium">
                                        Discover events, unlock exclusive deals, and connect with your community like never before.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Column 2: Quick Links */}
                            <motion.div variants={itemVariants} className="lg:col-span-1">
                                <h4 className="text-white font-semibold text-sm uppercase tracking-wide mb-6">
                                    Navigate
                                </h4>
                                <nav className="space-y-4">
                                    {[
                                        { name: 'About', action: () => navigate('/about') },
                                        { name: 'Events', action: () => handleNavigation('/', 'schedule') },
                                        { name: 'Deals', action: () => navigate('/deals') },
                                        { name: 'Contact', action: () => setIsContactModalOpen(true) }
                                    ].map((link) => (
                                        <motion.button
                                            key={link.name}
                                            onClick={link.action}
                                            className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium group text-left"
                                            whileHover={{ x: 4 }}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span className="w-1 h-1 bg-dupulse-pink rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                                                {link.name}
                                            </span>
                                        </motion.button>
                                    ))}
                                </nav>
                            </motion.div>

                            {/* Column 3: Key Metrics */}
                            <motion.div variants={itemVariants} className="lg:col-span-1">
                                <h4 className="text-white font-semibold text-sm uppercase tracking-wide mb-6">
                                    Impact
                                </h4>
                                <div className="space-y-6">
                                    {/* Events Metric */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                                        transition={{ delay: 0.3, duration: 0.6 }}
                                        className="bg-gradient-to-r from-dupulse-pink/10 to-dupulse-purple/10 p-4 rounded-xl border border-dupulse-pink/20"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-2 h-2 bg-dupulse-pink rounded-full animate-pulse"></div>
                                            <span className="text-dupulse-pink font-bold text-2xl">50+</span>
                                        </div>
                                        <p className="text-gray-300 text-sm font-medium">Events every week</p>
                                        <p className="text-gray-400 text-xs mt-1">Keeping Durham vibrant</p>
                                    </motion.div>

                                    {/* Views Metric */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                                        transition={{ delay: 0.5, duration: 0.6 }}
                                        className="bg-gradient-to-r from-dupulse-cyan/10 to-dupulse-blue/10 p-4 rounded-xl border border-dupulse-cyan/20"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-2 h-2 bg-dupulse-cyan rounded-full animate-pulse"></div>
                                            <span className="text-dupulse-cyan font-bold text-2xl">167K+</span>
                                        </div>
                                        <p className="text-gray-300 text-sm font-medium">Total views on all platforms</p>
                                        <p className="text-gray-400 text-xs mt-1">Reaching the community</p>
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Column 4: Connect & Follow */}
                            <motion.div variants={itemVariants} className="lg:col-span-1">
                                <h4 className="text-white font-semibold text-sm uppercase tracking-wide mb-6">
                                    Connect
                                </h4>

                                {/* Social Media Links */}
                                <div className="space-y-4">
                                    <motion.a
                                        href="https://www.instagram.com/dupulse/"
                                        className="flex items-center justify-between p-4 bg-gray-700/40 border border-gray-600/40 rounded-xl hover:bg-gray-700/60 hover:border-dupulse-pink/40 transition-all duration-200 group shadow-sm"
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <InstagramIcon className="w-5 h-5 text-dupulse-pink" />
                                            <div>
                                                <span className="text-white font-semibold text-sm block">Instagram</span>
                                                <span className="text-xs text-gray-300 font-medium">1.6K followers</span>
                                            </div>
                                        </div>
                                        <ArrowUpRightIcon className="w-3 h-3 text-gray-400 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-200" />
                                    </motion.a>

                                    <motion.a
                                        href="https://wa.me/447562524965"
                                        className="flex items-center justify-between p-4 bg-gray-700/40 border border-gray-600/40 rounded-xl hover:bg-gray-700/60 hover:border-green-500/40 transition-all duration-200 group shadow-sm"
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <WhatsAppIcon className="w-5 h-5 text-green-500" />
                                            <div>
                                                <span className="text-white font-semibold text-sm block">WhatsApp Community</span>
                                                <span className="text-xs text-gray-300 font-medium">200+ members</span>
                                            </div>
                                        </div>
                                        <ArrowUpRightIcon className="w-3 h-3 text-gray-400 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-200" />
                                    </motion.a>

                                    <motion.a
                                        href="https://www.linkedin.com/company/dupulse/"
                                        className="flex items-center justify-between p-4 bg-gray-700/40 border border-gray-600/40 rounded-xl hover:bg-gray-700/60 hover:border-blue-500/40 transition-all duration-200 group shadow-sm"
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <LinkedInIcon className="w-5 h-5 text-blue-400" />
                                            <div>
                                                <span className="text-white font-semibold text-sm block">LinkedIn</span>
                                                <span className="text-xs text-gray-300 font-medium">Company page</span>
                                            </div>
                                        </div>
                                        <ArrowUpRightIcon className="w-3 h-3 text-gray-400 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-200" />
                                    </motion.a>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <motion.div
                        variants={itemVariants}
                        className="border-t border-gray-700/50"
                    >
                        <div className="max-w-7xl mx-auto px-6 py-8">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
                                <p className="text-gray-300 font-medium">&copy; {new Date().getFullYear()} DUPulse. All rights reserved.</p>
                                <div className="flex gap-10">
                                    <motion.a
                                        href="#privacy"
                                        className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                                        whileHover={{ y: -1 }}
                                    >
                                        Privacy Policy
                                    </motion.a>
                                    <motion.a
                                        href="#terms"
                                        className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                                        whileHover={{ y: -1 }}
                                    >
                                        Terms of Service
                                    </motion.a>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.footer>

            {/* Contact Modal */}
            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </>
    );
}

