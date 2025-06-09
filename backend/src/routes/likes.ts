import { Router, Request, Response } from 'express';
import { authenticate, optionalAuth } from '../middleware/authMiddleware';
import likesService from '../services/likesService';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();

router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { post_id } = req.body;
    
    if (!post_id) {
      return res.status(400).json({ error: 'Post ID is required' });
    }
    
    const like = await likesService.likePost(userId, post_id);
    res.status(201).json({ data: like });
  } catch (error) {
    if ((error as Error).message === 'Post already liked') {
      return res.status(409).json({ error: (error as Error).message });
    }
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { post_id } = req.body;
    
    if (!post_id) {
      return res.status(400).json({ error: 'Post ID is required' });
    }
    
    const unlike = await likesService.unlikePost(userId, post_id);
    res.json({ data: unlike });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/status/:postId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;
    
    const isLiked = await likesService.getLikeStatus(userId, postId);
    res.json({ data: { is_liked: isLiked } });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:postId', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const likes = await likesService.getPostLikes(postId, limit, offset);
    res.json({ data: likes });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/user/:userId', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const userLikes = await likesService.getUserLikes(userId, limit, offset);
    res.json({ data: userLikes });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;