import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { getQuote } from '../services/finnhub.service.js';

const router = Router();
const prisma = new PrismaClient();

const createSchema = z.object({
  name: z.string().min(1).max(100),
});

const buySchema = z.object({
  symbol: z.string().min(1).max(20),
  companyName: z.string().min(1).max(200),
  shares: z.coerce.number().int().positive(),
});

const sellSchema = z.object({
  symbol: z.string().min(1).max(20),
  shares: z.coerce.number().int().positive(),
});

router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const portfolios = await prisma.portfolio.findMany({
      where: { userId: req.user!.userId },
      include: {
        items: {
          select: { symbol: true, shares: true, avgCost: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = await Promise.all(
      portfolios.map(async (portfolio) => {
        let totalValue = 0;
        let totalCost = 0;

        await Promise.all(
          portfolio.items.map(async (item) => {
            try {
              const quote = await getQuote(item.symbol);
              const currentPrice = quote.c;
              const marketValue = currentPrice * item.shares;
              const costBasis = Number(item.avgCost) * item.shares;
              totalValue += marketValue;
              totalCost += costBasis;
            } catch {}
          })
        );

        return {
          ...portfolio,
          totalValue,
          totalCost,
          totalPnl: totalValue - totalCost,
          totalPnlPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
        };
      })
    );

    res.json({ success: true, data: enriched });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load portfolios' });
  }
});

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validated = createSchema.parse(req.body);
    const portfolio = await prisma.portfolio.create({
      data: {
        userId: req.user!.userId,
        name: validated.name,
      },
    });
    res.status(201).json({ success: true, data: portfolio });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation failed' });
      return;
    }
    res.status(500).json({ success: false, error: 'Failed to create portfolio' });
  }
});

router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const portfolio = await prisma.portfolio.findFirst({
      where: { id, userId: req.user!.userId },
      include: { items: true },
    });

    if (!portfolio) {
      res.status(404).json({ success: false, error: 'Portfolio not found' });
      return;
    }

    const itemsWithQuotes = await Promise.all(
      portfolio.items.map(async (item) => {
        try {
          const quote = await getQuote(item.symbol);
          const currentPrice = quote.c;
          const marketValue = currentPrice * item.shares;
          const costBasis = Number(item.avgCost) * item.shares;
          const pnl = marketValue - costBasis;
          const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

          return {
            ...item,
            currentPrice,
            marketValue,
            costBasis,
            pnl,
            pnlPercent,
          };
        } catch {
          return {
            ...item,
            currentPrice: null,
            marketValue: null,
            costBasis: Number(item.avgCost) * item.shares,
            pnl: null,
            pnlPercent: null,
          };
        }
      })
    );

    const totalValue = itemsWithQuotes.reduce((sum, item) => sum + (item.marketValue || 0), 0);
    const totalCost = itemsWithQuotes.reduce((sum, item) => sum + item.costBasis, 0);
    const totalPnl = totalValue - totalCost;

    res.json({
      success: true,
      data: {
        ...portfolio,
        items: itemsWithQuotes,
        totalValue,
        totalCost,
        totalPnl,
        totalPnlPercent: totalCost > 0 ? (totalPnl / totalCost) * 100 : 0,
      },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load portfolio' });
  }
});

router.get('/:id/transactions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const portfolio = await prisma.portfolio.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!portfolio) {
      res.status(404).json({ success: false, error: 'Portfolio not found' });
      return;
    }

    const transactions = await prisma.transaction.findMany({
      where: { portfolioId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: transactions });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load transactions' });
  }
});

