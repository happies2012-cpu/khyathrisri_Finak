import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';
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

// Get user's hosting accounts
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['VPS', 'SHARED', 'CLOUD', 'WORDPRESS', 'DEDICATED']),
  query('status').optional().isIn(['PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED']),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const type = req.query.type as string;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;

  const where: any = { userId: req.user!.id };

  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  const [accounts, total] = await Promise.all([
    prisma.hostingAccount.findMany({
      where,
      skip,
      take: limit,
      include: {
        domains: {
          select: {
            id: true,
            name: true,
            status: true,
            expiryDate: true,
          }
        },
        _count: {
          select: {
            domains: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.hostingAccount.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      accounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}));

// Get hosting account by ID
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;

  const account = await prisma.hostingAccount.findFirst({
    where: { 
      id,
      userId: req.user!.id,
    },
    include: {
      domains: {
        orderBy: { registeredAt: 'desc' },
      },
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        }
      }
    },
  });

  if (!account) {
    throw new CustomError('Hosting account not found', 404);
  }

  res.json({
    success: true,
    data: { account },
  });
}));

// Create hosting account
router.post('/', authenticate, [
  body('name').notEmpty().isString(),
  body('type').isIn(['VPS', 'SHARED', 'CLOUD', 'WORDPRESS', 'DEDICATED']),
  body('plan').notEmpty().isString(),
  body('price').isFloat({ min: 0 }),
  body('billingCycle').isIn(['MONTHLY', 'YEARLY', 'QUARTERLY']),
  body('domain').optional().isString(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { name, type, plan, price, billingCycle, domain } = req.body;

  // Create hosting account
  const account = await prisma.hostingAccount.create({
    data: {
      userId: req.user!.id,
      name,
      type,
      plan,
      price,
      billingCycle,
      domain,
      status: 'PENDING', // Will be updated by provisioning system
    },
    include: {
      domains: true,
    }
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'CREATE_HOSTING_ACCOUNT',
      resource: 'HostingAccount',
      details: {
        accountId: account.id,
        name,
        type,
        plan,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('Hosting account created', { 
    accountId: account.id, 
    userId: req.user!.id,
    type,
    plan 
  });

  res.status(201).json({
    success: true,
    data: { account },
  });
}));

// Update hosting account
router.put('/:id', authenticate, [
  body('name').optional().isString(),
  body('status').optional().isIn(['PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED']),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { name, status } = req.body;

  const account = await prisma.hostingAccount.findFirst({
    where: { 
      id,
      userId: req.user!.id,
    },
  });

  if (!account) {
    throw new CustomError('Hosting account not found', 404);
  }

  const updatedAccount = await prisma.hostingAccount.update({
    where: { id },
    data: {
      name,
      status,
    },
    include: {
      domains: true,
    }
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'UPDATE_HOSTING_ACCOUNT',
      resource: 'HostingAccount',
      details: {
        accountId: id,
        changes: { name, status },
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('Hosting account updated', { 
    accountId: id, 
    userId: req.user!.id,
    changes: { name, status }
  });

  res.json({
    success: true,
    data: { account: updatedAccount },
  });
}));

// Delete hosting account
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;

  const account = await prisma.hostingAccount.findFirst({
    where: { 
      id,
      userId: req.user!.id,
    },
  });

  if (!account) {
    throw new CustomError('Hosting account not found', 404);
  }

  // Check if account has active domains
  const activeDomains = await prisma.domain.count({
    where: {
      hostingAccountId: id,
      status: 'ACTIVE',
    }
  });

  if (activeDomains > 0) {
    throw new CustomError('Cannot delete hosting account with active domains', 400);
  }

  await prisma.hostingAccount.delete({ where: { id } });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'DELETE_HOSTING_ACCOUNT',
      resource: 'HostingAccount',
      details: {
        accountId: id,
        name: account.name,
        type: account.type,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.warn('Hosting account deleted', { 
    accountId: id, 
    userId: req.user!.id,
    accountName: account.name
  });

  res.json({
    success: true,
    message: 'Hosting account deleted successfully',
  });
}));

// Get hosting statistics
router.get('/stats/overview', authenticate, asyncHandler(async (req: AuthRequest, res: any) => {
  const [
    totalAccounts,
    activeAccounts,
    accountsByType,
    accountsByStatus,
    totalMonthlyCost,
  ] = await Promise.all([
    prisma.hostingAccount.count({ where: { userId: req.user!.id } }),
    prisma.hostingAccount.count({ 
      where: { 
        userId: req.user!.id,
        status: 'ACTIVE',
      },
    }),
    prisma.hostingAccount.groupBy({
      by: ['type'],
      _count: true,
      where: { userId: req.user!.id },
    }),
    prisma.hostingAccount.groupBy({
      by: ['status'],
      _count: true,
      where: { userId: req.user!.id },
    }),
    prisma.hostingAccount.aggregate({
      where: {
        userId: req.user!.id,
        status: 'ACTIVE',
        billingCycle: 'MONTHLY',
      },
      _sum: {
        price: true,
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalAccounts,
      activeAccounts,
      accountsByType,
      accountsByStatus,
      totalMonthlyCost: totalMonthlyCost._sum.price || 0,
    },
  });
}));

export default router;
