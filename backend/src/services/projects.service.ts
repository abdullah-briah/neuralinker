import { Project, Prisma } from "@prisma/client";
import prisma from "./prisma";

/**
 * ===============================
 * Create Project (Owner + Member)
 * ===============================
 */
export const createProject = async (
    ownerId: string,
    data: Prisma.ProjectCreateInput
): Promise<Project> => {

    if (
        !data.title ||
        !data.description ||
        !data.skills ||
        !data.duration ||
        !data.startDate ||
        !data.category
    ) {
        throw new Error(
            "Missing required project fields (title, description, skills, duration, startDate, category)"
        );
    }

    return prisma.$transaction(async (tx) => {

        // 🔹 Normalize skills
        const skillsString =
            Array.isArray(data.skills)
                ? data.skills.join(",")
                : String(data.skills);

        // 🔹 Create project with OWNER CONNECT (✅ الحل)
        const project = await tx.project.create({
            data: {
                ...data,
                skills: skillsString,
                owner: {
                    connect: { id: ownerId },
                },
            },
        });

        // 🔹 Add owner as admin member
        await tx.projectMember.create({
            data: {
                userId: ownerId,
                projectId: project.id,
                role: "admin",
            },
        });

        return project;
    });
};

/**
 * ===============================
 * Get Projects (Public / Explore)
 * ===============================
 */
export const getProjects = async (
    limit = 10,
    offset = 0
): Promise<Project[]> => {
    return prisma.project.findMany({
        where: { isDeleted: false },
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                },
            },
        },
    });
};

/**
 * ===============================
 * Get My Projects
 * ===============================
 */
export const getMyProjects = async (userId: string): Promise<Project[]> => {
    return prisma.project.findMany({
        where: {
            ownerId: userId,
            deletedAt: null,
            isDeleted: false,
        },
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { members: true },
            },
        },
    });
};

/**
 * ===============================
 * Get Joined Projects
 * ===============================
 */
export const getJoinedProjects = async (userId: string): Promise<Project[]> => {
    return prisma.project.findMany({
        where: {
            members: { some: { userId } },
            NOT: { ownerId: userId },
            deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { members: true },
            },
        },
    });
};

/**
 * ===============================
 * Pending Join Requests Count
 * ===============================
 */
export const getPendingRequests = async (userId: string): Promise<number> => {
    return prisma.joinRequest.count({
        where: {
            project: { ownerId: userId },
            status: "pending",
        },
    });
};

/**
 * ===============================
 * Get Project By ID
 * ===============================
 */
export const getProjectById = async (
    id: string
): Promise<Project | null> => {
    return prisma.project.findFirst({
        where: { id, deletedAt: null },
        include: {
            owner: {
                select: { id: true, name: true, avatarUrl: true },
            },
            members: {
                include: {
                    user: {
                        select: { id: true, name: true, avatarUrl: true },
                    },
                },
            },
        },
    });
};

/**
 * ===============================
 * Update Project
 * ===============================
 */
export const updateProject = async (
    projectId: string,
    userId: string,
    data: Prisma.ProjectUpdateInput
): Promise<Project> => {
    return prisma.$transaction(async (tx) => {

        const project = await tx.project.findUnique({
            where: { id: projectId },
        });

        if (!project) throw new Error("Project not found");
        if (project.ownerId !== userId) throw new Error("Unauthorized");
        if (project.deletedAt) throw new Error("Cannot edit deleted project");

        // Save history
        await tx.projectHistory.create({
            data: {
                projectId: project.id,
                title: project.title,
                description: project.description,
                skills: project.skills,
                category: project.category,
                duration: project.duration,
                startDate: project.startDate,
                version: project.version,
                updatedBy: userId,
            },
        });

        // Normalize skills
        const updatedData: Prisma.ProjectUpdateInput = {
            ...data,
            ...(data.skills && Array.isArray(data.skills)
                ? { skills: data.skills.join(",") }
                : {}),
        };

        return tx.project.update({
            where: { id: projectId },
            data: {
                ...updatedData,
                version: { increment: 1 },
            },
        });
    });
};

/**
 * ===============================
 * Delete Project (Soft)
 * ===============================
 */
export const deleteProject = async (
    projectId: string,
    userId: string
): Promise<Project> => {

    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) throw new Error("Project not found");
    if (project.ownerId !== userId) throw new Error("Unauthorized");

    return prisma.project.update({
        where: { id: projectId },
        data: {
            deletedAt: new Date(),
            isDeleted: true,
            isActive: false,
        },
    });
};

/**
 * ===============================
 * Project Messages
 * ===============================
 */
export const getProjectMessages = async (projectId: string) => {
    return prisma.projectMessage.findMany({
        where: { projectId },
        orderBy: { createdAt: "asc" },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                },
            },
        },
    });
};

export const createProjectMessage = async (
    projectId: string,
    senderId: string,
    content: string
) => {
    return prisma.projectMessage.create({
        data: { projectId, senderId, content },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                },
            },
        },
    });
};
