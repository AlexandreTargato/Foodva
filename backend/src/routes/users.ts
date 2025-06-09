import { Router, Request, Response } from 'express';
import { authenticate, optionalAuth } from '../middleware/authMiddleware';
import usersService from '../services/usersService';
import postsService from '../services/postsService';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();

router.get('/:userId', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    const [user, stats] = await Promise.all([
      usersService.getUserProfile(userId),
      usersService.getUserStats(userId)
    ]);
    
    res.json({ data: { ...user, ...stats } });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:userId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;
    
    if (userId !== currentUserId) {
      return res.status(403).json({ error: 'Cannot update another user\'s profile' });
    }
    
    const profileData = req.body;
    const updatedUser = await usersService.updateUserProfile(userId, profileData);
    res.json({ data: updatedUser });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:userId/posts', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const posts = await postsService.getUserPosts(userId, limit, offset);
    res.json({ data: posts });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/search', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 20;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const users = await usersService.searchUsers(query, limit);
    res.json({ data: users });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:userId/follow', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const followerId = req.user?.id;
    
    if (userId === followerId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    
    const follow = await usersService.followUser(followerId, userId);
    res.status(201).json({ data: follow });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/:userId/follow', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const followerId = req.user?.id;
    
    const unfollow = await usersService.unfollowUser(followerId, userId);
    res.json({ data: unfollow });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:userId/follow-status', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const followerId = req.user?.id;
    
    const isFollowing = await usersService.checkFollowStatus(followerId, userId);
    res.json({ data: { is_following: isFollowing } });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;