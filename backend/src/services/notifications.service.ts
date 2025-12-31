// src/services/notifications.service.ts
import prisma from "./prisma";

/**
 * ===============================
 * Create Notification
 * ===============================
 */
export const createNotification = async ({
    userId,
    title,
    message,
    joinRequestId,
    projectId,
}: {
    userId: string;
    title: string;
    message: string;
    joinRequestId?: string | null;
    projectId?: string | null;
}) => {
    return prisma.notification.create({
        data: {
            userId,
            title,
            message,
            isRead: false,
            joinRequestId: joinRequestId ?? null,
            projectId: projectId ?? null,
        },
    });
};

/**
 * ===============================
 * Get User Notifications
 * ===============================
 */
export const getNotifications = async (userId: string) => {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
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
                    // ✅ بدون || undefined
                    aiInsight: {
                        select: {
                            score: true,
                            result: true,
                        },
                    },
                },
            },
            project: true,
        },
    });
};

/**
 * ===============================
 * Mark Notification As Read
 * ===============================
 */
export const markAsRead = async (notificationId: string) => {
    return prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
    });
};
