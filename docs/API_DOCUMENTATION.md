# 📡 API Documentation

## Overview

DUPulse uses Supabase as its backend-as-a-service, providing a PostgreSQL database with real-time capabilities, authentication, and storage. This document outlines the API structure, database schema, and integration patterns.

## Database Schema

### Authentication
User authentication is handled entirely by Supabase Auth. User profiles are stored in the `auth.users` table with additional metadata.

```sql
-- User metadata structure (stored in auth.users.user_metadata)
{
  "full_name": "John Doe",
  "user_type": "student|society|partner|admin",
  "first_name": "John",
  "business_name": "Example Corp" // For partners only
}
```

### Core Tables

#### Societies Table
```sql
CREATE TABLE societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  email TEXT UNIQUE NOT NULL,
  website TEXT,
  contact_person TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Events Table
```sql
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
  partner_id UUID, -- For partner-submitted events
  created_by UUID NOT NULL, -- Reference to auth.users
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### RSVPs Table
```sql
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Reference to auth.users
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);
```

#### Deals Table (Future Implementation)
```sql
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage INTEGER,
  discount_amount DECIMAL(10,2),
  partner_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  valid_from DATE,
  valid_until DATE,
  terms_conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Row Level Security (RLS)

### Policies Implementation

#### Societies Policies
```sql
-- Societies can view and edit their own records
CREATE POLICY "Societies can manage their own data" ON societies
  FOR ALL USING (auth.email() = email);

-- Anyone can view society information for events
CREATE POLICY "Anyone can view societies" ON societies
  FOR SELECT USING (true);
```

#### Events Policies
```sql
-- Anyone can view approved events
CREATE POLICY "Anyone can view approved events" ON events
  FOR SELECT USING (status = 'approved');

-- Societies can manage their own events
CREATE POLICY "Societies can manage their events" ON events
  FOR ALL USING (
    society_id IN (
      SELECT id FROM societies WHERE email = auth.email()
    )
  );

-- Partners can manage their own events
CREATE POLICY "Partners can manage their events" ON events
  FOR ALL USING (created_by = auth.uid());

-- Admins can manage all events
CREATE POLICY "Admins can manage all events" ON events
  FOR ALL USING (
    auth.jwt() ->> 'user_metadata' ->> 'user_type' = 'admin'
  );
```

#### RSVPs Policies
```sql
-- Users can only manage their own RSVPs
CREATE POLICY "Users can manage their own RSVPs" ON rsvps
  FOR ALL USING (auth.uid() = user_id);

-- Event organizers can view RSVPs for their events
CREATE POLICY "Organizers can view event RSVPs" ON rsvps
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events 
      WHERE society_id IN (
        SELECT id FROM societies WHERE email = auth.email()
      ) OR created_by = auth.uid()
    )
  );
```

## API Endpoints & Usage

### Authentication APIs

#### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@durham.ac.uk',
  password: 'securePassword123',
  options: {
    data: {
      full_name: 'John Doe',
      user_type: 'student', // student|society|partner|admin
      first_name: 'John'
    }
  }
});
```

#### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@durham.ac.uk',
  password: 'securePassword123'
});
```

#### Get Current User
```typescript
const { data: { user }, error } = await supabase.auth.getUser();
```

#### Sign Out
```typescript
const { error } = await supabase.auth.signOut();
```

### Events API

#### Fetch All Approved Events
```typescript
const { data, error } = await supabase
  .from('events')
  .select(`
    *,
    society:societies(name),
    rsvps:rsvps(count())
  `)
  .eq('status', 'approved')
  .gte('date', new Date().toISOString().split('T')[0])
  .order('date', { ascending: true });
```

#### Fetch Events with Filters
```typescript
const { data, error } = await supabase
  .from('events')
  .select(`
    *,
    society:societies(name, id),
    rsvps:rsvps(count())
  `)
  .eq('status', 'approved')
  .gte('date', startDate)
  .lte('date', endDate)
  .ilike('title', `%${searchTerm}%`)
  .order('date', { ascending: true })
  .range(offset, offset + limit - 1);
```

#### Create New Event
```typescript
const { data, error } = await supabase
  .from('events')
  .insert([{
    title: 'Annual Tech Talk',
    description: 'Learn about the latest in technology',
    date: '2025-09-15',
    time: '18:00',
    location: 'Main Lecture Hall',
    max_attendees: 100,
    society_id: societyId,
    created_by: user.id
  }])
  .select();
```

#### Update Event
```typescript
const { data, error } = await supabase
  .from('events')
  .update({
    title: 'Updated Event Title',
    description: 'Updated description',
    max_attendees: 150
  })
  .eq('id', eventId)
  .select();
```

#### Delete Event
```typescript
const { error } = await supabase
  .from('events')
  .delete()
  .eq('id', eventId);
```

### Society Management

#### Fetch Society Profile
```typescript
const { data, error } = await supabase
  .from('societies')
  .select('*')
  .eq('email', userEmail)
  .single();
```

#### Create Society Record
```typescript
const { data, error } = await supabase
  .from('societies')
  .insert([{
    name: 'Durham Tech Society',
    description: 'Technology enthusiasts at Durham',
    email: 'tech@durham.ac.uk',
    website: 'https://durhamtech.com',
    contact_person: 'Jane Smith'
  }])
  .select();
