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

// Get system statistics (admin only)
router.get('/stats', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(async (req: AuthRequest, res: any) => {
  const [
    totalUsers,
    activeUsers,
    totalHostingAccounts,
    activeHostingAccounts,
    totalDomains,
    activeDomains,
    totalOrders,
    completedOrders,
    totalRevenue,
    monthlyRevenue,
    totalSupportTickets,
    openSupportTickets,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.hostingAccount.count(),
    prisma.hostingAccount.count({ where: { status: 'ACTIVE' } }),
    prisma.domain.count(),
    prisma.domain.count({ where: { status: 'ACTIVE' } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { totalAmount: true },
    }),
    prisma.supportTicket.count(),
    prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
  ]);

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      hosting: {
        total: totalHostingAccounts,
        active: activeHostingAccounts,
      },
      domains: {
        total: totalDomains,
        active: activeDomains,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
      },
      support: {
        total: totalSupportTickets,
        open: openSupportTickets,
      },
    },
  });
}));

// Get all users (admin only)
router.get('/users', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('status').optional().isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED']),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
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
        role: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            hostingAccounts: true,
            domains: true,
            orders: true,
            supportTickets: true,
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

// Get all hosting accounts (admin only)
router.get('/hosting', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED']),
  query('type').optional().isIn(['VPS', 'SHARED', 'CLOUD', 'WORDPRESS', 'DEDICATED']),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const type = req.query.type as string;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  const [accounts, total] = await Promise.all([
    prisma.hostingAccount.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        domains: {
          select: {
            id: true,
            name: true,
            status: true,
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

// Get all orders (admin only)
router.get('/orders', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED']),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        items: true,
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            amount: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}));

// Get all support tickets (admin only)
router.get('/support', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  query('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const priority = req.query.priority as string;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            replies: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.supportTicket.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}));

// Update hosting account status (admin only)
router.put('/hosting/:id/status', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), [
  body('status').isIn(['PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED']),
  body('notes').optional().isString(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const account = await prisma.hostingAccount.findUnique({
    where: { id },
  });

  if (!account) {
    throw new CustomError('Hosting account not found', 404);
  }

  const updatedAccount = await prisma.hostingAccount.update({
    where: { id },
    data: {
      status,
      ...(status === 'ACTIVE' && { expiresAt: null }), // Clear expiry when activating
    },
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
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: account.userId,
      action: 'ADMIN_UPDATE_HOSTING_STATUS',
      resource: 'HostingAccount',
      details: {
        accountId: id,
        oldStatus: account.status,
        newStatus: status,
        notes,
        adminId: req.user!.id,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('Hosting account status updated by admin', {
    accountId: id,
    adminId: req.user!.id,
    oldStatus: account.status,
    newStatus: status
  });

  res.json({
    success: true,
    data: { account: updatedAccount },
  });
}));

// Add reply to support ticket (admin only)
router.post('/support/:id/reply', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), [
  body('content').notEmpty().isString().isLength({ min: 5 }),
  body('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { content, status } = req.body;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
  });

  if (!ticket) {
    throw new CustomError('Support ticket not found', 404);
  }

  const reply = await prisma.supportReply.create({
    data: {
      ticketId: id,
      userId: req.user!.id,
      content,
      isStaff: true,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          avatar: true,
        }
      }
    }
  });

  // Update ticket status if provided
  if (status) {
    await prisma.supportTicket.update({
      where: { id },
      data: { status },
    });
  }

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: ticket.userId,
      action: 'ADMIN_REPLY_TO_SUPPORT_TICKET',
      resource: 'SupportTicket',
      details: {
        ticketId: id,
        replyId: reply.id,
        adminId: req.user!.id,
        status,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('Admin replied to support ticket', {
    ticketId: id,
    adminId: req.user!.id,
    replyId: reply.id
  });

  res.status(201).json({
    success: true,
    data: { reply },
  });
}));

// Update system settings (super admin only)
router.put('/settings', authenticate, authorize('SUPER_ADMIN'), [
  body('settings').isObject(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { settings } = req.body;

  // Update or create settings
  const updatePromises = Object.entries(settings).map(([key, value]) =>
    prisma.systemSettings.upsert({
      where: { key },
      update: { value: value as any },
      create: { key, value: value as any },
    })
  );

  await Promise.all(updatePromises);

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'UPDATE_SYSTEM_SETTINGS',
      resource: 'SystemSettings',
      details: {
        settings: Object.keys(settings),
        adminId: req.user!.id,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('System settings updated by super admin', {
    adminId: req.user!.id,
    settingsCount: Object.keys(settings).length
  });

  res.json({
    success: true,
    message: 'System settings updated successfully',
  });
}));

// Get system settings (admin only)
router.get('/settings', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), asyncHandler(async (req: AuthRequest, res: any) => {
  const settings = await prisma.systemSettings.findMany({
    orderBy: { key: 'asc' },
  });

  const settingsObject = settings.reduce((acc: any, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  res.json({
    success: true,
    data: { settings: settingsObject },
  });
}));

export default router;
