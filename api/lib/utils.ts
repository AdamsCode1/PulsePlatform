import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', 
    'http://localhost:8080', 
    'http://localhost:8081',
    'https://www.dupulse.co.uk',
    'https://dupulse.co.uk'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Helper to handle CORS for Vercel functions
export const handleCors = (req: VercelRequest, res: VercelResponse): Promise<void> => {
  return new Promise((resolve, reject) => {
    cors(corsOptions)(req as any, res as any, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// Helper to handle different HTTP methods
export const createHandler = (handlers: { [method: string]: (req: VercelRequest, res: VercelResponse) => Promise<void | VercelResponse> }) => {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      // Handle CORS
      await handleCors(req, res);
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }

      const method = req.method?.toUpperCase() || 'GET';
      const handler = handlers[method];
      
      if (!handler) {
        res.status(405).json({ message: `Method ${method} not allowed` });
        return;
      }

      await handler(req, res);
    } catch (error: any) {
      console.error('Handler error:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  };
};

// Helper to parse query parameters
export const parseQuery = (req: VercelRequest) => {
  const { query } = req;
  return query;
};

// Helper to get path parameters from Vercel dynamic routes
export const getPathParams = (req: VercelRequest) => {
  return req.query;
};
