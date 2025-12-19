import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
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

// Get user's invoices
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;

  const where: any = { userId: req.user!.id };

  if (status) {
    where.status = status;
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invoice.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}));

// Get invoice by ID
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;

  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
    include: {
      order: {
        include: {
          items: true,
        }
      },
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        }
      }
    },
  });

  if (!invoice) {
    throw new CustomError('Invoice not found', 404);
  }

  res.json({
    success: true,
    data: { invoice },
  });
}));

// Create invoice
router.post('/', authenticate, [
  body('amount').isFloat({ min: 0 }),
  body('dueDate').isISO8601(),
  body('items').isArray({ min: 1 }),
  body('orderId').optional().isString(),
  body('notes').optional().isString(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { amount, dueDate, items, orderId, notes } = req.body;

  // Verify order belongs to user if provided
  if (orderId) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user!.id,
      },
    });

    if (!order) {
      throw new CustomError('Order not found', 404);
    }
  }

  // Generate invoice number
  const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

  // Create invoice
  const invoice = await prisma.invoice.create({
    data: {
      userId: req.user!.id,
      orderId,
      invoiceNumber,
      amount,
      dueDate: new Date(dueDate),
      currency: 'USD',
      items,
      notes,
      status: 'DRAFT',
    },
    include: {
      order: true,
    }
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'CREATE_INVOICE',
      resource: 'Invoice',
      details: {
        invoiceId: invoice.id,
        invoiceNumber,
        amount,
        dueDate,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('Invoice created', {
    invoiceId: invoice.id,
    userId: req.user!.id,
    invoiceNumber,
    amount
  });

  res.status(201).json({
    success: true,
    data: { invoice },
  });
}));

// Update invoice
router.put('/:id', authenticate, [
  body('status').optional().isIn(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']),
  body('dueDate').optional().isISO8601(),
  body('notes').optional().isString(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { status, dueDate, notes } = req.body;

  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!invoice) {
    throw new CustomError('Invoice not found', 404);
  }

  // Only allow certain status changes by user
  const allowedStatusChanges = {
    'DRAFT': ['SENT', 'CANCELLED'],
    'SENT': ['PAID'],
    'PAID': [],
    'OVERDUE': ['PAID'],
    'CANCELLED': [],
  };

  if (status && !allowedStatusChanges[invoice.status as keyof typeof allowedStatusChanges].includes(status as any)) {
    throw new CustomError('Cannot change invoice status to ' + status, 400);
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id },
    data: {
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes,
      ...(status === 'PAID' ? { paidAt: new Date() } : {}),
    },
    include: {
      order: true,
    }
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'UPDATE_INVOICE',
      resource: 'Invoice',
      details: {
        invoiceId: id,
        changes: { status, dueDate, notes },
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('Invoice updated', {
    invoiceId: id,
    userId: req.user!.id,
    changes: { status, dueDate, notes }
  });

  res.json({
    success: true,
    data: { invoice: updatedInvoice },
  });
}));

// Get user's subscriptions
router.get('/subscriptions', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['ACTIVE', 'CANCELLED', 'EXPIRED', 'SUSPENDED']),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;

  const where: any = { userId: req.user!.id };

  if (status) {
    where.status = status;
  }

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subscription.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}));

// Create subscription
router.post('/subscriptions', authenticate, [
  body('productId').notEmpty().isString(),
  body('productName').notEmpty().isString(),
  body('plan').notEmpty().isString(),
  body('price').isFloat({ min: 0 }),
  body('billingCycle').isIn(['MONTHLY', 'YEARLY', 'QUARTERLY']),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { productId, productName, plan, price, billingCycle } = req.body;

  // Calculate period dates
  const now = new Date();
  let periodEnd: Date;

  switch (billingCycle) {
    case 'MONTHLY':
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      break;
    case 'YEARLY':
      periodEnd = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      break;
    case 'QUARTERLY':
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
      break;
    default:
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  const subscription = await prisma.subscription.create({
    data: {
      userId: req.user!.id,
      productId,
      productName,
      plan,
      price,
      billingCycle,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      status: 'ACTIVE',
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'CREATE_SUBSCRIPTION',
      resource: 'Subscription',
      details: {
        subscriptionId: subscription.id,
        productName,
        plan,
        price,
        billingCycle,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('Subscription created', {
    subscriptionId: subscription.id,
    userId: req.user!.id,
    productName,
    plan
  });

  res.status(201).json({
    success: true,
    data: { subscription },
  });
}));

// Cancel subscription
router.post('/subscriptions/:id/cancel', authenticate, [
  body('reason').optional().isString(),
  body('cancelAtPeriodEnd').optional().isBoolean(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { reason, cancelAtPeriodEnd = true } = req.body;

  const subscription = await prisma.subscription.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!subscription) {
    throw new CustomError('Subscription not found', 404);
  }

  if (subscription.status !== 'ACTIVE') {
    throw new CustomError('Cannot cancel inactive subscription', 400);
  }

  const updatedSubscription = await prisma.subscription.update({
    where: { id },
    data: {
      cancelAtPeriodEnd,
      canceledAt: cancelAtPeriodEnd ? null : new Date(),
      status: cancelAtPeriodEnd ? 'ACTIVE' : 'CANCELLED',
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'CANCEL_SUBSCRIPTION',
      resource: 'Subscription',
      details: {
        subscriptionId: id,
        reason,
        cancelAtPeriodEnd,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('Subscription cancelled', {
    subscriptionId: id,
    userId: req.user!.id,
    reason,
    cancelAtPeriodEnd
  });

  res.json({
    success: true,
    data: { subscription: updatedSubscription },
  });
}));

// Get billing statistics
router.get('/stats/overview', authenticate, asyncHandler(async (req: AuthRequest, res: any) => {
  const [
    totalInvoices,
    paidInvoices,
    unpaidInvoices,
    overdueInvoices,
    totalAmount,
    paidAmount,
    unpaidAmount,
    activeSubscriptions,
    monthlySubscriptionCost,
  ] = await Promise.all([
    prisma.invoice.count({ where: { userId: req.user!.id } }),
    prisma.invoice.count({
      where: {
        userId: req.user!.id,
        status: 'PAID',
      },
    }),
    prisma.invoice.count({
      where: {
        userId: req.user!.id,
        status: 'SENT',
      },
    }),
    prisma.invoice.count({
      where: {
        userId: req.user!.id,
        status: 'OVERDUE',
        dueDate: { lt: new Date() },
      },
    }),
    prisma.invoice.aggregate({
      where: { userId: req.user!.id },
      _sum: { amount: true },
    }),
    prisma.invoice.aggregate({
      where: {
        userId: req.user!.id,
        status: 'PAID',
      },
      _sum: { amount: true },
    }),
    prisma.invoice.aggregate({
      where: {
        userId: req.user!.id,
        status: { in: ['SENT', 'OVERDUE'] },
      },
      _sum: { amount: true },
    }),
    prisma.subscription.count({
      where: {
        userId: req.user!.id,
        status: 'ACTIVE',
      },
    }),
    prisma.subscription.aggregate({
      where: {
        userId: req.user!.id,
        status: 'ACTIVE',
        billingCycle: 'MONTHLY',
      },
      _sum: { price: true },
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      overdueInvoices,
      totalAmount: totalAmount._sum.amount || 0,
      paidAmount: paidAmount._sum.amount || 0,
      unpaidAmount: unpaidAmount._sum.amount || 0,
      activeSubscriptions,
      monthlySubscriptionCost: monthlySubscriptionCost._sum.price || 0,
    },
  });
}));

export default router;
