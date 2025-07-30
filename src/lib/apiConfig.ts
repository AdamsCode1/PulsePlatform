// API configuration for frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:4000');

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

export default {
  baseUrl: API_BASE_URL,
  events: `${API_BASE_URL}/api/events`,
  users: `${API_BASE_URL}/api/users`,
  societies: `${API_BASE_URL}/api/societies`,
  rsvps: `${API_BASE_URL}/api/rsvps`,
};
