# 🎯 DUPulse - Your Durham University Event Hub

**Never miss out on what's happening at Durham again!**

DUPulse is the all-in-one platform that brings together every event, society meetup, academic talk, and social gathering happening across Durham University. No more FOMO, no more scrolling through endless group chats or checking multiple websites - everything you need to know is right here.

## 🚀 What is DUPulse?

Tired of finding out about amazing events *after* they've happened? We've all been there. DUPulse solves the age-old problem of event discovery at Durham University by bringing together:

- 🎓 **Society Events** - From freshers' activities to career talks
- 📚 **Academic Seminars** - Guest lectures, research presentations, and workshops  
- ⚽ **Sports Events** - Matches, tournaments, and fitness classes
- 🎉 **Social Gatherings** - Parties, cultural nights, and networking events
- 💼 **Career Events** - Job fairs, recruitment talks, and industry meetups
- 🎨 **Creative Workshops** - Art classes, photography sessions, and creative meetups

## ✨ Current Features

### 🔐 Multi-Role Authentication System
- **Students**: Discover events and manage RSVPs
- **Societies**: Submit and manage events
- **Partners**: Business partnerships and deals
- **Administrators**: Platform oversight and content moderation

### 📊 Role-Specific Dashboards
- **Student Dashboard**: Event discovery, RSVP management, and personalized recommendations
- **Society Dashboard**: Event submission, RSVP tracking, and society management
- **Partner Dashboard**: Event and deal submission with business analytics
- **Admin Dashboard**: Platform administration and content moderation

### 🎨 Modern Design System
- **Dark Theme**: Sophisticated purple/black gradients with pink accents
- **PULSE Pattern**: Animated backgrounds for visual appeal
- **Mobile-First**: Responsive design optimized for all devices
- **Accessibility**: WCAG 2.1 AA compliant with high contrast support

### 🎯 Event Management
- **Event Discovery**: Browse approved events with smart filtering
- **Easy RSVP**: One-click event registration for students
- **Event Submission**: Societies and partners can submit events
- **Status Tracking**: Pending, approved, rejected workflow

## 🔮 Coming Soon

We're just getting started! Here's what's coming to make your Durham experience even better:

- 💰 **Student Deals** - Exclusive discounts and offers for Durham students
- � **Smart Notifications** - Email and push notifications for events
- 🎯 **AI Recommendations** - Personalized event suggestions based on interests
- 📈 **Analytics Dashboard** - Comprehensive insights for societies and partners
- 👥 **Social Features** - Connect with like-minded students
- � **Achievement System** - Earn badges for attending different types of events

## 🎯 Who Is This For?

### 👨‍🎓 Students
- Discover events you're actually interested in
- Make the most of your Durham experience
- Meet new people and try new things
- Stay updated on academic opportunities

### 🎪 Societies & Organizations
- Reach more students with your events
- Track RSVPs and engagement
- Manage your society's online presence
- Access analytics and insights

### 🤝 Business Partners
- Connect with Durham students
- Promote events and special offers
- Build brand awareness on campus
- Track engagement and ROI

## 📋 Documentation

Comprehensive documentation is available in the `/docs` folder:

- **[Features Overview](docs/FEATURES.md)** - Complete feature documentation
- **[Authentication System](docs/AUTHENTICATION.md)** - Multi-role auth implementation
- **[Dashboard System](docs/DASHBOARDS.md)** - Role-specific dashboard features
- **[Design System](docs/DESIGN_SYSTEM.md)** - UI/UX design guidelines
- **[Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)** - Technical implementation details
- **[Setup & Deployment](docs/SETUP_DEPLOYMENT.md)** - Development and deployment guide

## 🛠️ Technical Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for lightning-fast development
- **Tailwind CSS** for responsive, mobile-first design
- **shadcn/ui** for accessible, polished components
- **React Router v6** for modern routing

### Backend
- **Supabase** for complete backend-as-a-service
- **PostgreSQL** with Row Level Security
- **Supabase Auth** for secure authentication
- **Real-time subscriptions** for live updates

### Deployment
- **Vercel** for serverless deployment
- **GitHub Actions** for CI/CD
- **Edge Network** for global performance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Bun (recommended) or npm

### Installation
```bash
# Clone the repository
git clone https://github.com/AdamsCode1/PulsePlatform.git

# Navigate to project directory
cd PulsePlatform

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
bun run dev
```

The application will be available at `http://localhost:5173`

### Environment Variables
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=http://localhost:5173
```

## 🧪 Testing

```bash
# Run unit tests
bun run test

# Run tests with coverage
bun run test:coverage

# Run linting
bun run lint

# Type checking
bun run type-check
```

## � Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Web App**: Installable on mobile devices

## 🔒 Security

- **Authentication**: Secure JWT-based authentication via Supabase
- **Database**: Row Level Security (RLS) for data protection
- **HTTPS**: All communications encrypted in transit
- **Input Validation**: Client and server-side validation
- **CORS**: Properly configured cross-origin resource sharing

## 🤝 Contributing

We welcome contributions from the Durham community! 

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Follow the established code style
- Update documentation as needed

## 📞 Support & Feedback

This is a project by Durham students, for Durham students. Got ideas? Found a bug? Want to help out?

- 🐛 **Report Issues**: [GitHub Issues](https://github.com/AdamsCode1/PulsePlatform/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/AdamsCode1/PulsePlatform/discussions)
- 📧 **Contact**: [Your contact email]
- 📢 **Stay Updated**: Watch this repository for updates

## 📊 Project Status

- **Version**: 1.0.0
- **Status**: Active Development
- **Last Updated**: August 2025
- **License**: MIT

### Current Metrics
- ✅ **Authentication System**: Complete
- ✅ **Dashboard System**: Complete  
- ✅ **Event Management**: Complete
- ✅ **Design System**: Complete
- 🚧 **Student Deals**: In Development
- 🚧 **Notifications**: Planned
- 🚧 **Mobile App**: Planned

## 🙏 Acknowledgments

- Durham University for inspiration
- The Durham student community for feedback
- Open source contributors and maintainers
- Supabase for excellent backend services
- Vercel for deployment platform

---

**Built with ❤️ for the Durham University community**
- Societies and student organizations
- University departments
- Student unions and colleges
- External partners hosting Durham events

## 🚧 Development Status

DUPulse is currently in active development. We're working hard to build the platform that Durham students deserve. Want to stay updated or contribute ideas?

## 🛠️ Technical Details

### Built With
- **React** - Modern, responsive user interface
- **TypeScript** - Type-safe, reliable code
- **Tailwind CSS** - Beautiful, mobile-first design
- **Vite** - Lightning-fast development experience
- **shadcn/ui** - Polished, accessible components

### For Developers

Want to contribute or run this locally?

```bash
# Clone the repository
git clone https://github.com/AdamsCode1/PulsePlatform.git

# Navigate to project directory
cd PulsePlatform

# Install dependencies
npm install

# Start development server
npm run dev
```

**Requirements:** Node.js 18+ and npm

## 📞 Get Involved

This is a project by Durham students, for Durham students. Got ideas? Found a bug? Want to help out?

- 🐛 Report issues on GitHub
- 💡 Suggest features 
- 🤝 Contribute to development
- 📢 Spread the word!
