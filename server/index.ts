// index.ts
import 'dotenv/config';
import express from 'express';
import apiRouter from './routes/api';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:8081'], // Allow multiple frontend ports
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
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Express API server is running on port ${PORT}`);
  });
}

