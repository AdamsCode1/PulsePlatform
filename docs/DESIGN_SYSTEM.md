# 🎨 Design System & UI Documentation

## Overview

DUPulse features a modern, accessible design system built on a dark theme aesthetic with purple gradients and pink accent colors. The design prioritizes user experience across all device types with a mobile-first approach.

## Design Philosophy

### Core Principles
- **Dark Elegance**: Sophisticated dark theme reduces eye strain and creates premium feel
- **Accessibility First**: WCAG 2.1 AA compliance with high contrast ratios
- **Mobile Priority**: Mobile-first responsive design with progressive enhancement
- **Consistent Experience**: Unified design language across all pages and user types
- **Performance Focused**: Optimized animations and efficient CSS delivery

### Visual Identity
- **Brand Colors**: Purple/black gradients with vibrant pink accents
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent spacing scale for visual rhythm
- **Animation**: Subtle, purposeful animations that enhance UX

## Color System

### Primary Palette
```css
/* Background Gradients */
--gradient-primary: linear-gradient(to bottom right, #000000, #1f2937, #000000);
--gradient-secondary: linear-gradient(to bottom right, #1f2937, #111827);

/* Accent Colors */
--pink-primary: #ec4899;     /* Primary pink for buttons and highlights */
--pink-secondary: #f9a8d4;   /* Lighter pink for hover states */
--purple-primary: #7c3aed;   /* Primary purple for gradients */
--purple-secondary: #a855f7; /* Secondary purple for variations */

/* Text Colors */
--text-primary: #ffffff;     /* Primary text on dark backgrounds */
--text-secondary: #f9a8d4;   /* Pink text for labels and descriptions */
--text-muted: #9ca3af;       /* Gray text for secondary information */
```

### Semantic Colors
```css
/* Status Colors */
--success: #10b981;          /* Green for approved/success states */
--warning: #f59e0b;          /* Yellow for pending/warning states */
--error: #ef4444;            /* Red for rejected/error states */
--info: #3b82f6;             /* Blue for informational elements */
```

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
             'Helvetica Neue', sans-serif;
```

### Type Scale
```css
/* Headings */
--text-4xl: 2.25rem;         /* 36px - Page titles */
--text-3xl: 1.875rem;        /* 30px - Section headers */
--text-2xl: 1.5rem;          /* 24px - Card titles */
--text-xl: 1.25rem;          /* 20px - Subheadings */
--text-lg: 1.125rem;         /* 18px - Large body text */

/* Body Text */
--text-base: 1rem;           /* 16px - Default body text */
--text-sm: 0.875rem;         /* 14px - Small text */
--text-xs: 0.75rem;          /* 12px - Micro text */
```

### Font Weights
- **font-normal**: 400 - Regular body text
- **font-medium**: 500 - Emphasized text
- **font-semibold**: 600 - Card titles, buttons
- **font-bold**: 700 - Page headings, important elements

## Layout System

### Grid System
Built on CSS Grid and Flexbox with Tailwind CSS utilities:

```css
/* Common Grid Patterns */
.grid-1-col { grid-template-columns: 1fr; }
.grid-2-col { grid-template-columns: repeat(2, 1fr); }
.grid-3-col { grid-template-columns: repeat(3, 1fr); }
.grid-4-col { grid-template-columns: repeat(4, 1fr); }

