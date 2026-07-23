import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();
const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number'),
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      res.status(409).json({ success: false, error: 'Email already registered' });
      return;
    }

    const hashedPassword = await hashPassword(validatedData.password);

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      },
      select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
    });

    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({ success: true, data: { user, token } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: validatedData.email } });

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const isValidPassword = await verifyPassword(validatedData.password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({ success: true, data: { user } });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.put('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validated = updateProfileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: validated,
      select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
    });
    res.json({ success: true, data: { user } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.put('/password', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validated = changePasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    const isValid = await verifyPassword(validated.oldPassword, user.password);
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Invalid old password' });
      return;
    }
    const hashed = await hashPassword(validated.newPassword);
    await prisma.user.update({ where: { id: req.user!.userId }, data: { password: hashed } });
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.delete('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.user!.userId } });
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;