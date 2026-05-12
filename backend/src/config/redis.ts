import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log('Redis connected');
});

export const CACHE_TTL = {
  POPULAR_POSTS: 300,   // 5 minutes
  POST_VIEWS: 0,        // no expiry for view counters
  SEARCH_RESULTS: 300,
};
