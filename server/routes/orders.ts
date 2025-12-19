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

// Get user's orders
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED']),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;

  const where: any = { userId: req.user!.id };

  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        items: true,
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            amount: true,
            dueDate: true,
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

// Get order by ID
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
    include: {
      items: true,
      invoices: true,
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

  if (!order) {
    throw new CustomError('Order not found', 404);
  }

  res.json({
    success: true,
    data: { order },
  });
}));

// Create new order
router.post('/', authenticate, [
  body('items').isArray({ min: 1 }),
  body('items.*.productId').notEmpty().isString(),
  body('items.*.productName').notEmpty().isString(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.unitPrice').isFloat({ min: 0 }),
  body('paymentMethod').optional().isString(),
  body('billingAddress').optional().isObject(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { items, paymentMethod, billingAddress } = req.body;

  // Calculate total amount
  const totalAmount = items.reduce((sum: number, item: any) => {
    return sum + (item.unitPrice * item.quantity);
  }, 0);

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

  // Create order
  const order = await prisma.order.create({
    data: {
      userId: req.user!.id,
      orderNumber,
      status: 'PENDING',
      totalAmount,
      currency: 'USD',
      paymentMethod,
      billingAddress,
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
          metadata: item.metadata || {},
        }))
      }
    },
    include: {
      items: true,
    }
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'CREATE_ORDER',
      resource: 'Order',
      details: {
        orderId: order.id,
        orderNumber,
        totalAmount,
        itemCount: items.length,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('Order created', {
    orderId: order.id,
    userId: req.user!.id,
    orderNumber,
    totalAmount
  });

  res.status(201).json({
    success: true,
    data: { order },
  });
}));

// Update order status
router.put('/:id/status', authenticate, [
  body('status').isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED']),
  body('notes').optional().isString(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!order) {
    throw new CustomError('Order not found', 404);
  }

  // Only allow certain status changes by user
  const allowedStatusChanges = {
    'PENDING': ['CANCELLED'],
    'CONFIRMED': ['CANCELLED'],
    'PROCESSING': [],
    'COMPLETED': [],
    'CANCELLED': [],
    'REFUNDED': [],
  };

  if (!allowedStatusChanges[order.status as keyof typeof allowedStatusChanges].includes(status)) {
    throw new CustomError('Cannot change order status to ' + status, 400);
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      status,
      notes,
    },
    include: {
      items: true,
      invoices: true,
    }
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'UPDATE_ORDER_STATUS',
      resource: 'Order',
      details: {
        orderId: id,
        oldStatus: order.status,
        newStatus: status,
        notes,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('Order status updated', {
    orderId: id,
    userId: req.user!.id,
    oldStatus: order.status,
    newStatus: status
  });

  res.json({
    success: true,
    data: { order: updatedOrder },
  });
}));

// Cancel order
router.post('/:id/cancel', authenticate, [
  body('reason').optional().isString(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!order) {
    throw new CustomError('Order not found', 404);
  }

  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    throw new CustomError('Cannot cancel order in ' + order.status + ' status', 400);
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      notes: reason || 'Cancelled by user',
    },
    include: {
      items: true,
    }
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'CANCEL_ORDER',
      resource: 'Order',
      details: {
        orderId: id,
        reason,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('Order cancelled', {
    orderId: id,
    userId: req.user!.id,
    reason
  });

  res.json({
    success: true,
    data: { order: updatedOrder },
  });
}));

// Get order statistics
router.get('/stats/overview', authenticate, asyncHandler(async (req: AuthRequest, res: any) => {
  const [
    totalOrders,
    completedOrders,
    pendingOrders,
    totalSpent,
    ordersByStatus,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { userId: req.user!.id } }),
    prisma.order.count({
      where: {
        userId: req.user!.id,
        status: 'COMPLETED',
      },
    }),
    prisma.order.count({
      where: {
        userId: req.user!.id,
        status: 'PENDING',
      },
    }),
    prisma.order.aggregate({
      where: {
        userId: req.user!.id,
        status: 'COMPLETED',
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: true,
      where: { userId: req.user!.id },
    }),
    prisma.order.findMany({
      where: { userId: req.user!.id },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      completedOrders,
      pendingOrders,
      totalSpent: totalSpent._sum.totalAmount || 0,
      ordersByStatus,
      recentOrders,
    },
  });
}));

export default router;
