import { Response } from 'express';
import { AuthRequest } from '../types/express';
import * as notificationService from '../services/notifications.service';

/**
 * ===============================
 * Get User Notifications
 * ===============================
 * يشمل بيانات المستخدم و AI Match Score
 */
export const list = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        const notifications = await notificationService.getNotifications(userId);

        // 🔥 تعطيل الكاش نهائيًا (سبب 304)
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.status(200).json(notifications);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            message: error.message || 'Failed to fetch notifications',
        });
    }
};

/**
 * ===============================
 * Mark Notification As Read
 * ===============================
 */
export const read = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const notification = await notificationService.markAsRead(id);

        // 🔥 تعطيل الكاش أيضًا هنا
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.status(200).json(notification);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            message: error.message || 'Failed to mark notification as read',
        });
    }
};
