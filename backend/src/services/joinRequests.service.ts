import { JoinRequest, Prisma } from "@prisma/client";
import prisma from "./prisma";
import * as notificationService from "./notifications.service";
import { analyzeAndSaveInsight } from "./ai.service";

/**
 * ===============================
 * Helpers
 * ===============================
 */
const normalizeSkills = (skills: Prisma.JsonValue | string | null): string[] => {
    if (!skills) return [];

    if (Array.isArray(skills)) {
        return skills
            .filter(s => typeof s === "string")
            .map(s => s.trim());
    }

    if (typeof skills === "string") {
        return skills
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);
    }

    return [];
};

/**
 * ===============================
 * Create Join Request
 * ===============================
 */
export const createRequest = async (
    projectId: string,
    userId: string
): Promise<JoinRequest> => {

    const existingMember = await prisma.projectMember.findFirst({
        where: { projectId, userId },
    });

    if (existingMember) {
        throw new Error("User is already a member of this project");
    }

    const existingRequest = await prisma.joinRequest.findFirst({
        where: {
            projectId,
            userId,
            status: "pending",
        },
    });

    if (existingRequest) {
        throw new Error("Join request already sent");
    }

    const joinRequest = await prisma.joinRequest.create({
        data: {
            projectId,
            userId,
        },
        include: {
            project: true,
            user: true,
        },
    });

    /* ===============================
       4️⃣ 🧠 AI Match Analysis + Save
    =============================== */

    let aiScore = 0;
    let matchReason = "";

    try {
        const userSkills = normalizeSkills(joinRequest.user.skills);
        const projectSkills = normalizeSkills(joinRequest.project.skills);

        const insight = await analyzeAndSaveInsight(
            joinRequest.id,
            {
                name: joinRequest.user.name,
                title: joinRequest.user.title || "",
                bio: joinRequest.user.bio || "",
                skills: userSkills,
            },
            {
                title: joinRequest.project.title,
                shortDescription: joinRequest.project.description, // ✅ mapping صحيح
                requiredSkills: projectSkills,                    // ✅ الاسم الصحيح
                category: joinRequest.project.category,
            }
        );

        aiScore = insight.score;

        if (
            insight.result &&
            typeof insight.result === "object" &&
            "reason" in insight.result
        ) {
            matchReason = String((insight.result as any).reason);
        }

        console.log("✅ AI Insight saved:", insight.id);

    } catch (error) {
        console.error("❌ AI Match Error:", error);
    }

    /* ===============================
       5️⃣ 🔔 Notification
    =============================== */

    const reasonPreview = matchReason
        ? ` Reason: ${matchReason.split(".")[0]}.`
        : "";

    await notificationService.createNotification({
        userId: joinRequest.project.ownerId,
        title: "Join Request",
        message: `${joinRequest.user.name} wants to join ${joinRequest.project.title}. Match Score: ${aiScore}%${reasonPreview}`,
        joinRequestId: joinRequest.id,
        projectId: joinRequest.projectId,
    });

    return joinRequest;
};

/**
 * ===============================
 * Get Project Join Requests
 * ===============================
 */
export const getProjectRequests = async (
    projectId: string
): Promise<JoinRequest[]> => {
    return prisma.joinRequest.findMany({
        where: { projectId },
        include: {
            user: true,
            aiInsight: true,
        },
        orderBy: { createdAt: "desc" },
    });
};

/**
 * ===============================
 * Accept / Reject Join Request
 * ===============================
 */
export const updateStatus = async (
    requestId: string,
    status: "accepted" | "rejected"
): Promise<JoinRequest> => {

    return prisma.$transaction(async (tx) => {

        const request = await tx.joinRequest.findUnique({
            where: { id: requestId },
            include: { project: true },
        });

        if (!request) {
            throw new Error("Join request not found");
        }

        if (request.status !== "pending") {
            throw new Error("Join request already processed");
        }

        const updatedRequest = await tx.joinRequest.update({
            where: { id: requestId },
            data: { status },
        });

        if (status === "accepted") {
            await tx.projectMember.create({
                data: {
                    userId: request.userId,
                    projectId: request.projectId,
                    role: "member",
                },
            });

            await notificationService.createNotification({
                userId: request.userId,
                title: "Join Request Accepted",
                message: `You have been accepted into project "${request.project.title}"`,
                projectId: request.projectId,
            });
        } else {
            await notificationService.createNotification({
                userId: request.userId,
                title: "Join Request Rejected",
                message: `Your request to join "${request.project.title}" was rejected.`,
                projectId: request.projectId,
            });
        }

        return updatedRequest;
    });
};

/**
 * ===============================
 * Count Pending Requests
 * ===============================
 */
export const countPendingRequests = async (
    ownerId: string
): Promise<number> => {
    return prisma.joinRequest.count({
        where: {
            project: { ownerId },
            status: "pending",
        },
    });
};
