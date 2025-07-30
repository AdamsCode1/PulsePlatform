# Unified Frontend + Backend Deployment

## What This Setup Does

✅ **Single Project Deployment** - Both frontend and backend deploy together  
✅ **Vercel Serverless Functions** - Backend runs as serverless API routes  
✅ **Frontend Build** - Vite builds the React frontend to `dist/`  
✅ **API Routing** - `/api/*` routes to backend, everything else to frontend  

## File Structure

```
PulsePlatform/
├── src/                    # Frontend React code
├── server/                 # Backend Express code
├── api/
│   └── index.js           # Vercel serverless wrapper
├── dist/                   # Built frontend (auto-generated)
├── vercel.json            # Unified deployment config
└── package.json           # All dependencies
```

## How It Works

1. **Build Process:**
   - `npm run build` → Builds frontend with Vite
   - Vercel creates serverless function from `api/index.js`

2. **Runtime:**
   - Frontend: Served from `dist/` 
   - Backend: `api/index.js` wraps `server/index.ts`
   - Routes: `/api/*` → backend, `/*` → frontend

3. **Development:**
   - `npm run dev` → Frontend on port 8080
   - `npm run server` → Backend on port 4000
   - Frontend calls `localhost:4000` in dev mode

## Configuration

### vercel.json
- Builds frontend with Vite
- Creates serverless function for API
- Routes API calls to backend, others to frontend

### api/index.js
- Wraps Express app as Vercel serverless function
- Dynamically imports TypeScript server code

### src/lib/apiConfig.ts
- Uses relative paths in production (same domain)
- Uses localhost:4000 in development

## Environment Variables

Set in Vercel dashboard:
```
SUPABASE_URL=https://tbarboxknpkirrpqdiks.supabase.co
SUPABASE_ANON_KEY=[your_key]
SUPABASE_SERVICE_ROLE_KEY=[your_key]
SUPABASE_SCHEMA=public
ADMIN_EMAILS=admin@dupulse.com
NODE_ENV=production
```

## Deployment

```bash
git add .
git commit -m "Unified frontend/backend deployment"
git push
```

Vercel auto-deploys both frontend and backend together! 🚀

## Result

- **URL:** `https://www.dupulse.co.uk`
- **Frontend:** React app served from root
- **API:** Available at `https://www.dupulse.co.uk/api/societies` etc.
- **No CORS issues** - Same domain deployment
