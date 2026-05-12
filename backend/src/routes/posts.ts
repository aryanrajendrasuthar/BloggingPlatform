import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPostBySlug,
  updatePost,
  deletePost,
  getAuthorPosts,
  getPopularPosts,
} from '../controllers/postController';
import { getComments, createComment, deleteComment } from '../controllers/commentController';
import { authenticate, requireAuthor, optionalAuth } from '../middleware/auth';

const router = Router();

// Public
router.get('/', getPosts);
router.get('/popular', getPopularPosts);
router.get('/my', authenticate, requireAuthor, getAuthorPosts);
router.get('/:slug', optionalAuth, getPostBySlug);

// Authenticated
router.post('/', authenticate, requireAuthor, createPost);
router.patch('/:id', authenticate, requireAuthor, updatePost);
router.delete('/:id', authenticate, requireAuthor, deletePost);

// Comments
router.get('/:slug/comments', getComments);
router.post('/:slug/comments', authenticate, createComment);
router.delete('/comments/:id', authenticate, deleteComment);

export default router;
