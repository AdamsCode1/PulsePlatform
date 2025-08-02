# 🚀 Development Setup & Deployment Guide

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **Package Manager**: Bun (recommended) or npm
- **Git**: Latest version for version control
- **Code Editor**: VS Code with recommended extensions

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-json"
  ]
}
```

## Local Development Setup

### 1. Repository Setup
```bash
# Clone the repository
git clone https://github.com/AdamsCode1/PulsePlatform.git

# Navigate to project directory
cd PulsePlatform

# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install
# or with npm
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=DUPulse

# Optional: Analytics and monitoring
VITE_VERCEL_ANALYTICS_ID=your_analytics_id
```

### 3. Supabase Setup
```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Initialize Supabase (if starting fresh)
supabase init

# Start local Supabase (optional for local development)
supabase start

# Apply database migrations
supabase db push
```

### 4. Development Server
```bash
# Start development server
bun run dev
# or with npm
npm run dev

# Server will start at http://localhost:5173
```

## Available Scripts

### Development Commands
```bash
# Start development server with hot reload
bun run dev

# Build for production
bun run build

# Preview production build locally
bun run preview

# Run type checking
bun run type-check

# Run linting
bun run lint

# Fix linting issues
bun run lint:fix

# Format code with Prettier
bun run format
```

### Testing Commands
```bash
# Run unit tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage

# Run end-to-end tests
bun run test:e2e
```

### Database Commands
```bash
# Generate TypeScript types from Supabase
bun run generate-types

# Run database migrations
bun run db:migrate

# Reset database (development only)
bun run db:reset

# Seed database with sample data
bun run db:seed
```

## Project Configuration

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Tailwind Configuration
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float-up-1': 'floatUp1 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-avatar', '@radix-ui/react-button'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
```

## Deployment

### Vercel Deployment (Recommended)

#### 1. Vercel CLI Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (first time)
vercel --prod

# Deploy subsequent updates
vercel --prod
```

#### 2. Environment Variables in Vercel
```bash
# Add environment variables via CLI
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Or via Vercel Dashboard:
# 1. Go to your project settings
# 2. Navigate to Environment Variables
# 3. Add all required variables
```

#### 3. Automatic Deployments
Connect your GitHub repository to Vercel for automatic deployments:

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `bun run build`
   - **Output Directory**: `dist`
   - **Install Command**: `bun install`

### Manual Deployment

#### 1. Build Production Bundle
```bash
# Create production build
bun run build

# The build will be in the 'dist' directory
```

#### 2. Deploy to Static Hosting
The `dist` folder can be deployed to any static hosting service:
- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Configure GitHub Actions for automatic deployment
- **AWS S3 + CloudFront**: Upload to S3 bucket with CloudFront distribution
- **Firebase Hosting**: Use Firebase CLI to deploy

### Domain Configuration

#### Custom Domain Setup (Vercel)
```bash
# Add custom domain via CLI
vercel domains add yourdomain.com

# Or via Vercel Dashboard:
# 1. Go to project settings
# 2. Navigate to Domains
# 3. Add your custom domain
# 4. Configure DNS records as instructed
```

#### SSL Configuration
Vercel automatically provides SSL certificates. For other hosting providers:
- Use Let's Encrypt for free SSL certificates
- Configure HTTPS redirects
- Update CORS settings in Supabase if needed

## Database Setup

### Supabase Project Setup
1. **Create Project**: Go to [supabase.com](https://supabase.com) and create a new project
2. **Database Password**: Set a strong database password
3. **Region**: Choose the region closest to your users
4. **Get Credentials**: Copy the project URL and anon key

### Database Migrations
```sql
-- Run these in Supabase SQL Editor

-- Create societies table
CREATE TABLE societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table
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

-- Create RSVPs table
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id UUID REFERENCES events(id),
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Enable Row Level Security
ALTER TABLE societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
```

### Storage Setup
```sql
-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('event-images', 'event-images', true);

-- Create storage policy
CREATE POLICY "Anyone can view event images" ON storage.objects FOR SELECT USING (bucket_id = 'event-images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'event-images' AND auth.role() = 'authenticated');
```

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading
```bash
# Check if .env.local exists and has correct variables
cat .env.local

# Restart development server after adding variables
bun run dev
```

#### 2. Supabase Connection Issues
```typescript
// Test Supabase connection
import { supabase } from './src/lib/supabaseClient';

const testConnection = async () => {
  const { data, error } = await supabase.from('events').select('count');
  console.log('Connection test:', { data, error });
};
```

#### 3. Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules bun.lockb
bun install

# Clear Vite cache
rm -rf node_modules/.vite
bun run build
```

#### 4. TypeScript Errors
```bash
# Run type checking
bun run type-check

# Generate fresh types from Supabase
bunx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

### Performance Issues
```bash
# Analyze bundle size
bunx vite-bundle-analyzer

# Check for unused dependencies
bunx depcheck

# Optimize images
# Use WebP format for better compression
# Implement responsive images with srcset
```

## Development Best Practices

### Code Organization
- **Components**: Reusable UI components in `/src/components`
- **Pages**: Route components in `/src/pages`
- **Hooks**: Custom hooks in `/src/hooks`
- **Utils**: Utility functions in `/src/lib`
- **Types**: TypeScript definitions in `/src/types`

### Git Workflow
```bash
# Feature branch workflow
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create pull request
# Merge after review
```

### Commit Message Format
```
feat: add new feature
fix: resolve bug
docs: update documentation
style: format code
refactor: restructure component
test: add unit tests
chore: update dependencies
```

---

**Last Updated**: August 2025  
**Setup Version**: 1.0.0  
**Node.js**: 18+ Required
