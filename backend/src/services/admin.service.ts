import prisma from '../services/prisma';
import { UserRole, JoinRequestStatus } from '@prisma/client';

export const getDashboardStats = async () => {
    const totalUsers = await prisma.user.count();
    // @ts-ignore
    const totalProjects = await prisma.project.count({ where: { isDeleted: false } });
    const pendingRequests = await prisma.joinRequest.count({ where: { status: JoinRequestStatus.pending } });
    // @ts-ignore
    const activeProjects = await prisma.project.count({ where: { isActive: true, isDeleted: false } });
    // @ts-ignore
    const deletedProjects = await prisma.project.count({ where: { isDeleted: true } });

    // Charts Data
    // 1. Projects by Category
    const projectsByCategory = await prisma.project.groupBy({
        by: ['category'],
        _count: {
            category: true
        },
        where: {
            // @ts-ignore
            isDeleted: false
        }
    });
    const categoryData = projectsByCategory.map((p: any) => ({ name: p.category, count: p._count?.category || 0 }));

    // 2. User Growth (All time by month)
    const usersByMonth = await prisma.user.findMany({
        select: { createdAt: true }
    });

    const monthCounts: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize all months to 0
    months.forEach(m => monthCounts[m] = 0);

    usersByMonth.forEach(u => {
        const date = new Date(u.createdAt);
        const month = date.toLocaleString('default', { month: 'short' });
        monthCounts[month] = (monthCounts[month] || 0) + 1;
    });

    const growthData = months.map(month => ({ month, users: monthCounts[month] }));

    // 3. Request Status Stats
    const requestStats = await prisma.joinRequest.groupBy({
        by: ['status'],
        _count: { status: true }
    });
    const requestStatusData = requestStats.map((r: any) => ({ name: r.status, value: r._count?.status || 0 }));

    return {
        stats: [
            { label: 'Total Users', value: totalUsers, change: '+0%' },
            { label: 'Total Projects', value: totalProjects, change: '+0%' },
            { label: 'Pending Requests', value: pendingRequests, change: '0' },
            { label: 'Active Projects', value: activeProjects, change: '+0%' },
            { label: 'Deleted Projects', value: deletedProjects, change: '+0%' } // Added
        ],
        charts: {
            categoryData,
            growthData,
            requestStatusData
        }
    };
};

export const getAllUsers = async (page = 1, limit = 10, search = '', role = 'all') => {
    const where: any = {};
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
        ];
    }
    if (role !== 'all') {
        where.role = role as UserRole;
    }

    const users = await prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where });

    return { users, total, pages: Math.ceil(total / limit) };
};

export const getAllProjects = async (page = 1, limit = 10, search = '', status = 'all') => {
    const where: any = { isDeleted: false };
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { owner: { name: { contains: search, mode: 'insensitive' } } }
        ];
    }
    if (status === 'active') where.isActive = true;
    if (status === 'pending') where.isActive = false; // Assuming pending means inactive or waiting approval? Logic might vary.
    // Actually, Project status isn't strictly defined as enum. 'isActive' is boolean.
    // Let's assume 'Active' = isActive: true, 'Pending' = not active? or we can skip strictly mapping 'Pending' if not used.

    const projects = await prisma.project.findMany({
        where,
        include: { owner: { select: { id: true, name: true, avatarUrl: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.project.count({ where });

    return { projects, total, pages: Math.ceil(total / limit) };
};

export const getAllJoinRequests = async (page = 1, limit = 10, search = '', status = 'all') => {
    const where: any = {};
    if (search) {
        where.OR = [
            { project: { title: { contains: search, mode: 'insensitive' } } },
            { user: { name: { contains: search, mode: 'insensitive' } } }
        ];
    }
    if (status !== 'all') {
        where.status = status as JoinRequestStatus;
    }

    const requests = await prisma.joinRequest.findMany({
        where,
        include: {
            project: { select: { title: true } },
            user: { select: { name: true, avatarUrl: true } }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.joinRequest.count({ where });

    return { requests, total, pages: Math.ceil(total / limit) };
};
