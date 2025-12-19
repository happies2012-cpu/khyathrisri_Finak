import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();


// Validation middleware
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new CustomError('Validation failed', 400));
  }
  next();
};

// Get all users (admin only)
router.get('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('role').optional().isIn(['USER', 'ADMIN', 'SUPER_ADMIN']),
  query('status').optional().isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED']),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const role = req.query.role as string;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { username: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (status) {
    where.status = status;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            hostingAccounts: true,
            domains: true,
            orders: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}));

// Get user by ID
router.get('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      avatar: true,
      phone: true,
      role: true,
      status: true,
      emailVerified: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      hostingAccounts: {
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          plan: true,
          price: true,
          createdAt: true,
        }
      },
      domains: {
        select: {
          id: true,
          name: true,
          status: true,
          expiryDate: true,
          registeredAt: true,
        }
      },
      orders: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      activityLogs: {
        select: {
          id: true,
          action: true,
          resource: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user },
  });
}));

// Update user (admin only)
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), [
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('username').optional().isAlphanumeric(),
  body('phone').optional().isString(),
  body('role').optional().isIn(['USER', 'ADMIN', 'SUPER_ADMIN']),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED']),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { firstName, lastName, username, phone, role, status } = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    throw new CustomError('User not found', 404);
  }

  // Check if username is taken by another user
  if (username && username !== existingUser.username) {
    const usernameTaken = await prisma.user.findFirst({
      where: { username, NOT: { id } }
    });

    if (usernameTaken) {
      throw new CustomError('Username already taken', 400);
    }
  }

  // Prevent super admin from changing their own role or status
  if (existingUser.role === 'SUPER_ADMIN' && req.user!.id === id) {
    if (role || status) {
      throw new CustomError('Cannot modify super admin role or status', 403);
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      firstName,
      lastName,
      username,
      phone,
      role,
      status,
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      avatar: true,
      phone: true,
      role: true,
      status: true,
      updatedAt: true,
    }
  });

  logger.info('User updated by admin', {
    targetUserId: id,
    adminId: req.user!.id,
    changes: { firstName, lastName, username, phone, role, status }
  });

  res.json({
    success: true,
    data: { user },
  });
}));

// Delete user (admin only)
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (id === req.user!.id) {
    throw new CustomError('Cannot delete your own account', 403);
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new CustomError('User not found', 404);
  }

  // Delete user (cascade will handle related records)
  await prisma.user.delete({ where: { id } });

  logger.warn('User deleted by super admin', {
    targetUserId: id,
    adminId: req.user!.id,
    targetUserEmail: user.email
  });

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
}));

// Get user statistics (admin only)
router.get('/stats/overview', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(async (req: AuthRequest, res: any) => {
  const [
    totalUsers,
    activeUsers,
    newUsersThisMonth,
    usersByRole,
    usersByStatus,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.user.groupBy({
      by: ['role'],
      _count: true,
    }),
    prisma.user.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      usersByRole,
      usersByStatus,
    },
  });
}));

export default router;
