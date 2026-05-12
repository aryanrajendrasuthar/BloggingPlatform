import { redis, CACHE_TTL } from '../config/redis';

export const incrementPostView = async (postId: string): Promise<number> => {
  const key = `post:views:${postId}`;
  return redis.incr(key);
};

export const getPostViewCount = async (postId: string): Promise<number> => {
  const val = await redis.get(`post:views:${postId}`);
  return val ? parseInt(val, 10) : 0;
};

export const cachePopularPosts = async (posts: unknown[]): Promise<void> => {
  await redis.setex('popular:posts', CACHE_TTL.POPULAR_POSTS, JSON.stringify(posts));
};

export const getCachedPopularPosts = async (): Promise<unknown[] | null> => {
  const cached = await redis.get('popular:posts');
  return cached ? JSON.parse(cached) : null;
};

export const invalidatePopularPostsCache = async (): Promise<void> => {
  await redis.del('popular:posts');
};
