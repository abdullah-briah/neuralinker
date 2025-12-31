// src/services/notifications.service.ts
import prisma from "./prisma";

/**
 * =====================================
 * Create Notification
 * =====================================
 */
export const createNotification = async ({
    userId,
    title,
    message,
    joinRequestId = null,
    projectId = null,
}: {
    userId: string;
    title: string;
    message: string;
    joinRequestId?: string | null;
    projectId?: string | null;
}) => {
    if (!userId || !title || !message) {
        throw new Error("Missing required notification fields");
    }

    return prisma.notification.create({
        data: {
            userId,
            title,
            message,
            isRead: false,
            joinRequestId,
            projectId,
        },
    });
};

/**
 * =====================================
 * Get User Notifications
 * (Latest first – optimized)
 * =====================================
 */
export const getNotifications = async (userId: string) => {
    if (!userId) {
        throw new Error("userId is required");
    }

    return prisma.notification.findMany({
        where: {
            userId,
            isDeleted: false, // 👈 لو عندك soft delete
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 20, // 👈 مهم جدًا للأداء والسرعة
        include: {
            joinRequest: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true,
                            skills: true,
                        },
                    },
                    aiInsight: {
                        select: {
                            score: true,
                            result: true,
                        },
                    },
                },
            },
            project: {
                select: {
                    id: true,
                    title: true,
                    category: true,
                },
            },
        },
    });
};

/**
 * =====================================
 * Get Unread Notifications Count
 * (For Bell badge 🔔)
 * =====================================
 */
export const getUnreadCount = async (userId: string) => {
    if (!userId) {
        throw new Error("userId is required");
    }

    return prisma.notification.count({
        where: {
            userId,
            isRead: false,
            isDeleted: false,
        },
    });
};

/**
 * =====================================
 * Mark Notification As Read
 * =====================================
 */
export const markAsRead = async (notificationId: string) => {
    if (!notificationId) {
        throw new Error("notificationId is required");
    }

    return prisma.notification.update({
        where: { id: notificationId },
        data: {
            isRead: true,
        },
    });
};

/**
 * =====================================
 * Mark All Notifications As Read
 * =====================================
 */
export const markAllAsRead = async (userId: string) => {
    if (!userId) {
        throw new Error("userId is required");
    }

    return prisma.notification.updateMany({
        where: {
            userId,
            isRead: false,
        },
        data: {
            isRead: true,
        },
    });
};
