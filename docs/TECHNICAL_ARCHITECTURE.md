# 🛠️ Technical Architecture Documentation

## Overview

DUPulse is built using modern web technologies with a focus on performance, scalability, and developer experience. The architecture follows best practices for React applications with TypeScript and integrates seamlessly with Supabase for backend services.

## Technology Stack

### Frontend Technologies
- **React 18**: Modern React with Concurrent Features and Suspense
- **TypeScript 5**: Full type safety with latest language features
- **Vite**: Next-generation build tool with HMR and ES modules
- **Tailwind CSS**: Utility-first CSS framework with JIT compilation
- **React Router v6**: Declarative routing with data loading and error boundaries

### UI & Component Libraries
- **shadcn/ui**: Accessible component library built on Radix UI
- **Radix UI**: Unstyled, accessible components for complex UI patterns
- **Lucide React**: Beautiful, customizable SVG icons
- **React Hook Form**: Performant forms with minimal re-renders
- **Zod**: TypeScript-first schema validation

### Backend & Infrastructure
- **Supabase**: Complete backend-as-a-service with PostgreSQL
- **PostgreSQL**: Powerful, open-source relational database
- **Supabase Auth**: Built-in authentication with JWT tokens
- **Supabase Storage**: File storage for images and assets
- **Row Level Security**: Database-level security policies

### Development Tools
- **Bun**: Fast JavaScript runtime and package manager
- **ESLint**: Code linting with React and TypeScript rules
- **Prettier**: Code formatting with consistent style
- **Jest**: Unit testing framework with React Testing Library
- **TypeScript Compiler**: Type checking and compilation

### Build & Deployment
- **Vercel**: Serverless deployment platform with edge functions
- **Vercel Analytics**: Web analytics and performance monitoring
- **GitHub Actions**: CI/CD pipeline for automated testing and deployment
- **Environment Variables**: Secure configuration management

## Project Structure

```
PulsePlatform/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── NavBar.tsx       # Navigation component
│   │   ├── Footer.tsx       # Footer component
│   │   └── LoadingSpinner.tsx
│   ├── pages/               # Page components and routing
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── partner/         # Partner dashboard pages
│   │   ├── society/         # Society dashboard pages
│   │   ├── student/         # Student dashboard pages
│   │   ├── Index.tsx        # Landing page
│   │   └── NotFound.tsx     # 404 error page
│   ├── lib/                 # Utility functions and configurations
│   │   ├── supabaseClient.ts # Supabase client configuration
│   │   ├── utils.ts         # General utility functions
│   │   └── apiConfig.ts     # API configuration
│   ├── hooks/               # Custom React hooks
│   │   ├── use-toast.ts     # Toast notification hook
│   │   └── use-mobile.tsx   # Mobile detection hook
│   ├── types/               # TypeScript type definitions
│   │   ├── database.ts      # Database schema types
│   │   └── Event.ts         # Event-related types
│   ├── data/                # Mock data and constants
│   │   ├── mockEvents.ts    # Sample event data
│   │   └── mockDeals.ts     # Sample deal data
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles and Tailwind imports
├── public/                  # Static assets
│   ├── image-uploads/       # User-uploaded images
│   └── favicon.ico          # Site favicon
├── docs/                    # Documentation files
├── tests/                   # Test files and utilities
├── api/                     # Serverless API functions
├── supabase/               # Supabase configuration and migrations
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── vite.config.ts          # Vite build configuration
```

## Component Architecture

### Component Hierarchy
```
App
├── BrowserRouter
├── Routes
│   ├── Public Routes
│   │   ├── Index (Landing Page)
│   │   ├── DealsPage
│   │   └── MeetTheTeam
│   ├── Authentication Routes
│   │   ├── UserTypeSelection
│   │   ├── StudentLogin
│   │   ├── SocietyLogin
│   │   ├── PartnerLogin
│   │   └── Registration Components
│   ├── Student Routes
│   │   ├── StudentDashboard
│   │   └── StudentRSVPs
│   ├── Society Routes
│   │   ├── SocietyDashboard
│   │   ├── SocietyEvents
│   │   └── SocietySubmitEvent
│   ├── Partner Routes
│   │   ├── PartnerDashboard
│   │   ├── PartnerEvents
│   │   ├── PartnerDeals
│   │   └── Submission Forms
│   └── Admin Routes
│       ├── AdminDashboard
│       ├── AdminEvents
│       └── AdminDeals
```

### Shared Components
- **NavBar**: Responsive navigation with user context
- **Footer**: Consistent footer across all pages
- **LoadingSpinner**: Centralized loading state component
- **UI Components**: shadcn/ui components for consistency

