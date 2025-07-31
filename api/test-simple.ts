import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Simple test endpoint hit');
  
  try {
    // Basic CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    return res.status(200).json({ 
      message: 'Simple test endpoint working', 
      method: req.method,
      query: req.query 
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({ 
      error: 'Test endpoint failed',
      details: error?.message || 'Unknown error'
    });
  }
}
