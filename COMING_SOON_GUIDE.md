# 🚀 PulsePlatform Coming Soon Mode

## Overview
The platform now shows a "Coming Soon" landing page to public visitors while allowing developers full access to the platform for continued development.

## 🔓 Developer Access Methods

### **Method 1: URL Parameters (Recommended for Testing)**
- Add `?dev=true` to any URL: `https://yoursite.com?dev=true`
- Add `?access=dev` to any URL: `https://yoursite.com?access=dev`

### **Method 2: Special Routes**
- Visit `/platform` instead of `/`: `https://yoursite.com/platform`
- Visit `/dev` instead of `/`: `https://yoursite.com/dev`

### **Method 3: Secret Key Combination**
- On the coming soon page, press `Ctrl+Shift+D`
- Enter password: `pulse2025dev`
- This enables persistent dev mode (stored in localStorage)

### **Method 4: Development Environments**
- Localhost automatically bypasses: `http://localhost:3000`
- Dev subdomains: `https://dev.yoursite.com` or `https://app.yoursite.com`

### **Method 5: Persistent Dev Mode**
Once enabled via secret key, dev mode persists until:
- localStorage is cleared
- User manually disables it

## 🛠 Development Workflow

### **Local Development**
```bash
# Regular development - no changes needed
npm run dev
# Automatically shows full platform on localhost
```

### **Testing Coming Soon Page Locally**
```bash
# To test the coming soon page in development:
# 1. Start the dev server
npm run dev

# 2. Visit without dev parameters:
# http://127.0.0.1:3000 (instead of localhost)
# This will show the coming soon page
```

### **Testing Production Behavior**
```bash
# Deploy and test with dev access:
vercel --prod

# Test coming soon page:
https://your-deployment.vercel.app

# Test dev access:
https://your-deployment.vercel.app?dev=true
https://your-deployment.vercel.app/platform
```

## 📊 Coming Soon Features

### **Early Access Signups**
- **API Endpoint**: `/api/unified/early-access`
- **Database Table**: `early_access_signups`
- **Features**: Email collection, user type selection, referral system

### **Signup Analytics**
```javascript
// Get signup stats
GET /api/unified/early-access
// Returns: total signups, today's signups, user breakdown
```

### **Referral System**
- Each signup gets a unique referral code
- Users can refer others for VIP perks
- Tracks referral success

## 🚨 Important Notes for Developers

### **No Disruption to Workflow**
- ✅ All existing routes work with dev access
- ✅ All API endpoints remain functional
- ✅ All authentication flows unchanged
- ✅ All dashboards accessible
- ✅ Database operations unaffected

### **What Changes**
- ❗ Public visitors see coming soon page
- ❗ Root `/` route shows coming soon (unless dev access)
- ❗ New table `early_access_signups` added

### **Safe Development Practices**
```bash
# Always use dev access for testing
# Method 1: URL parameter
https://your-site.com?dev=true

# Method 2: Special route
https://your-site.com/platform

# Method 3: Dev subdomain (if configured)
https://dev.your-site.com
```

## 🎯 Launch Day Process

### **When Ready to Launch**
1. **Remove DevAccessDetector wrapper** from `App.tsx`
2. **Delete coming soon components** (optional)
3. **Keep early access data** for user migration
4. **Deploy normally**

### **Quick Launch Toggle**
```tsx
// In src/App.tsx - comment out this line for instant launch:
<DevAccessDetector comingSoonPage={<ComingSoonPage />}>

// Becomes:
{/* <DevAccessDetector comingSoonPage={<ComingSoonPage />}> */}
  <Routes>
    {/* All your routes */}
  </Routes>
{/* </DevAccessDetector> */}
```

## 🔧 Customization

### **Change Launch Date**
```tsx
// In ComingSoonPage.tsx
<CountdownTimer launchDate="2025-09-15T09:00:00" />
```

### **Update Secret Password**
```tsx
// In DevAccessDetector.tsx
if (devPassword === 'your-new-password') {
```

### **Modify Dev Access Methods**
Edit the `checkDevAccess()` function in `DevAccessDetector.tsx`

## 📋 Database Schema

### **Early Access Signups Table**
```sql
CREATE TABLE early_access_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  user_type TEXT CHECK (user_type IN ('student', 'society', 'partner')),
  signup_date TIMESTAMP DEFAULT NOW(),
  referral_code TEXT UNIQUE,
  referred_by TEXT REFERENCES early_access_signups(referral_code),
  launched BOOLEAN DEFAULT FALSE,
  created_account BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb
);
```

## 🎨 Coming Soon Page Sections

1. **Countdown Timer** - Dynamic countdown to launch date
2. **Feature Preview** - Showcase platform capabilities
3. **Early Access Signup** - Email collection with user type
4. **Development Progress** - Build transparency
5. **Community Stats** - Growth metrics

## 🚀 Ready to Launch!

Your development workflow remains exactly the same. The coming soon page builds hype while you continue developing. When ready to launch, simply remove the DevAccessDetector wrapper and deploy!