router.post('/:id/buy', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const validated = buySchema.parse(req.body);
    const symbol = validated.symbol.toUpperCase();

    const portfolio = await prisma.portfolio.findFirst({
      where: { id, userId: req.user!.userId },
      include: { items: true },
    });

    if (!portfolio) {
      res.status(404).json({ success: false, error: 'Portfolio not found' });
      return;
    }

    const quote = await getQuote(symbol);
    const currentPrice = quote.c;

    const result = await prisma.$transaction(async (tx) => {
      const existingItem = await tx.portfolioItem.findFirst({
        where: { portfolioId: id, symbol },
      });

      let updatedItem;

      if (existingItem) {
        const oldShares = existingItem.shares;
        const oldAvgCost = Number(existingItem.avgCost);
        const newShares = validated.shares;
        const newTotalShares = oldShares + newShares;
        const newAvgCost = ((oldShares * oldAvgCost) + (newShares * currentPrice)) / newTotalShares;

        updatedItem = await tx.portfolioItem.update({
          where: { id: existingItem.id },
          data: {
            shares: newTotalShares,
            avgCost: newAvgCost,
          },
        });
      } else {
        updatedItem = await tx.portfolioItem.create({
          data: {
            portfolioId: id,
            symbol,
            companyName: validated.companyName,
            shares: validated.shares,
            avgCost: currentPrice,
          },
        });
      }

      await tx.transaction.create({
        data: {
          portfolioId: id,
          type: 'BUY',
          symbol,
          companyName: validated.companyName,
          shares: validated.shares,
          price: currentPrice,
          totalAmount: currentPrice * validated.shares,
          remainingShares: validated.shares,
        },
      });

      return updatedItem;
    });

    res.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation failed' });
      return;
    }
    res.status(500).json({ success: false, error: 'Failed to execute buy order' });
  }
});

router.post('/:id/sell', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const validated = sellSchema.parse(req.body);
    const symbol = validated.symbol.toUpperCase();

    const portfolio = await prisma.portfolio.findFirst({
      where: { id, userId: req.user!.userId },
      include: { items: true },
    });

    if (!portfolio) {
      res.status(404).json({ success: false, error: 'Portfolio not found' });
      return;
    }

    const item = portfolio.items.find((i) => i.symbol === symbol);

    if (!item) {
      res.status(400).json({ success: false, error: 'You do not own this stock' });
      return;
    }

    if (item.shares < validated.shares) {
      res.status(400).json({ success: false, error: 'Insufficient shares' });
      return;
    }

    const quote = await getQuote(symbol);
    const sellPrice = quote.c;

    const result = await prisma.$transaction(async (tx) => {
      const buyLots = await tx.transaction.findMany({
        where: {
          portfolioId: id,
          symbol,
          type: 'BUY',
          remainingShares: { gt: 0 },
        },
        orderBy: { createdAt: 'asc' },
      });

      let sharesToSell = validated.shares;
      let totalCostBasis = 0;

      for (const lot of buyLots) {
        if (sharesToSell <= 0) break;
        const takeFromLot = Math.min(lot.remainingShares!, sharesToSell);
        totalCostBasis += takeFromLot * Number(lot.price);
        sharesToSell -= takeFromLot;

        await tx.transaction.update({
          where: { id: lot.id },
          data: { remainingShares: lot.remainingShares! - takeFromLot },
        });
      }

      if (sharesToSell > 0) {
        totalCostBasis += sharesToSell * Number(item.avgCost);
      }

      const realizedPnl = (sellPrice * validated.shares) - totalCostBasis;

      if (item.shares === validated.shares) {
        await tx.portfolioItem.delete({ where: { id: item.id } });
      } else {
        await tx.portfolioItem.update({
          where: { id: item.id },
          data: { shares: item.shares - validated.shares },
        });
      }

      await tx.transaction.create({
        data: {
          portfolioId: id,
          type: 'SELL',
          symbol,
          companyName: item.companyName,
          shares: validated.shares,
          price: sellPrice,
          totalAmount: sellPrice * validated.shares,
          realizedPnl,
        },
      });

      return realizedPnl;
    });

    res.json({ success: true, realizedPnl: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation failed' });
      return;
    }
    res.status(500).json({ success: false, error: 'Failed to execute sell order' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.portfolio.deleteMany({
      where: { id, userId: req.user!.userId },
    });
    res.json({ success: true, message: 'Portfolio deleted' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to delete portfolio' });
  }
});

export default router;