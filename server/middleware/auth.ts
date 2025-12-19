import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { CustomError } from './errorHandler';



export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new CustomError('Access denied. No token provided.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, status: true }
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new CustomError('Invalid token or user not found.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new CustomError('Access denied. Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new CustomError('Access denied. Insufficient permissions.', 403));
    }

    next();
  };
};

export const generateToken = (user: { id: string; email: string; role: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};
