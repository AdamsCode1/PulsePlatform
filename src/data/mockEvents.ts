
import { Event } from '../types/Event';

export const mockEvents: Event[] = [
  {
    id: '1',
    eventName: 'Tech Talk: AI in Modern Development',
    date: new Date().toISOString(),
    location: 'Engineering Building, Room 101',
    description: 'Join us for an exciting discussion about how AI is transforming the software development landscape. Our guest speaker will cover machine learning integration, code generation tools, and the future of programming. This event is perfect for students and professionals looking to stay ahead of the curve in technology.',
    organiserID: 'soc1',
    societyName: 'Computer Science Society',
    time: '6:00 PM',
    endTime: '8:00 PM',
    attendeeCount: 45,
    imageUrl: '/placeholder.svg',
    requiresOrganizerSignup: false
  },
  {
    id: '2',
    eventName: 'Photography Workshop: Portrait Basics',
    date: new Date().toISOString(),
    location: 'Art Studio, Building C',
    description: 'Learn the fundamentals of portrait photography in this hands-on workshop. We\'ll cover lighting techniques, composition rules, and camera settings. Bring your camera or smartphone - all skill levels welcome! Professional equipment will be available for practice.',
    organiserID: 'soc2',
    societyName: 'Photography Club',
    time: '2:00 PM',
    endTime: '5:00 PM',
    attendeeCount: 12,
    imageUrl: '/placeholder.svg',
    requiresOrganizerSignup: true,
    organizerEmail: 'photoclub@university.edu'
  },
  {
    id: '3',
    eventName: 'Startup Pitch Competition',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    location: 'Business School Auditorium',
    description: 'Watch innovative student entrepreneurs pitch their startup ideas to a panel of industry experts and investors. Prize pool of $10,000 for the winning team. Network with like-minded individuals and get inspired by creative solutions to real-world problems.',
    organiserID: 'soc3',
    societyName: 'Entrepreneurship Society',
    time: '7:00 PM',
    endTime: '9:30 PM',
    attendeeCount: 120,
    imageUrl: '/placeholder.svg',
    requiresOrganizerSignup: false
  },
  {
    id: '4',
    eventName: 'Sustainable Living Workshop',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    location: 'Environmental Science Lab',
    description: 'Discover practical ways to reduce your environmental footprint. We\'ll demonstrate eco-friendly alternatives for daily activities, discuss sustainable fashion, and teach you how to create your own natural cleaning products. Take home starter kits and recipes!',
    organiserID: 'soc4',
    societyName: 'Environmental Action Group',
    time: '4:00 PM',
    endTime: '6:00 PM',
    attendeeCount: 28,
    imageUrl: '/placeholder.svg',
    requiresOrganizerSignup: true,
    organizerEmail: 'enviro@university.edu'
  },
  {
    id: '5',
    eventName: 'Game Development Hackathon',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Computer Lab, Tech Building',
    description: 'Create an amazing game in just 24 hours! Teams of 2-4 people will compete to build the most creative and fun game. Pizza, energy drinks, and mentorship provided. Prizes for best game design, most innovative concept, and people\'s choice award.',
    organiserID: 'soc1',
    societyName: 'Game Development Society',
    time: '9:00 AM',
    endTime: '9:00 AM (next day)',
    attendeeCount: 67,
    imageUrl: '/placeholder.svg',
    requiresOrganizerSignup: true,
    organizerEmail: 'gamedev@university.edu'
  },
  {
    id: '6',
    eventName: 'Cultural Night: Taste of Asia',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Student Union Main Hall',
    description: 'Experience the rich cultures of Asia through food, music, and dance performances. Sample authentic dishes from various Asian countries, enjoy traditional performances, and learn about different cultural traditions. Free entry and food sampling!',
    organiserID: 'soc5',
    societyName: 'International Students Association',
    time: '6:30 PM',
    endTime: '10:00 PM',
    attendeeCount: 200,
    imageUrl: '/placeholder.svg',
    requiresOrganizerSignup: false
  }
];
