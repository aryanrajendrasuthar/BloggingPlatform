import { Router } from 'express';
import {
  getCategories,
  createCategory,
  deleteCategory,
  getTags,
  getTagBySlug,
} from '../controllers/taxonomyController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/categories', getCategories);
router.post('/categories', authenticate, requireAdmin, createCategory);
router.delete('/categories/:id', authenticate, requireAdmin, deleteCategory);

router.get('/tags', getTags);
router.get('/tags/:slug', getTagBySlug);

export default router;