/* Responsive Breakpoints */
sm: 640px   /* Tablets portrait */
md: 768px   /* Tablets landscape */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large desktop */
```

### Spacing Scale
Consistent spacing using Tailwind's spacing scale:

```css
/* Spacing Values (rem) */
1: 0.25rem   /* 4px */
2: 0.5rem    /* 8px */
3: 0.75rem   /* 12px */
4: 1rem      /* 16px */
6: 1.5rem    /* 24px */
8: 2rem      /* 32px */
12: 3rem     /* 48px */
16: 4rem     /* 64px */
```

## Components

### Cards
```css
.card-base {
  background: rgba(17, 24, 39, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 1rem; /* 16px */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(to right, #ec4899, #7c3aed);
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(236, 72, 153, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(to right, #db2777, #6d28d9);
  transform: scale(1.05);
}

/* Secondary Button */
.btn-secondary {
  background: rgba(75, 85, 99, 0.5);
  border: 1px solid rgba(156, 163, 175, 0.3);
  color: white;
  backdrop-filter: blur(4px);
}
```

### Form Elements
```css
/* Input Fields */
.input-field {
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid rgb(75, 85, 99);
  border-radius: 0.75rem;
  color: white;
  padding: 0.75rem 1rem;
  backdrop-filter: blur(4px);
}

.input-field:focus {
  border-color: #ec4899;
  box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.2);
}

/* Labels */
.input-label {
  color: #f9a8d4;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}
```

## Animation System

### PULSE Pattern Background
```css
.pulse-pattern {
  position: relative;
  overflow: hidden;
}

.pulse-pattern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, 
              rgba(236, 72, 153, 0.1) 0%, 
              transparent 50%);
  animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.1; }
}
```

### Floating Animations
```css
@keyframes float-up-1 {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes float-up-2 {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

.animate-float-up-1 {
  animation: float-up-1 3s ease-in-out infinite;
}
```

### Transition Standards
```css
/* Standard transitions */
.transition-standard {
  transition: all 0.3s ease;
}

.transition-fast {
  transition: all 0.15s ease;
}

.transition-slow {
  transition: all 0.5s ease;
}
```

## Responsive Design

### Mobile-First Approach
All components start with mobile styles and enhance for larger screens:

```css
/* Mobile (default) */
.component {
  padding: 1rem;
  grid-template-columns: 1fr;
}

/* Tablet */
@media (min-width: 640px) {
  .component {
    padding: 1.5rem;
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .component {
    padding: 2rem;
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Touch Targets
Minimum touch target sizes for mobile devices:
- **Buttons**: 44px minimum height
- **Form Fields**: 48px minimum height
- **Navigation Items**: 44px minimum height
- **Icon Buttons**: 40px minimum

## Status Indicators

### Badge System
```css
.badge-approved {
  background: rgba(16, 185, 129, 0.1);
  color: rgb(16, 185, 129);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-pending {
  background: rgba(245, 158, 11, 0.1);
  color: rgb(245, 158, 11);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-rejected {
  background: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
  border: 1px solid rgba(239, 68, 68, 0.3);
}
```

## Loading States

### Skeleton Loaders
```css
.skeleton {
  background: linear-gradient(90deg, 
              rgba(31, 41, 55, 0.4) 25%, 
              rgba(75, 85, 99, 0.4) 50%, 
              rgba(31, 41, 55, 0.4) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Loading Spinners
```css
.spinner {
  border: 2px solid rgba(236, 72, 153, 0.2);
  border-top: 2px solid #ec4899;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## Accessibility Features

### Focus Management
```css
.focus-visible {
  outline: 2px solid #ec4899;
  outline-offset: 2px;
}

/* Remove outline for mouse users */
.focus:not(.focus-visible) {
  outline: none;
}
```

### High Contrast Support
```css
@media (prefers-contrast: high) {
  .card-base {
    border-color: #ffffff;
    background: #000000;
  }
  
  .text-muted {
    color: #ffffff;
  }
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  .pulse-pattern::before {
    animation: none;
  }
  
  .animate-float-up-1 {
    animation: none;
  }
}
```

## Performance Optimization

### CSS Delivery
- **Critical CSS**: Inline critical styles for above-the-fold content
- **Async Loading**: Non-critical CSS loaded asynchronously
- **Tree Shaking**: Unused Tailwind classes removed in production
- **Compression**: CSS minified and gzipped

### Animation Performance
- **GPU Acceleration**: Animations use transform and opacity
- **Will-Change**: Proper will-change declarations for complex animations
- **RequestAnimationFrame**: Smooth animations using proper timing
- **Reduced Motion**: Respect user preferences for reduced motion

---

**Last Updated**: August 2025  
**Design System Version**: 1.0.0  
**Accessibility Level**: WCAG 2.1 AA
