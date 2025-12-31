import { Response } from 'express';
import { AuthRequest } from '../types/express';
import prisma from '../services/prisma';

export const list = async (req: AuthRequest, res: Response) => {
    try {
        // List members of a project
        const { projectId } = req.params;
        const members = await prisma.projectMember.findMany({
            where: { projectId },
            include: { user: true }
        });
        res.json(members);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
