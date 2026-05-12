import { Request, Response } from 'express';
import { z } from 'zod';
import slugify from 'slugify';
import { prisma } from '../config/database';

// ── CATEGORIES ──────────────────────────────────────────────────────────────

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(categories);
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(300).optional(),
  });
  const data = schema.parse(req.body);
  const slug = slugify(data.name, { lower: true, strict: true });

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    res.status(409).json({ error: 'Category already exists' });
    return;
  }

  const category = await prisma.category.create({ data: { ...data, slug } });
  res.status(201).json(category);
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.status(204).send();
};

// ── TAGS ────────────────────────────────────────────────────────────────────

export const getTags = async (_req: Request, res: Response): Promise<void> => {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(tags);
};

export const getTagBySlug = async (req: Request, res: Response): Promise<void> => {
  const tag = await prisma.tag.findUnique({
    where: { slug: req.params.slug },
    include: {
      posts: {
        where: { status: 'PUBLISHED' },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          category: true,
          tags: true,
          _count: { select: { comments: true } },
        },
        orderBy: { publishedAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!tag) {
    res.status(404).json({ error: 'Tag not found' });
    return;
  }
  res.json(tag);
};
