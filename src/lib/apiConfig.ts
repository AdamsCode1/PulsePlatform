// API configuration for frontend requests
const isProduction = window.location.hostname !== 'localhost';

// In production, API routes are serverless functions at /api
// In development, API server runs on different port
export const API_BASE_URL = isProduction 
  ? '/api'  // Serverless functions on same domain
  : import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

console.log('Frontend API config:');
console.log('Environment:', isProduction ? 'production' : 'development');
console.log('API Base URL:', API_BASE_URL);
