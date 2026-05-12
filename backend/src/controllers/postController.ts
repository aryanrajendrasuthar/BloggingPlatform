import { Request, Response } from 'express';
import { z } from 'zod';
import slugify from 'slugify';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { incrementPostView, invalidatePopularPostsCache } from '../services/redisService';

const postSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  excerpt: z.string().max(500).optional(),
  coverImageUrl: z.string().url().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional().default('DRAFT'),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  readingTime: z.number().int().min(0).optional(),
});

const generateUniqueSlug = async (title: string, excludeId?: string): Promise<string> => {
  const base = slugify(title, { lower: true, strict: true });
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${counter++}`;
  }
  return slug;
};

const postInclude = {
  author: { select: { id: true, name: true, email: true, avatarUrl: true, bio: true } },
  category: true,
  tags: true,
  _count: { select: { comments: true } },
};

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = postSchema.parse(req.body);
  const slug = await generateUniqueSlug(data.title);

  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt,
      coverImageUrl: data.coverImageUrl,
      status: data.status,
      categoryId: data.categoryId || null,
      readingTime: data.readingTime || Math.ceil(data.content.split(' ').length / 200),
      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      authorId: req.user!.id,
      tags: {
        connectOrCreate: data.tags.map((tagName) => ({
          where: { slug: slugify(tagName, { lower: true, strict: true }) },
          create: {
            name: tagName,
            slug: slugify(tagName, { lower: true, strict: true }),
          },
        })),
      },
    },
    include: postInclude,
  });

  await invalidatePopularPostsCache();
  res.status(201).json(post);
};

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  const { page = '1', limit = '10', category, tag, status, author, search } = req.query;
  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(50, parseInt(limit as string, 10));
  const skip = (pageNum - 1) * limitNum;

  const where: Record<string, unknown> = {};

  // Public endpoint only shows published unless authenticated author requests own posts
  if (status) {
    where.status = status;
  } else {
    where.status = 'PUBLISHED';
  }

  if (category) where.category = { slug: category };
  if (tag) where.tags = { some: { slug: tag } };
  if (author) where.authorId = author;
  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { excerpt: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: postInclude,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.post.count({ where }),
  ]);

  res.json({
    posts,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

export const getPostBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
  const post = await prisma.post.findUnique({
    where: { slug: req.params.slug },
    include: postInclude,
  });

  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  // Only author or admin can view non-published posts
  if (post.status !== 'PUBLISHED') {
    if (!req.user || (req.user.id !== post.authorId && req.user.role !== 'ADMIN')) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
  }

  // Increment view count in Redis; sync to DB periodically (here we just increment Redis)
  const views = await incrementPostView(post.id);

  res.json({ ...post, viewCount: Math.max(post.viewCount, views) });
};

export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  if (post.authorId !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const data = postSchema.partial().parse(req.body);
  const slug = data.title ? await generateUniqueSlug(data.title, post.id) : post.slug;

  const updated = await prisma.post.update({
    where: { id: post.id },
    data: {
      ...data,
      slug,
      publishedAt:
        data.status === 'PUBLISHED' && !post.publishedAt ? new Date() : post.publishedAt,
      tags: data.tags
        ? {
            set: [],
            connectOrCreate: data.tags.map((tagName) => ({
              where: { slug: slugify(tagName, { lower: true, strict: true }) },
              create: {
                name: tagName,
                slug: slugify(tagName, { lower: true, strict: true }),
              },
            })),
          }
        : undefined,
    },
    include: postInclude,
  });

  await invalidatePopularPostsCache();
  res.json(updated);
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  if (post.authorId !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  await prisma.post.delete({ where: { id: post.id } });
  await invalidatePopularPostsCache();
  res.status(204).send();
};

export const getAuthorPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.query;
  const where: Record<string, unknown> = { authorId: req.user!.id };
  if (status) where.status = status;

  const posts = await prisma.post.findMany({
    where,
    include: postInclude,
    orderBy: { createdAt: 'desc' },
  });

  res.json(posts);
};

export const getPopularPosts = async (_req: Request, res: Response): Promise<void> => {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    include: postInclude,
    orderBy: [{ viewCount: 'desc' }, { publishedAt: 'desc' }],
    take: 6,
  });
  res.json(posts);
};
