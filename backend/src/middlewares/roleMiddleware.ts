import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';

/**
 * Role-based middleware
 * Example: roleMiddleware('admin')
 */
export const roleMiddleware = (requiredRole: 'admin' | 'user') => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (req.user.role !== requiredRole) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    };
};
