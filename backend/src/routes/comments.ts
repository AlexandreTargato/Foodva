import { Router, Request, Response } from 'express';
import { authenticate, optionalAuth } from '../middleware/authMiddleware';
import commentsService from '../services/commentsService';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();

router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { post_id, content } = req.body;
    
    if (!post_id || !content) {
      return res.status(400).json({ error: 'Post ID and content are required' });
    }
    
    const comment = await commentsService.createComment(userId, post_id, content);
    res.status(201).json({ data: comment });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:postId', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const comments = await commentsService.getCommentsByPost(postId, limit, offset);
    res.json({ data: comments });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:commentId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const updatedComment = await commentsService.updateComment(commentId, userId, content);
    res.json({ data: updatedComment });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/:commentId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;
    
    const deletedComment = await commentsService.deleteComment(commentId, userId);
    res.json({ data: deletedComment });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;