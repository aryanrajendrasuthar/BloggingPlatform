import { redis, CACHE_TTL } from '../config/redis';

const isConnected = () => redis.status === 'ready';

export const incrementPostView = async (postId: string): Promise<number> => {
  if (!isConnected()) return 0;
  return redis.incr(`post:views:${postId}`);
};

export const getPostViewCount = async (postId: string): Promise<number> => {
  if (!isConnected()) return 0;
  const val = await redis.get(`post:views:${postId}`);
  return val ? parseInt(val, 10) : 0;
};

export const cachePopularPosts = async (posts: unknown[]): Promise<void> => {
  if (!isConnected()) return;
  await redis.setex('popular:posts', CACHE_TTL.POPULAR_POSTS, JSON.stringify(posts));
};

export const getCachedPopularPosts = async (): Promise<unknown[] | null> => {
  if (!isConnected()) return null;
  const cached = await redis.get('popular:posts');
  return cached ? JSON.parse(cached) : null;
};

export const invalidatePopularPostsCache = async (): Promise<void> => {
  if (!isConnected()) return;
  await redis.del('popular:posts');
};
