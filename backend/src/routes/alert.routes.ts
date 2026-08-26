import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();
const prisma = new PrismaClient();

const createSchema = z.object({
  symbol: z.string().min(1).max(20),
  companyName: z.string().min(1).max(200),
  alertType: z.enum(['PRICE_TARGET', 'PERCENT_CHANGE']),
  condition: z.enum(['ABOVE', 'BELOW', 'PERCENT_UP', 'PERCENT_DOWN']),
  targetPrice: z.coerce.number().positive().optional(),
  referencePrice: z.coerce.number().positive().optional(),
  percentChange: z.coerce.number().positive().optional(),
}).refine((data) => {
  if (data.alertType === 'PRICE_TARGET') {
    return data.targetPrice !== undefined && ['ABOVE', 'BELOW'].includes(data.condition);
  }
  if (data.alertType === 'PERCENT_CHANGE') {
    return data.referencePrice !== undefined && data.percentChange !== undefined && ['PERCENT_UP', 'PERCENT_DOWN'].includes(data.condition);
  }
  return false;
}, { message: 'Invalid alert configuration' });

router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const alerts = await prisma.priceAlert.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: alerts });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load alerts' });
  }
});

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  console.log('[Alert] Body:', req.body);
  try {
    const validated = createSchema.parse(req.body);
    const alert = await prisma.priceAlert.create({
      data: {
        userId: req.user!.userId,
        symbol: validated.symbol.toUpperCase(),
        companyName: validated.companyName,
        alertType: validated.alertType,
        condition: validated.condition,
        targetPrice: validated.targetPrice,
        referencePrice: validated.referencePrice,
        percentChange: validated.percentChange,
      },
    });
    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    console.error('[Alert] Error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation failed' });
      return;
    }
    res.status(500).json({ success: false, error: 'Failed to create alert' });
  }
});

router.post('/:id/simulate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const alert = await prisma.priceAlert.findFirst({
      where: { id, userId: req.user!.userId },
    });
    if (!alert) {
      res.status(404).json({ success: false, error: 'Alert not found' });
      return;
    }
    await prisma.priceAlert.update({
      where: { id },
      data: { isTriggered: true, triggeredAt: new Date() },
    });
    res.json({ success: true, message: 'Alert simulated' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to simulate alert' });
  }
});

router.put('/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.priceAlert.updateMany({
      where: { id, userId: req.user!.userId, isTriggered: true },
      data: { notifiedAt: new Date() },
    });
    res.json({ success: true, message: 'Marked as read' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to mark as read' });
  }
});

router.put('/read-all', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.priceAlert.updateMany({
      where: { userId: req.user!.userId, isTriggered: true, notifiedAt: null },
      data: { notifiedAt: new Date() },
    });
    res.json({ success: true, message: 'All alerts marked as read' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to mark all as read' });
  }
});

router.put('/:id/reactivate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const schema = z.object({
      targetPrice: z.coerce.number().positive().optional(),
      referencePrice: z.coerce.number().positive().optional(),
      percentChange: z.coerce.number().positive().optional(),
    });
    const validated = schema.parse(req.body);
    const result = await prisma.priceAlert.updateMany({
      where: { id, userId: req.user!.userId },
      data: {
        isTriggered: false,
        triggeredAt: null,
        notifiedAt: null,
        ...(validated.targetPrice !== undefined && { targetPrice: validated.targetPrice }),
        ...(validated.referencePrice !== undefined && { referencePrice: validated.referencePrice }),
        ...(validated.percentChange !== undefined && { percentChange: validated.percentChange }),
      },
    });
    if (result.count === 0) {
      res.status(404).json({ success: false, error: 'Alert not found' });
      return;
    }
    res.json({ success: true, message: 'Alert reactivated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation failed' });
      return;
    }
    res.status(500).json({ success: false, error: 'Failed to reactivate alert' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.priceAlert.deleteMany({
      where: { id, userId: req.user!.userId },
    });
    res.json({ success: true, message: 'Alert deleted' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to delete alert' });
  }
});

export default router;