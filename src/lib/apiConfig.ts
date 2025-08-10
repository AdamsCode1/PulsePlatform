// API configuration for frontend requests
// Use a single relative base in all environments:
// - In development, Vite proxies /api -> http://localhost:4000
// - In production, serverless functions or backend also live under /api
export const API_BASE_URL = '/api';

if (import.meta.env.DEV) {
  console.log('Frontend API config:');
  console.log('Environment:', 'development');
  console.log('API Base URL:', API_BASE_URL);
}