```

#### Fetch Society Events
```typescript
const { data, error } = await supabase
  .from('events')
  .select(`
    *,
    rsvps:rsvps(count())
  `)
  .eq('society_id', societyId)
  .order('date', { ascending: false });
```

### RSVP Management

#### Create RSVP
```typescript
const { data, error } = await supabase
  .from('rsvps')
  .insert([{
    user_id: userId,
    event_id: eventId,
    status: 'confirmed'
  }])
  .select();
```

#### Fetch User RSVPs
```typescript
const { data, error } = await supabase
  .from('rsvps')
  .select(`
    *,
    event:events(
      *,
      society:societies(name)
    )
  `)
  .eq('user_id', userId)
  .eq('status', 'confirmed')
  .order('created_at', { ascending: false });
```

#### Cancel RSVP
```typescript
const { error } = await supabase
  .from('rsvps')
  .delete()
  .eq('user_id', userId)
  .eq('event_id', eventId);
```

#### Update RSVP Status
```typescript
const { data, error } = await supabase
  .from('rsvps')
  .update({ status: 'cancelled' })
  .eq('user_id', userId)
  .eq('event_id', eventId);
```

### Admin APIs

#### Moderate Events
```typescript
// Approve event
const { data, error } = await supabase
  .from('events')
  .update({ status: 'approved' })
  .eq('id', eventId);

// Reject event
const { data, error } = await supabase
  .from('events')
  .update({ status: 'rejected' })
  .eq('id', eventId);
```

#### Fetch All Events for Moderation
```typescript
const { data, error } = await supabase
  .from('events')
  .select(`
    *,
    society:societies(name),
    rsvps:rsvps(count())
  `)
  .in('status', ['pending', 'approved', 'rejected'])
  .order('created_at', { ascending: false });
```

## Real-time Subscriptions

### Listen to Event Changes
```typescript
const eventSubscription = supabase
  .channel('events')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'events'
  }, (payload) => {
    console.log('Event change:', payload);
    // Update UI accordingly
  })
  .subscribe();
```

### Listen to RSVP Changes
```typescript
const rsvpSubscription = supabase
  .channel('rsvps')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'rsvps'
  }, (payload) => {
    console.log('New RSVP:', payload);
    // Update RSVP counts in real-time
  })
  .subscribe();
```

### Cleanup Subscriptions
```typescript
// Unsubscribe when component unmounts
useEffect(() => {
  return () => {
    supabase.removeChannel(eventSubscription);
    supabase.removeChannel(rsvpSubscription);
  };
}, []);
```

## File Storage

### Upload Event Images
```typescript
const uploadEventImage = async (file: File, eventId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${eventId}.${fileExt}`;
  const filePath = `event-images/${fileName}`;

  const { data, error } = await supabase.storage
    .from('event-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('event-images')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};
```

### Delete Images
```typescript
const deleteEventImage = async (filePath: string) => {
  const { error } = await supabase.storage
    .from('event-images')
    .remove([filePath]);

  if (error) throw error;
};
```

## Error Handling

### Common Error Patterns
```typescript
const handleSupabaseError = (error: any) => {
  switch (error.code) {
    case 'PGRST116':
      return 'No records found';
    case '23505':
      return 'This record already exists';
    case '23503':
      return 'Referenced record does not exist';
    case 'PGRST301':
      return 'Invalid input data';
    default:
      return error.message || 'An unexpected error occurred';
  }
};
```

### API Response Wrapper
```typescript
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

const apiWrapper = async <T>(
  operation: () => Promise<{ data: T; error: any }>
): Promise<ApiResponse<T>> => {
  try {
    const { data, error } = await operation();
    
    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error),
        success: false
      };
    }

    return {
      data,
      error: null,
      success: true
    };
  } catch (err) {
    return {
      data: null,
      error: 'Network error occurred',
      success: false
    };
  }
};
```

## Performance Optimization

### Query Optimization
```typescript
// Use select() to limit returned columns
const { data } = await supabase
  .from('events')
  .select('id, title, date, location') // Only fetch needed columns
  .eq('status', 'approved');

// Use range() for pagination
const { data } = await supabase
  .from('events')
  .select('*')
  .range(0, 9) // First 10 records
  .order('date', { ascending: true });
```

### Caching Strategy
```typescript
// Simple cache implementation
const cache = new Map();

const getCachedEvents = async (cacheKey: string) => {
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'approved');

  if (!error) {
    cache.set(cacheKey, data);
    // Clear cache after 5 minutes
    setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
  }

  return data;
};
```

## Security Best Practices

### Input Validation
```typescript
import { z } from 'zod';

const eventSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  date: z.string().refine(date => !isNaN(Date.parse(date))),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  location: z.string().min(1).max(200),
  max_attendees: z.number().min(1).max(10000)
});

const validateEvent = (eventData: unknown) => {
  return eventSchema.safeParse(eventData);
};
```

### Rate Limiting
```typescript
// Client-side rate limiting implementation
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}

const apiLimiter = new RateLimiter(60, 60000); // 60 requests per minute
```

---

**Last Updated**: August 2025  
**API Version**: 1.0.0  
**Database**: PostgreSQL 15 via Supabase
