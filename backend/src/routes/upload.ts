import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireAuthor } from '../middleware/auth';
import { uploadToS3 } from '../services/s3Service';

const router = Router();

router.post(
  '/image',
  authenticate,
  requireAuthor,
  (req: Request, res: Response, next: NextFunction) => {
    const upload = uploadToS3.single('image');
    upload(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      next();
    });
  },
  (req: Request, res: Response) => {
    const file = (req as any).file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    res.json({ url: (file as any).location });
  }
);

export default router;
