#!/bin/bash

# Deployment guide for PulsePlatform with GitHub + Vercel auto-deployment

echo "🚀 PulsePlatform Deployment Guide"
echo "================================="
echo ""

echo "Since you're using GitHub + Vercel auto-deployment:"
echo ""

echo "📡 Backend Deployment Setup:"
echo "----------------------------"
echo "1. Create a new Vercel project for your backend:"
echo "   - Go to vercel.com/new"
echo "   - Import this same GitHub repository"
echo "   - Set Root Directory to: server/"
echo "   - Framework Preset: Other"
echo "   - Build Command: npm run build (or leave empty)"
echo "   - Output Directory: (leave empty)"
echo ""

echo "2. Set Environment Variables in Backend Vercel Project:"
echo "   SUPABASE_URL=https://tbarboxknpkirrpqdiks.supabase.co"
echo "   SUPABASE_ANON_KEY=[your_anon_key]"
echo "   SUPABASE_SERVICE_ROLE_KEY=[your_service_role_key]"
echo "   SUPABASE_SCHEMA=public"
echo "   ADMIN_EMAILS=admin@dupulse.com"
echo "   NODE_ENV=production"
echo ""

echo "🌐 Frontend Environment Update:"
echo "-------------------------------"
echo "3. Update Frontend Vercel Project Environment Variables:"
echo "   VITE_API_BASE_URL=[your_backend_vercel_url]"
echo "   Example: https://pulse-platform-api.vercel.app"
echo ""

echo "🔄 Auto-Deployment:"
echo "-------------------"
echo "4. Push changes to GitHub - both projects will auto-deploy!"
echo ""

echo "⚠️  Alternative: Use Vercel's API Routes"
echo "========================================="
echo "Instead of separate backend deployment, you could move API to api/ folder"
echo "for Vercel's serverless functions. Run './setup-vercel-api.sh' for this option."
