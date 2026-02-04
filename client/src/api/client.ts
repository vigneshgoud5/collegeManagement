import axios from 'axios';

// Determine API base URL
// In production (Vercel), use relative URL if VITE_API_BASE_URL is not set
// This works because frontend and backend are on the same domain
const getBaseURL = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  // If explicitly set, use it
  if (envUrl) {
    return envUrl;
  }
  
  // In production (Vercel), use relative URL
  // This works because /api/* routes are handled by serverless function
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  // In development, use localhost
  return 'http://localhost:3000/api';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

// Log API base URL in development for debugging
if (import.meta.env.DEV) {
  console.log('API Base URL:', api.defaults.baseURL);
}


