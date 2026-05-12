import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';

const commentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

const commentInclude = {
  author: { select: { id: true, name: true, avatarUrl: true } },
  replies: {
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      replies: {
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
};

export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  const post = await prisma.post.findUnique({ where: { slug: req.params.slug } });
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  // Top-level comments only (parentId is null), replies are nested
  const comments = await prisma.comment.findMany({
    where: { postId: post.id, parentId: null },
    include: commentInclude,
    orderBy: { createdAt: 'asc' },
  });

  res.json(comments);
};

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const post = await prisma.post.findUnique({ where: { slug: req.params.slug } });
  if (!post || post.status !== 'PUBLISHED') {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  const data = commentSchema.parse(req.body);

  if (data.parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: data.parentId } });
    if (!parent || parent.postId !== post.id) {
      res.status(400).json({ error: 'Invalid parent comment' });
      return;
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content: data.content,
      postId: post.id,
      authorId: req.user!.id,
      parentId: data.parentId || null,
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  res.status(201).json(comment);
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }

  if (comment.authorId !== req.user!.id && req.user!.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  await prisma.comment.delete({ where: { id: comment.id } });
  res.status(204).send();
};
