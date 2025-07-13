// index.ts
import 'dotenv/config';
import express from 'express';
import apiRouter from './routes/api';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Allow Next.js frontend
  credentials: true
}));

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the API server!');
});

// All API routes
app.use('/api', apiRouter);

export default app;

// Only start the server if not in test mode
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Express API server is running on port ${PORT}`);
  });
}

