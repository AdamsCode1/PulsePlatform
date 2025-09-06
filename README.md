# DUPulse - Durham University Event Hub

**The comprehensive platform connecting Durham University students with every event, society meetup, and opportunity on campus.**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/AdamsCode1/PulsePlatform)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.50.2-green)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#licensing--credits)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-blue)](https://tailwindcss.com/)

## Architecture Overview

```mermaid
graph TB
    A[Students] --> B[React Frontend]
    C[Societies] --> B
    D[Partners] --> B
    E[Admins] --> B
    
    B --> F[Vercel Edge Functions]
    F --> G[Supabase Backend]
    G --> H[PostgreSQL Database]
    G --> I[Authentication & RLS]
    G --> J[Real-time Subscriptions]
    
    B --> K[Static Assets]
    K --> L[Vercel CDN]
```

**Why DUPulse?**
- **No more FOMO**: Never miss important events across Durham's 200+ societies
- **One unified platform**: Replace scattered WhatsApp groups, emails, and websites

<details>
<summary>📋 Table of Contents</summary>

- [Quickstart](#quickstart)
- [Features](#features)
- [Architecture Overview](#architecture-overview-1)
- [Configuration](#configuration)
- [Development Setup](#development-setup)
- [Testing & Quality](#testing--quality)
- [Deployment](#deployment)
- [Security](#security)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [FAQ / Troubleshooting](#faq--troubleshooting)
- [Examples / Showcase](#examples--showcase)
- [Licensing & Credits](#licensing--credits)

</details>

## Quickstart

### Prerequisites
- **Node.js** 18.0.0+ 
- **Bun** (recommended) or npm/yarn
- **Git** for version control

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/AdamsCode1/PulsePlatform.git
cd PulsePlatform

# Install dependencies (Bun recommended for speed)
bun install
# or: npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
bun run dev
# or: npm run dev
```

**Success indicator**: Navigate to `http://localhost:5173` and see the DUPulse landing page with purple gradient background.

### Environment Setup
```bash
# Required Supabase configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=http://localhost:5173

# Backend API configuration  
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Features

### 🔐 Multi-Role Authentication
- **Students**: Event discovery, RSVP management, deal access
- **Societies**: Event submission, member engagement analytics
- **Partners**: Business event promotion, student deal offerings
- **Administrators**: Platform oversight, content moderation

### 📊 Role-Specific Dashboards
- **Student Dashboard**: Personalised event recommendations, RSVP tracking
- **Society Dashboard**: Event submission workflow, attendance analytics
- **Partner Dashboard**: Event and deal management, engagement metrics
- **Admin Dashboard**: User management, content approval, platform analytics

### 🎨 Modern Design System
- **Dark theme**: Purple/black gradients with animated PULSE pattern backgrounds
- **Mobile-first**: Responsive design optimised for all devices
- **Accessibility**: WCAG 2.1 AA compliant, high contrast support
- **Component library**: Built on shadcn/ui and Radix UI primitives

### 🎯 Event Management
- **Smart discovery**: Filter by society, date, category, and location
- **One-click RSVP**: Seamless event registration for students
- **Approval workflow**: Society event submission with admin moderation
- **Real-time updates**: Live RSVP counts and event status changes

## Architecture Overview

### Core Technologies
- **Frontend**: React 18 with TypeScript, Vite build system
- **Backend**: Supabase (PostgreSQL + real-time subscriptions)
- **Authentication**: Supabase Auth with JWT tokens
- **Deployment**: Vercel serverless platform with edge functions
- **Styling**: Tailwind CSS with shadcn/ui component library

### Data Flow
- **Authentication**: JWT-based with role-specific routing
- **Real-time**: WebSocket connections for live RSVP updates
- **Security**: Row Level Security (RLS) policies in PostgreSQL
- **Performance**: Edge caching and CDN delivery via Vercel

### Key Dependencies
- **UI Framework**: React 18.3.1, React Router v6
- **Type Safety**: TypeScript 5.5.3, Zod validation
- **Forms**: React Hook Form with Zod resolvers
- **Animation**: Framer Motion, GSAP for smooth interactions
- **Testing**: Jest with React Testing Library

### Repository Structure
```
PulsePlatform/
├── api/                    # Vercel serverless functions
├── docs/                   # Comprehensive documentation
├── src/                    # React frontend source
│   ├── components/         # Reusable UI components
│   ├── pages/             # Route components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility functions
├── supabase/              # Database migrations & config
├── tests/                 # Jest test suites
└── tools/                 # Development utilities
```

## Deployment

### Vercel (Production)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

### Docker (Alternative)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--port", "3000", "--host"]
```

### Database Migrations
```bash
# Apply database schema changes
supabase db push

# Create new migration
supabase db diff --schema public > supabase/migrations/new_migration.sql

# Reset database (development only)
supabase db reset
```

## Security

### Authentication & Authorisation
- **JWT tokens**: Secure authentication via Supabase Auth
- **Row Level Security**: Database-level access control policies
- **Role-based access**: Granular permissions per user type
- **Session management**: Automatic token refresh and validation

### Data Protection
- **Input validation**: Zod schemas for all form inputs and API endpoints
- **SQL injection prevention**: Parameterised queries via Supabase client
- **XSS protection**: Content Security Policy headers
- **HTTPS enforcement**: TLS encryption for all communications

### Vulnerability Reporting
email Adam directly.

## Roadmap

### Q1 2025
- [ ] **Student Deals Platform** - Exclusive discounts and offers integration
- [ ] **Mobile Push Notifications** - Real-time event reminders and updates
- [ ] **AI Event Recommendations** - Personalised suggestions based on attendance history

### Q2 2025
- [ ] **Social Features** - User profiles, friend connections, shared interests
- [ ] **Achievement System** - Badges and rewards for event participation
- [ ] **Advanced Analytics** - Society engagement metrics and insights dashboard

### Future Enhancements
- [ ] **Mobile App** - Native iOS/Android applications
- [ ] **Calendar Integration** - Sync with Google Calendar, Outlook
- [ ] **Advanced Search** - Full-text search with filters and sorting

## Contributing

We welcome contributions from the Durham University community! 

### Acknowledgements
- **Durham University** for inspiration and the vibrant student community
- **Supabase** for excellent backend-as-a-service platform
- **Vercel** for seamless deployment and hosting
- **shadcn/ui** for beautiful, accessible UI components
- **React** and **TypeScript** communities for robust development tools

### Third-Party Dependencies
This project uses various open-source libraries. Full attribution available in `package.json` and generated license reports.

*Never miss another event at Durham. Join thousands of students already using DUPulse to discover, attend, and connect.*
