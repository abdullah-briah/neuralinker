import { Response } from 'express';
import { AuthRequest } from '../types/express';
import * as projectService from '../services/projects.service';
import prisma from '../services/prisma';
import * as notificationService from '../services/notifications.service';
import * as joinRequestsService from '../services/joinRequests.service';

/**
 * ===============================
 * Create Project
 * ===============================
 */
export const create = async (req: AuthRequest, res: Response) => {
    try {
        const project = await projectService.createProject(
            req.user!.id,
            req.body
        );

        res.status(201).json(project);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * ===============================
 * Get All Projects
 * ===============================
 */
export const list = async (_req: AuthRequest, res: Response) => {
    try {
        const projects = await projectService.getProjects();
        res.json(projects);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * ===============================
 * Get My Projects (Created by me)
 * ===============================
 */
export const getMyProjects = async (req: AuthRequest, res: Response) => {
    try {
        const projects = await projectService.getMyProjects(req.user!.id);
        res.json(projects);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * ===============================
 * Get Joined Projects (I am a member of)
 * ===============================
 */
export const getJoinedProjects = async (req: AuthRequest, res: Response) => {
    try {
        const projects = await projectService.getJoinedProjects(req.user!.id);
        res.json(projects);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * ===============================
 * Get Project By ID
 * ===============================
 */
export const get = async (req: AuthRequest, res: Response) => {
    try {
        const project = await projectService.getProjectById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * ===============================
 * Update Project (Owner Only)
 * ===============================
 */
export const update = async (req: AuthRequest, res: Response) => {
    try {
        const updated = await projectService.updateProject(
            req.params.id,
            req.user!.id,
            req.body
        );

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * ===============================
 * Delete Project (Owner Only)
 * ===============================
 */
export const remove = async (req: AuthRequest, res: Response) => {
    try {
        await projectService.deleteProject(
            req.params.id,
            req.user!.id
        );

        res.json({ message: 'Project deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * ===============================
 * Get Join Requests for Project (Owner Only)
 * ===============================
 */
export const getJoinRequests = async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;

    try {
        const requests = await prisma.joinRequest.findMany({
            where: { projectId },
            include: {
                user: true,
                aiInsight: true,
            },
        });

        res.json(requests);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * ===============================
 * Join Project (Any user except owner)
 * ===============================
 */
export const joinProject = async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    const userId = req.user!.id;

    try {
        // 1️⃣ تحقق من المشروع
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { owner: true }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        if (project.ownerId === userId) {
            return res.status(400).json({ message: 'Owner cannot join their own project.' });
        }

        // 2️⃣ تحقق من العضوية أو طلب سابق
        const existingMember = await prisma.projectMember.findFirst({
            where: { projectId, userId }
        });

        const existingRequest = await prisma.joinRequest.findFirst({
            where: { projectId, userId, status: 'pending' }
        });

        if (existingMember || existingRequest) {
            return res.status(400).json({
                message: 'You have already joined or requested to join this project.'
            });
        }

        // 3️⃣ إنشاء طلب الانضمام (Trigger AI Service inside)
        const joinRequest = await joinRequestsService.createRequest(projectId, userId);

        res.status(201).json(joinRequest);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            message: error.message || 'Failed to send join request.'
        });
    }
};

/**
 * ===============================
 * Get Project Messages
 * ===============================
 */
export const getMessages = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    try {
        // Verify Access: Must be Owner or Accepted Member
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                members: true
            }
        });

        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isOwner = project.ownerId === userId;
        const isMember = project.members.some(m => m.userId === userId);
        const isAdmin = req.user!.role === 'admin';

        if (!isOwner && !isMember && !isAdmin) {
            return res.status(403).json({ message: 'Access denied. You must be a member to view chat.' });
        }

        const messages = await projectService.getProjectMessages(id);
        res.json(messages);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * ===============================
 * Send Project Message
 * ===============================
 */
export const sendMessage = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Message content is required.' });
    }

    try {
        // Verify Access
        const project = await prisma.project.findUnique({
            where: { id },
            include: { members: true }
        });

        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isOwner = project.ownerId === userId;
        const isMember = project.members.some(m => m.userId === userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: 'Access denied. You cannot send messages to this project.' });
        }

        const message = await projectService.createProjectMessage(id, userId, content);

        // 🔔 Notify all other members
        const allMembers = [
            project.ownerId,
            ...project.members.map(m => m.userId)
        ];
        // Filter unique and remove sender
        const uniqueRecipients = [...new Set(allMembers)].filter(uid => uid !== userId);

        for (const recipientId of uniqueRecipients) {
            await notificationService.createNotification({
                userId: recipientId,
                title: `New Message in ${project.title}`,
                message: `${req.user!.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
                projectId: id
            });
        }

        res.status(201).json(message);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
