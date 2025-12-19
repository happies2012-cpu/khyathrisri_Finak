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

// Get user's support tickets
router.get('/', authenticate, [
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

  const where: any = { userId: req.user!.id };

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

// Get support ticket by ID
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;

  const ticket = await prisma.supportTicket.findFirst({
    where: { 
      id,
      userId: req.user!.id,
    },
    include: {
      replies: {
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
        },
        orderBy: { createdAt: 'asc' },
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

  if (!ticket) {
    throw new CustomError('Support ticket not found', 404);
  }

  res.json({
    success: true,
    data: { ticket },
  });
}));

// Create support ticket
router.post('/', authenticate, [
  body('subject').notEmpty().isString().isLength({ min: 3, max: 200 }),
  body('description').notEmpty().isString().isLength({ min: 10 }),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('category').optional().isString(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { subject, description, priority = 'MEDIUM', category } = req.body;

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: req.user!.id,
      subject,
      description,
      priority,
      category,
      status: 'OPEN',
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
      userId: req.user!.id,
      action: 'CREATE_SUPPORT_TICKET',
      resource: 'SupportTicket',
      details: {
        ticketId: ticket.id,
        subject,
        priority,
        category,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('Support ticket created', { 
    ticketId: ticket.id, 
    userId: req.user!.id,
    subject,
    priority 
  });

  res.status(201).json({
    success: true,
    data: { ticket },
  });
}));

// Add reply to support ticket
router.post('/:id/replies', authenticate, [
  body('content').notEmpty().isString().isLength({ min: 5 }),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { content } = req.body;

  const ticket = await prisma.supportTicket.findFirst({
    where: { 
      id,
      userId: req.user!.id,
    },
  });

  if (!ticket) {
    throw new CustomError('Support ticket not found', 404);
  }

  if (ticket.status === 'CLOSED') {
    throw new CustomError('Cannot add reply to closed ticket', 400);
  }

  const reply = await prisma.supportReply.create({
    data: {
      ticketId: id,
      userId: req.user!.id,
      content,
      isStaff: false,
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

  // Update ticket status if it was OPEN
  if (ticket.status === 'OPEN') {
    await prisma.supportTicket.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
    });
  }

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'REPLY_TO_SUPPORT_TICKET',
      resource: 'SupportTicket',
      details: {
        ticketId: id,
        replyId: reply.id,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('Reply added to support ticket', { 
    ticketId: id, 
    userId: req.user!.id,
    replyId: reply.id 
  });

  res.status(201).json({
    success: true,
    data: { reply },
  });
}));

// Update support ticket
router.put('/:id', authenticate, [
  body('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { status, priority } = req.body;

  const ticket = await prisma.supportTicket.findFirst({
    where: { 
      id,
      userId: req.user!.id,
    },
  });

  if (!ticket) {
    throw new CustomError('Support ticket not found', 404);
  }

  // Users can only close their own tickets
  if (status && !['CLOSED'].includes(status)) {
    throw new CustomError('Users can only close their own tickets', 400);
  }

  const updatedTicket = await prisma.supportTicket.update({
    where: { id },
    data: {
      status,
      priority,
    },
    include: {
      replies: {
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
        },
        orderBy: { createdAt: 'asc' },
      },
    }
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'UPDATE_SUPPORT_TICKET',
      resource: 'SupportTicket',
      details: {
        ticketId: id,
        changes: { status, priority },
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('Support ticket updated', { 
    ticketId: id, 
    userId: req.user!.id,
    changes: { status, priority }
  });

  res.json({
    success: true,
    data: { ticket: updatedTicket },
  });
}));

// Close support ticket
router.post('/:id/close', authenticate, [
  body('reason').optional().isString(),
], handleValidationErrors, asyncHandler(async (req: AuthRequest, res: any) => {
  const { id } = req.params;
  const { reason } = req.body;

  const ticket = await prisma.supportTicket.findFirst({
    where: { 
      id,
      userId: req.user!.id,
    },
  });

  if (!ticket) {
    throw new CustomError('Support ticket not found', 404);
  }

  if (ticket.status === 'CLOSED') {
    throw new CustomError('Ticket is already closed', 400);
  }

  // Add final reply if reason provided
  if (reason) {
    await prisma.supportReply.create({
      data: {
        ticketId: id,
        userId: req.user!.id,
        content: `Ticket closed. Reason: ${reason}`,
        isStaff: false,
      },
    });
  }

  const updatedTicket = await prisma.supportTicket.update({
    where: { id },
    data: { status: 'CLOSED' },
    include: {
      replies: {
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
        },
        orderBy: { createdAt: 'asc' },
      },
    }
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user!.id,
      action: 'CLOSE_SUPPORT_TICKET',
      resource: 'SupportTicket',
      details: {
        ticketId: id,
        reason,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  logger.info('Support ticket closed', { 
    ticketId: id, 
    userId: req.user!.id,
    reason 
  });

  res.json({
    success: true,
    data: { ticket: updatedTicket },
  });
}));

// Get support statistics
router.get('/stats/overview', authenticate, asyncHandler(async (req: AuthRequest, res: any) => {
  const [
    totalTickets,
    openTickets,
    resolvedTickets,
    ticketsByStatus,
    ticketsByPriority,
    recentTickets,
  ] = await Promise.all([
    prisma.supportTicket.count({ where: { userId: req.user!.id } }),
    prisma.supportTicket.count({ 
      where: { 
        userId: req.user!.id,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
    }),
    prisma.supportTicket.count({ 
      where: { 
        userId: req.user!.id,
        status: 'RESOLVED',
      },
    }),
    prisma.supportTicket.groupBy({
      by: ['status'],
      _count: true,
      where: { userId: req.user!.id },
    }),
    prisma.supportTicket.groupBy({
      by: ['priority'],
      _count: true,
      where: { userId: req.user!.id },
    }),
    prisma.supportTicket.findMany({
      where: { userId: req.user!.id },
      select: {
        id: true,
        subject: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalTickets,
      openTickets,
      resolvedTickets,
      ticketsByStatus,
      ticketsByPriority,
      recentTickets,
    },
  });
}));

export default router;
