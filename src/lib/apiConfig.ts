// API configuration for frontend requests
// For Vercel development and production, API routes are available at /api
export const API_BASE_URL = '/api';

if (import.meta.env.DEV) {
  console.log('Frontend API config:');
  console.log('Environment:', 'development');
  console.log('API Base URL:', API_BASE_URL);
  console.log('Note: Make sure to run "vercel dev" for local API functions');
}