## State Management

### Local State Management
```typescript
// Component state with React hooks
const [events, setEvents] = useState<Event[]>([]);
const [loading, setLoading] = useState(true);
const [user, setUser] = useState<User | null>(null);
```

### Authentication State
```typescript
// Supabase auth state management
const { data: { user } } = await supabase.auth.getUser();
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

### Server State
```typescript
// Database queries with Supabase
const { data, error } = await supabase
  .from('events')
  .select(`
    *,
    society:societies(name),
    rsvps:rsvps(count())
  `)
  .eq('status', 'approved')
  .order('date', { ascending: true });
```

## Database Schema

### Core Tables
```sql
-- Users (managed by Supabase Auth)
-- Contains authentication and profile information

-- Societies
CREATE TABLE societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  max_attendees INTEGER,
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  society_id UUID REFERENCES societies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RSVPs
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id UUID REFERENCES events(id),
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);
```

### Row Level Security
```sql
-- Enable RLS on all tables
ALTER TABLE societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Society policies
CREATE POLICY "Societies can manage their own data" ON societies
  FOR ALL USING (auth.email() = email);

-- Event policies
CREATE POLICY "Anyone can view approved events" ON events
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Societies can manage their events" ON events
  FOR ALL USING (society_id IN (
    SELECT id FROM societies WHERE email = auth.email()
  ));

-- RSVP policies
CREATE POLICY "Users can manage their own RSVPs" ON rsvps
  FOR ALL USING (auth.uid() = user_id);
```

## API Design

### Supabase Client Configuration
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

### Data Fetching Patterns
```typescript
// Error handling and loading states
const fetchEvents = async () => {
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*');
    
    if (error) throw error;
    setEvents(data || []);
  } catch (error) {
    console.error('Error fetching events:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

## Security Implementation

### Authentication Security
- **JWT Tokens**: Secure, stateless authentication
- **HTTP-Only Cookies**: Secure token storage
- **CSRF Protection**: Built-in CSRF protection
- **Session Management**: Automatic token refresh

### Database Security
- **Row Level Security**: Database-level access control
- **Parameterized Queries**: SQL injection protection
- **Input Validation**: Client and server-side validation
- **Data Encryption**: Encrypted data transmission

### Environment Security
```typescript
// Environment variable validation
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

requiredEnvVars.forEach(envVar => {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy loading for route components
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const SocietyDashboard = lazy(() => import('./pages/society/Dashboard'));

// Suspense boundaries for loading states
<Suspense fallback={<LoadingSpinner />}>
  <StudentDashboard />
</Suspense>
```

### Bundle Optimization
```typescript
// Vite configuration for optimization
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-avatar', '@radix-ui/react-button'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
});
```

### Caching Strategy
- **Browser Cache**: Static assets cached with long TTL
- **API Response Cache**: Supabase automatic query caching
- **Image Optimization**: Responsive images with WebP support
- **CDN Distribution**: Vercel Edge Network for global delivery

## Testing Strategy

### Unit Testing
```typescript
// Component testing with React Testing Library
import { render, screen } from '@testing-library/react';
import { StudentDashboard } from './StudentDashboard';

test('renders student dashboard', () => {
  render(<StudentDashboard />);
  expect(screen.getByText('Welcome back')).toBeInTheDocument();
});
```

### Integration Testing
```typescript
// API integration testing
test('fetches events from Supabase', async () => {
  const events = await fetchEvents();
  expect(events).toHaveLength(5);
  expect(events[0]).toHaveProperty('title');
});
```

### End-to-End Testing
- **Playwright**: Browser automation for E2E testing
- **User Flows**: Complete authentication and dashboard flows
- **Cross-Browser**: Testing across Chrome, Firefox, Safari
- **Mobile Testing**: Responsive design validation

## Deployment Architecture

### Vercel Deployment
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Environment Configuration
```bash
# Production environment variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://dupulse.vercel.app
```

### CI/CD Pipeline
```yaml
# GitHub Actions workflow
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## Monitoring & Analytics

### Performance Monitoring
- **Vercel Analytics**: Real-time performance metrics
- **Core Web Vitals**: LCP, FID, CLS monitoring
- **Error Tracking**: Client-side error reporting
- **User Experience**: Session recording and heatmaps

### Application Monitoring
- **Supabase Dashboard**: Database performance and queries
- **Auth Analytics**: User authentication patterns
- **API Usage**: Request patterns and error rates
- **Feature Usage**: User interaction analytics

---

**Last Updated**: August 2025  
**Architecture Version**: 1.0.0  
**Security Level**: Production Ready
