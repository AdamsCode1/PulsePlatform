import { VercelRequest, VercelResponse } from '@vercel/node';
import { createHandler } from './_utils';

// Root API handler - provides API information
const handleGetRoot = async (req: VercelRequest, res: VercelResponse) => {
  res.status(200).json({
    message: 'Welcome to the PulsePlatform API!',
    version: '1.0.0',
    endpoints: {
      events: '/api/events',
      societies: '/api/societies',
      users: '/api/users',
      rsvps: '/api/rsvps',
      login: '/api/login'
    },
    documentation: 'https://github.com/AdamsCode1/PulsePlatform'
  });
};

// Main handler
export default createHandler({
  GET: handleGetRoot
});
