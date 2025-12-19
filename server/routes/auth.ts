import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { CustomError } from '../middleware/errorHandler';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Validation middleware
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new CustomError('Validation failed', 400));
  }
  next();
};

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('username').optional().isAlphanumeric(),
], handleValidationErrors, asyncHandler(async (req: any, res: any) => {
  const { email, password, firstName, lastName, username } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        ...(username ? [{ username }] : [])
      ]
    }
  });

  if (existingUser) {
    throw new CustomError('User already exists', 400);
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      username,
      emailVerified: new Date(),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      username: true,
      role: true,
      createdAt: true,
    }
  });

  // Generate token
  const token = generateToken(user);

  logger.info('User registered successfully', { userId: user.id, email });

  res.status(201).json({
    success: true,
    data: { user, token },
  });
}));

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], handleValidationErrors, asyncHandler(async (req: any, res: any) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      username: true,
      role: true,
      status: true,
    }
  });

  if (!user || user.status !== 'ACTIVE') {
    throw new CustomError('Invalid credentials', 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password!);
  if (!isPasswordValid) {
    throw new CustomError('Invalid credentials', 401);
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  // Generate token
  const token = generateToken(user);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  logger.info('User logged in successfully', { userId: user.id, email });

  res.json({
    success: true,
    data: { user: userWithoutPassword, token },
  });
}));

// Get current user
router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res: any) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      username: true,
      avatar: true,
      phone: true,
      role: true,
      status: true,
      emailVerified: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  res.json({
    success: true,
    data: { user },
  });
}));

// Update profile
router.put('/profile', authenticate, [
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('username').optional().isAlphanumeric(),
  body('phone').optional().isString(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { firstName, lastName, username, phone } = req.body;

  // Check if username is taken by another user
  if (username) {
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        NOT: { id: req.user!.id }
      }
    });

    if (existingUser) {
      throw new CustomError('Username already taken', 400);
    }
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      firstName,
      lastName,
      username,
      phone,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      username: true,
      avatar: true,
      phone: true,
      role: true,
      status: true,
      updatedAt: true,
    }
  });

  logger.info('User profile updated', { userId: req.user!.id });

  res.json({
    success: true,
    data: { user },
  });
}));

// Change password
router.put('/password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { password: true }
  });

  if (!user?.password) {
    throw new CustomError('User not found or no password set', 400);
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new CustomError('Current password is incorrect', 400);
  }

  // Hash new password
  const saltRounds = 12;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { password: hashedNewPassword }
  });

  logger.info('Password changed successfully', { userId: req.user!.id });

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
}));

// Logout (client-side token removal, but we can track it)
router.post('/logout', authenticate, asyncHandler(async (req: AuthRequest, res: any) => {
  logger.info('User logged out', { userId: req.user!.id });
  
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}));

export default router;
