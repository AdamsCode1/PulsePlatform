# Server to API Migration Guide

## What Changed

The project has been restructured to move from an Express.js server (`/server`) to Vercel serverless functions (`/api`) for better deployment and scalability.

## Key Changes

### 1. Server Routes → Vercel API Routes
- `server/routes/events.ts` → `api/events.ts`
- `server/routes/users.ts` → `api/users.ts` 
- `server/routes/societies.ts` → `api/societies.ts`
- `server/routes/rsvps.ts` → `api/rsvps.ts`
- `server/routes/auth.ts` → `api/auth.ts`
- `server/routes/admin.ts` → `api/admin/*.ts` (already existed)

### 2. Shared Libraries
- `server/lib/supabase.ts` functionality moved to `api/_supabase.ts`
- `server/lib/requireAdmin.ts` functionality moved to `api/_requireAdmin.ts`

### 3. Development Workflow
- **Before**: `npm run server` to start Express server on port 4000
- **After**: `npm run dev:vercel` to start Vercel dev server, or `npm run dev:full` for both frontend and API

### 4. API Configuration
- Removed Vite proxy configuration
- API calls now go directly to `/api/*` routes handled by Vercel functions

## Development Setup

1. **Install dependencies** (including new `concurrently`):
   ```bash
   npm install
   ```

2. **For full development** (frontend + API):
   ```bash
   npm run dev:full
   ```

3. **For frontend only**:
   ```bash
   npm run dev
   ```

4. **For API functions only**:
   ```bash
   npm run dev:vercel
   ```

## Deployment

- **Production**: Same as before - Vercel handles both frontend and API routes
- **API functions** are automatically deployed as serverless functions
- **Frontend** is deployed as static files with SPA routing

## Files That Can Be Removed

Once you've verified everything works:
- `/server/` directory (entire folder)
- Any references to `server/index.ts` in scripts or documentation
- Express-related dependencies if not used elsewhere

## Testing the Migration

1. Start the dev server: `npm run dev:vercel`
2. Test API endpoints:
   - `GET /api/events` - Should return events
   - `GET /api/users` - Should return users  
   - `GET /api/societies` - Should return societies
   - Admin endpoints should work with proper authentication

## Rollback Plan

If issues arise, you can temporarily:
1. Revert the package.json scripts
2. Restore the Vite proxy configuration
3. Use the old server setup until issues are resolved

The old `/server` files are preserved until you're confident in the migration.
