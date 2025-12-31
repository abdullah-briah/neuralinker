import { Response } from 'express';
import { AuthRequest } from '../types/express';
import * as joinRequestService from '../services/joinRequests.service';
import * as notificationService from '../services/notifications.service';
import prisma from '../services/prisma';

/**
 * ===============================
 * Create Join Request
 * ===============================
 */
export const create = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.body;
        const userId = req.user!.id;

        if (!projectId) {
            return res.status(400).json({ message: 'projectId is required' });
        }

        // 1️⃣ إنشاء الطلب (يتضمن AI + إشعار للمالك)
        const joinRequest = await joinRequestService.createRequest(
            projectId,
            userId
        );

        // 2️⃣ 🔔 إشعار فوري للمرسل (Popup UX)
        // جلب المشروع للتأكد من وجوده
        const project = await prisma.project.findUnique({
            where: { id: joinRequest.projectId },
            select: { title: true }
        });

        await notificationService.createNotification({
            userId,
            title: 'Join Request Sent',
            message: `Your request to join "${project?.title ?? 'the project'}" has been sent successfully.`,
            joinRequestId: joinRequest.id,
            projectId: joinRequest.projectId,
        });

        // 3️⃣ الرد
        res.status(201).json({
            message: 'Join request created successfully',
            joinRequest,
        });

    } catch (error: any) {
        console.error('Create Join Request Error:', error);
        res.status(400).json({ message: error.message });
    }
};

/**
 * ===============================
 * List Project Join Requests (Owner Only)
 * ===============================
 */
export const listProjectRequests = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.projectId },
            select: { ownerId: true },
        });

        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.ownerId !== req.user!.id) return res.status(403).json({ message: 'Forbidden' });

        const requests = await joinRequestService.getProjectRequests(
            req.params.projectId
        );

        res.json(requests);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * ===============================
 * Accept / Reject Join Request (Owner Only)
 * ===============================
 */
export const respond = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const joinRequest = await prisma.joinRequest.findUnique({
            where: { id: req.params.id },
            include: { project: true },
        });

        if (!joinRequest) return res.status(404).json({ message: 'Join request not found' });
        if (!joinRequest.project) return res.status(500).json({ message: 'Project data missing' });
        if (joinRequest.project.ownerId !== req.user!.id) return res.status(403).json({ message: 'Forbidden' });

        const updatedRequest = await joinRequestService.updateStatus(
            req.params.id,
            status
        );

        res.json(updatedRequest);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * ===============================
 * Get Single Join Request
 * ===============================
 */
export const getById = async (req: AuthRequest, res: Response) => {
    try {
        const joinRequest = await prisma.joinRequest.findUnique({
            where: { id: req.params.id },
            include: { project: true, user: true },
        });

        if (!joinRequest) return res.status(404).json({ message: 'Join request not found' });
        if (!joinRequest.project) return res.status(500).json({ message: 'Project data missing' });

        res.json(joinRequest);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
