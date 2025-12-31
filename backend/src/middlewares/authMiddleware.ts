import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, UserPayload } from '../types/express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🔐 JWT Secret (إجباري)
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * ===============================
 * Auth Middleware (JWT)
 * ===============================
 */
export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res
            .status(401)
            .json({ message: 'Invalid authorization format' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

/**
 * ===============================
 * Role-based Access Middleware
 * ===============================
 */
export const roleMiddleware = (allowedRoles: Array<'user' | 'admin'>) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res
                .status(403)
                .json({ message: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};

/**
 * ===============================
 * Project Owner Middleware
 * ===============================
 * يسمح فقط لصاحب المشروع أو admin
 */
export const projectOwnerMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const { projectId } = req.params;

    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { ownerId: true },
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // admin يتجاوز التحقق
        if (req.user.role === 'admin') {
            return next();
        }

        // owner فقط
        if (project.ownerId !== req.user.id) {
            return res
                .status(403)
                .json({ message: 'Forbidden: Not project owner' });
        }

        next();
    } catch (error) {
        console.error('Owner check failed:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
