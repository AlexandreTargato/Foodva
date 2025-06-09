import { Router, Request, Response } from 'express';
import { authenticate, optionalAuth } from '../middleware/authMiddleware';
import postsService from '../services/postsService';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();

router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const postData = req.body;
    
    const newPost = await postsService.createPost(userId, postData);
    res.status(201).json({ data: newPost });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/feed', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const posts = await postsService.getFeed(limit, offset, userId);
    res.json({ data: posts });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:postId', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;
    
    const post = await postsService.getPostById(postId, userId);
    res.json({ data: post });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/:postId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;
    
    const deletedPost = await postsService.deletePost(postId, userId);
    res.json({ data: deletedPost });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;