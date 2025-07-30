#!/bin/bash

# Quick fix for CORS deployment issue

echo "🔧 Quick Fix for CORS Deployment Issue"
echo "======================================"
echo ""

echo "The issue: Your frontend (https://www.dupulse.co.uk) is trying to access localhost:4000"
echo "The solution: Deploy backend and update frontend environment variables"
echo ""

echo "Step 1: Deploy Backend API"
echo "-------------------------"
echo "Run this command to deploy your backend:"
echo "  npm run deploy:api"
echo ""
echo "or manually:"
echo "  vercel --config vercel-api.json --prod"
echo ""

echo "Step 2: Update Frontend Environment"
echo "----------------------------------"
echo "1. Go to Vercel dashboard → Your frontend project → Settings → Environment Variables"
echo "2. Update or add: VITE_API_BASE_URL = [YOUR_API_DEPLOYMENT_URL]"
echo "3. Example: VITE_API_BASE_URL = https://your-api-abc123.vercel.app"
echo ""

echo "Step 3: Redeploy Frontend"
echo "------------------------"
echo "  npm run deploy:frontend"
echo ""

echo "⚠️  CURRENT ISSUE:"
echo "   Frontend: https://www.dupulse.co.uk ✅ (deployed)"
echo "   Backend:  http://localhost:4000 ❌ (not deployed)"
echo ""
echo "✅ AFTER FIX:"
echo "   Frontend: https://www.dupulse.co.uk ✅ (deployed)"
echo "   Backend:  https://your-api.vercel.app ✅ (deployed)"
echo ""

echo "Need help? Check DEPLOYMENT.md for detailed instructions."
