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

// Get user's domains
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['PENDING', 'ACTIVE', 'EXPIRED', 'TRANSFER_PENDING']),
  query('hostingAccountId').optional().isString(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const hostingAccountId = req.query.hostingAccountId as string;
  const skip = (page - 1) * limit;

  const where: any = { userId: req.user!.id };

  if (status) {
    where.status = status;
  }

  if (hostingAccountId) {
    where.hostingAccountId = hostingAccountId;
  }

  const [domains, total] = await Promise.all([
    prisma.domain.findMany({
      where,
      skip,
      take: limit,
      include: {
        hostingAccount: {
          select: {
            id: true,
            name: true,
            type: true,
          }
        }
      },
      orderBy: { registeredAt: 'desc' },
    }),
    prisma.domain.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      domains,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}));

// Get domain by ID
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;

  const domain = await prisma.domain.findFirst({
    where: { 
      id,
      userId: req.user!.id,
    },
    include: {
      hostingAccount: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      }
    },
  });

  if (!domain) {
    throw new CustomError('Domain not found', 404);
  }

  res.json({
    success: true,
    data: { domain },
  });
}));

// Register new domain
router.post('/', authenticate, [
  body('name').notEmpty().isString(),
  body('price').isFloat({ min: 0 }),
  body('autoRenew').optional().isBoolean(),
  body('hostingAccountId').optional().isString(),
  body('nameservers').optional().isArray(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { name, price, autoRenew = false, hostingAccountId, nameservers = [] } = req.body;

  // Check if domain already exists
  const existingDomain = await prisma.domain.findUnique({
    where: { name: name.toLowerCase() },
  });

  if (existingDomain) {
    throw new CustomError('Domain already registered', 400);
  }

  // Verify hosting account belongs to user if provided
  if (hostingAccountId) {
    const hostingAccount = await prisma.hostingAccount.findFirst({
      where: {
        id: hostingAccountId,
        userId: req.user!.id,
      },
    });

    if (!hostingAccount) {
      throw new CustomError('Hosting account not found', 404);
    }
  }

  // Create domain
  const domain = await prisma.domain.create({
    data: {
      userId: req.user!.id,
      name: name.toLowerCase(),
      price,
      autoRenew,
      hostingAccountId,
      nameservers,
      status: 'PENDING', // Will be updated by domain registrar
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    },
    include: {
      hostingAccount: true,
    }
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'REGISTER_DOMAIN',
      resource: 'Domain',
      details: {
        domainId: domain.id,
        name,
        price,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('Domain registered', { 
    domainId: domain.id, 
    userId: req.user!.id,
    name 
  });

  res.status(201).json({
    success: true,
    data: { domain },
  });
}));

// Update domain
router.put('/:id', authenticate, [
  body('autoRenew').optional().isBoolean(),
  body('nameservers').optional().isArray(),
  body('status').optional().isIn(['PENDING', 'ACTIVE', 'EXPIRED', 'TRANSFER_PENDING']),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { autoRenew, nameservers, status } = req.body;

  const domain = await prisma.domain.findFirst({
    where: { 
      id,
      userId: req.user!.id,
    },
  });

  if (!domain) {
    throw new CustomError('Domain not found', 404);
  }

  const updatedDomain = await prisma.domain.update({
    where: { id },
    data: {
      autoRenew,
      nameservers,
      status,
    },
    include: {
      hostingAccount: true,
    }
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'UPDATE_DOMAIN',
      resource: 'Domain',
      details: {
        domainId: id,
        changes: { autoRenew, nameservers, status },
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('Domain updated', { 
    domainId: id, 
    userId: req.user!.id,
    changes: { autoRenew, nameservers, status }
  });

  res.json({
    success: true,
    data: { domain: updatedDomain },
  });
}));

// Transfer domain
router.post('/:id/transfer', authenticate, [
  body('newHostingAccountId').optional().isString(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { newHostingAccountId } = req.body;

  const domain = await prisma.domain.findFirst({
    where: { 
      id,
      userId: req.user!.id,
    },
  });

  if (!domain) {
    throw new CustomError('Domain not found', 404);
  }

  // Verify new hosting account belongs to user if provided
  if (newHostingAccountId) {
    const hostingAccount = await prisma.hostingAccount.findFirst({
      where: {
        id: newHostingAccountId,
        userId: req.user!.id,
      },
    });

    if (!hostingAccount) {
      throw new CustomError('Hosting account not found', 404);
    }
  }

  const updatedDomain = await prisma.domain.update({
    where: { id },
    data: {
      hostingAccountId: newHostingAccountId,
      status: 'TRANSFER_PENDING',
    },
    include: {
      hostingAccount: true,
    }
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'TRANSFER_DOMAIN',
      resource: 'Domain',
      details: {
        domainId: id,
        newHostingAccountId,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('Domain transfer initiated', { 
    domainId: id, 
    userId: req.user!.id,
    newHostingAccountId 
  });

  res.json({
    success: true,
    data: { domain: updatedDomain },
  });
}));

// Delete domain
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;

  const domain = await prisma.domain.findFirst({
    where: { 
      id,
      userId: req.user!.id,
    },
  });

  if (!domain) {
    throw new CustomError('Domain not found', 404);
  }

  // Check if domain is linked to active hosting
  if (domain.hostingAccountId) {
    const hostingAccount = await prisma.hostingAccount.findUnique({
      where: { id: domain.hostingAccountId },
    });

    if (hostingAccount && hostingAccount.status === 'ACTIVE') {
      throw new CustomError('Cannot delete domain linked to active hosting account', 400);
    }
  }

  await prisma.domain.delete({ where: { id } });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'DELETE_DOMAIN',
      resource: 'Domain',
      details: {
        domainId: id,
        name: domain.name,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.warn('Domain deleted', { 
    domainId: id, 
    userId: req.user!.id,
    domainName: domain.name
  });

  res.json({
    success: true,
    message: 'Domain deleted successfully',
  });
}));

// Get domain statistics
router.get('/stats/overview', authenticate, asyncHandler(async (req: AuthRequest, res: any) => {
  const [
    totalDomains,
    activeDomains,
    expiringSoon, // Domains expiring in next 30 days
    domainsByStatus,
    totalYearlyCost,
  ] = await Promise.all([
    prisma.domain.count({ where: { userId: req.user!.id } }),
    prisma.domain.count({ 
      where: { 
        userId: req.user!.id,
        status: 'ACTIVE',
      },
    }),
    prisma.domain.count({
      where: {
        userId: req.user!.id,
        status: 'ACTIVE',
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
      },
    }),
    prisma.domain.groupBy({
      by: ['status'],
      _count: true,
      where: { userId: req.user!.id },
    }),
    prisma.domain.aggregate({
      where: {
        userId: req.user!.id,
        status: 'ACTIVE',
        autoRenew: true,
      },
      _sum: {
        price: true,
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalDomains,
      activeDomains,
      expiringSoon,
      domainsByStatus,
      totalYearlyCost: totalYearlyCost._sum.price || 0,
    },
  });
}));

export default router;
