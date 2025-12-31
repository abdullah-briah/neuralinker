import { Response } from 'express';
import { AuthRequest } from '../types/express';
import * as joinRequestService from '../services/joinRequests.service';
import prisma from '../services/prisma';

/**
 * ===============================
 * Create Join Request
 * ===============================
 * ينشئ JoinRequest، ينشئ Notification، ويحسب AI Match Score
 */
export const create = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.body;

        // إنشاء JoinRequest + Notification + AI Match
        const joinRequest = await joinRequestService.createRequest(
            req.user!.id,
            projectId
        );

        // إرسال الرد للمستخدم
        res.status(201).json({
            message: 'Join request created successfully',
            joinRequest,
        });
    } catch (error: any) {
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

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.ownerId !== req.user!.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

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

        // ✅ Validate status
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // 1️⃣ Get join request with project
        const joinRequest = await prisma.joinRequest.findUnique({
            where: { id: req.params.id },
            include: { project: true },
        });

        if (!joinRequest) {
            return res.status(404).json({ message: 'Join request not found' });
        }

        // 2️⃣ Check ownership
        if (joinRequest.project.ownerId !== req.user!.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // 3️⃣ Update status
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

        if (!joinRequest) {
            return res.status(404).json({ message: 'Join request not found' });
        }

        res.json(joinRequest);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
