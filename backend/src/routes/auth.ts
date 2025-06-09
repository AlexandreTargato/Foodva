import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import authService from '../services/authService';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = Router();

router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const user = await authService.getCurrentUser(userId);
    res.json({ data: user });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const profileData = req.body;
    
    const updatedUser = await authService.updateUserProfile(userId, profileData);
    res.json({ data: updatedUser });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const profileData = req.body;
    
    const newUser = await authService.createUserProfile(userId, profileData);
    res.status(201).json({ data: newUser });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;