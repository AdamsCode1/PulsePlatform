// index.ts
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import apiRouter from './routes/api';
import cors from 'cors';

// Load .env.local in development if present, else default .env
const envLocal = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal });
} else {
  dotenv.config();
}

const app = express();

app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:8080', 
    'http://localhost:8081',
    'https://www.dupulse.co.uk',
    'https://dupulse.co.uk'
  ],
  credentials: true
}));

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the API server!');
});

// All API routes
app.use('/api', apiRouter);

export default app;

// Only start the server if not in test mode and not in Vercel environment
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Express API server is running on port ${PORT}`);
  });
}

