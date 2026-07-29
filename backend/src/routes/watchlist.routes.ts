import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();
const prisma = new PrismaClient();

const addSchema = z.object({
  symbol: z.string().min(1).max(20),
  companyName: z.string().min(1).max(200),
});

router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await prisma.watchlist.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: items });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load watchlist' });
  }
});

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validated = addSchema.parse(req.body);
    const item = await prisma.watchlist.create({
      data: {
        userId: req.user!.userId,
        symbol: validated.symbol.toUpperCase(),
        companyName: validated.companyName,
      },
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation failed' });
      return;
    }
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      res.status(409).json({ success: false, error: 'Stock already in watchlist' });
      return;
    }
    res.status(500).json({ success: false, error: 'Failed to add to watchlist' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.watchlist.deleteMany({
      where: { id, userId: req.user!.userId },
    });
    res.json({ success: true, message: 'Removed from watchlist' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to remove from watchlist' });
  }
});

export default router;