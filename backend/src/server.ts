import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { prisma } from './config/database';
import { redis } from './config/redis';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import taxonomyRoutes from './routes/taxonomy';
import uploadRoutes from './routes/upload';
import feedRoutes from './routes/feed';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true });
app.use('/api', limiter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api', taxonomyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', feedRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL connected via Prisma');

    await redis.connect();

    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});
