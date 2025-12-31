import { Request, Response } from 'express';
import * as adminService from '../services/admin.service';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const stats = await adminService.getDashboardStats();
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || '';
        const role = req.query.role as string || 'all';

        const result = await adminService.getAllUsers(page, limit, search, role);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProjects = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || '';
        const status = req.query.status as string || 'all';

        const result = await adminService.getAllProjects(page, limit, search, status);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getJoinRequests = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || '';
        const status = req.query.status as string || 'all';

        const result = await adminService.getAllJoinRequests(page, limit, search, status);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
