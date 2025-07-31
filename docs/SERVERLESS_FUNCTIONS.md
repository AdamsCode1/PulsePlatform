# Vercel Serverless Functions Implementation

## Architecture Overview

This project now uses **Vercel-compatible serverless functions** instead of trying to wrap the Express app. Each API endpoint is implemented as a separate serverless function that follows Vercel's requirements.

## File Structure

```
api/
├── _utils.ts              # Shared utilities (CORS, handler creation)
├── _supabase.ts          # Supabase client configuration
├── _requireAdmin.ts      # Admin authentication middleware
├── index.ts              # Root API handler (/api)
├── events.ts             # Base events endpoints (/api/events)
├── societies.ts          # Base societies endpoints (/api/societies)
├── users.ts              # Base users endpoints (/api/users)
├── rsvps.ts              # Base RSVPs endpoints (/api/rsvps)
├── login.ts              # Authentication endpoint (/api/login)
├── events/
│   ├── [id].ts          # Individual event operations (/api/events/[id])
│   ├── pending.ts       # Pending events (/api/events/pending)
│   ├── by-date.ts       # Events grouped by date (/api/events/by-date)
│   ├── society/
│   │   └── [societyId].ts # Society events (/api/events/society/[id])
│   └── [id]/
│       ├── approve.ts   # Approve event (/api/events/[id]/approve)
│       └── reject.ts    # Reject event (/api/events/[id]/reject)
├── societies/
│   └── [id].ts          # Individual society operations (/api/societies/[id])
├── users/
│   └── [id].ts          # Individual user operations (/api/users/[id])
└── rsvps/
    └── [id].ts          # Individual RSVP operations (/api/rsvps/[id])
```

## API Endpoints

### Events
- `GET /api/events` - List all approved events (supports ?status=all, ?society_id=...)
- `POST /api/events` - Create new event
- `GET /api/events/[id]` - Get specific event
- `PATCH /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event
- `GET /api/events/pending` - List pending events (admin only)
- `POST /api/events/[id]/approve` - Approve event (admin only)
- `POST /api/events/[id]/reject` - Reject event (admin only)
- `GET /api/events/by-date` - Events grouped by date
- `GET /api/events/society/[societyId]` - Events for specific society

### Societies
- `GET /api/societies` - List all societies
- `POST /api/societies` - Create new society
- `GET /api/societies/[id]` - Get specific society
- `PUT /api/societies/[id]` - Update society
- `DELETE /api/societies/[id]` - Delete society

### Users
- `GET /api/users` - List all users (supports ?user_type=...)
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get specific user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### RSVPs
- `GET /api/rsvps` - List RSVPs (supports ?user_id=..., ?event_id=...)
- `POST /api/rsvps` - Create new RSVP
- `GET /api/rsvps/[id]` - Get specific RSVP
- `DELETE /api/rsvps/[id]` - Delete RSVP

### Authentication
- `POST /api/login` - Authenticate user with email/password

## Key Features

### 1. Proper CORS Handling
All functions include comprehensive CORS configuration supporting:
- Development (localhost:3000, localhost:8080, localhost:8081)
- Production (dupulse.co.uk, www.dupulse.co.uk)

### 2. Admin Middleware
The `_requireAdmin.ts` module handles admin-only endpoints by:
- Validating JWT tokens from Authorization header
- Checking user email against ADMIN_EMAILS environment variable
- Returning proper error responses for unauthorized access

### 3. Supabase Integration
- Service role key for backend operations with RLS bypass
- Schema support for multi-tenant setups
- Proper error handling and logging

### 4. Type Safety
All functions use TypeScript with proper interface definitions matching the Supabase schema.

### 5. Validation
Comprehensive input validation for all endpoints including:
- Required field validation
- Email format validation
- Date format validation (ISO 8601)
- Business logic validation (start_time < end_time)

## Environment Variables Required

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key  # Fallback for auth middleware
SUPABASE_SCHEMA=public  # Optional, defaults to 'public'
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

## Frontend Integration

The frontend automatically detects the environment:
- **Development**: Uses `http://localhost:4000/api` (Express server)
- **Production**: Uses `/api` (Vercel serverless functions)

## Deployment

This architecture supports unified deployment where:
1. Frontend builds to `dist/` directory
2. Serverless functions are deployed automatically to `/api/*` routes
3. All requests to `/api/*` are handled by serverless functions
4. All other requests serve the React app

## Benefits

✅ **No Express wrapper complexity** - Each function is independently optimized  
✅ **Vercel-native implementation** - Follows Vercel best practices  
✅ **Automatic scaling** - Each endpoint scales independently  
✅ **Better error isolation** - Issues in one endpoint don't affect others  
✅ **Type safety** - Full TypeScript support throughout  
✅ **Development compatibility** - Works with existing Express server in dev mode
