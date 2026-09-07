import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

const createAlertSchema = z.object({
  symbol: z.string().min(1),
  companyName: z.string().min(1),
  alertType: z.enum(['PRICE_TARGET', 'PERCENT_CHANGE', 'SENTIMENT_TREND']),
  condition: z.enum(['ABOVE', 'BELOW', 'PERCENT_UP', 'PERCENT_DOWN']),
  targetPrice: z.number().positive().optional(),
  referencePrice: z.number().positive().optional(),
  percentChange: z.number().positive().optional(),
}).refine((data) => {
  if (data.alertType === 'PRICE_TARGET') {
    return data.condition === 'ABOVE' || data.condition === 'BELOW';
  }
  if (data.alertType === 'PERCENT_CHANGE') {
    return data.condition === 'PERCENT_UP' || data.condition === 'PERCENT_DOWN';
  }
  if (data.alertType === 'SENTIMENT_TREND') {
    return data.condition === 'BELOW';
  }
  return false;
}, { message: 'Invalid condition for alert type' }).refine((data) => {
  if (data.alertType === 'PRICE_TARGET') return data.targetPrice !== undefined;
  if (data.alertType === 'PERCENT_CHANGE') return data.referencePrice !== undefined && data.percentChange !== undefined;
  if (data.alertType === 'SENTIMENT_TREND') return data.percentChange !== undefined;
  return false;
}, { message: 'Missing required fields for alert type' });

router.use(authenticateToken);

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const alerts = await prisma.priceAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Failed to fetch alerts' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const parsed = createAlertSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0].message });
      return;
    }
    const alert = await prisma.priceAlert.create({
      data: { ...parsed.data, userId },
    });
    res.json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Failed to create alert' });
  }
});

router.post('/:id/simulate', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const id = req.params.id as string;
    const alert = await prisma.priceAlert.findFirst({ where: { id, userId } });
    if (!alert) {
      res.status(404).json({ success: false, error: 'Alert not found' });
      return;
    }
    await prisma.priceAlert.update({
      where: { id },
      data: { isTriggered: true, triggeredAt: new Date() },
    });
    res.json({ success: true, data: { message: 'Alert simulated' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Simulation failed' });
  }
});

router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const id = req.params.id as string;
    const alert = await prisma.priceAlert.findFirst({ where: { id, userId } });
    if (!alert) {
      res.status(404).json({ success: false, error: 'Alert not found' });
      return;
    }
    await prisma.priceAlert.update({
      where: { id },
      data: { notifiedAt: new Date() },
    });
    res.json({ success: true, data: { message: 'Alert marked as read' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Failed to update alert' });
  }
});

router.put('/read-all', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    await prisma.priceAlert.updateMany({
      where: { userId, isTriggered: true, notifiedAt: null },
      data: { notifiedAt: new Date() },
    });
    res.json({ success: true, data: { message: 'All alerts marked as read' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Failed to update alerts' });
  }
});

router.put('/:id/reactivate', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const id = req.params.id as string;
    const alert = await prisma.priceAlert.findFirst({ where: { id, userId } });
    if (!alert) {
      res.status(404).json({ success: false, error: 'Alert not found' });
      return;
    }
    await prisma.priceAlert.update({
      where: { id },
      data: { isActive: true, isTriggered: false, triggeredAt: null, notifiedAt: null },
    });
    res.json({ success: true, data: { message: 'Alert reactivated' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Failed to reactivate alert' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const id = req.params.id as string;
    await prisma.priceAlert.deleteMany({ where: { id, userId } });
    res.json({ success: true, data: { message: 'Alert deleted' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Failed to delete alert' });
  }
});

export default router;