import { Response } from "express";
import { AuthRequest } from "../types/express";
import prisma from "../services/prisma";
import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

/**
 * Get current user (Me)
 */
export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                title: true,
                bio: true,
                skills: true,
                linkedin: true,
                github: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Removed URL construction - frontend handles full URL logic
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Update current user (Me)
 */
export const updateMe = async (req: AuthRequest, res: Response) => {
    try {
        const { name, title, bio, skills, linkedin, github } = req.body;
        const userData: any = { name, title, bio, linkedin, github };

        // Process skills safely
        if (skills) {
            if (typeof skills === "string") {
                try {
                    userData.skills = JSON.parse(skills);
                } catch {
                    userData.skills = skills.split(",").map((s) => s.trim());
                }
            } else if (Array.isArray(skills)) {
                userData.skills = skills;
            }
        }

        // Upload new avatar and handle old one
        if ((req as any).file) {
            const file = (req as any).file;
            console.log("File uploaded:", file.filename);

            if (req.user!.avatarUrl) {
                const oldPath = path.join(UPLOADS_DIR, req.user!.avatarUrl);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            userData.avatarUrl = file.filename;
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user!.id },
            data: userData,
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                title: true,
                bio: true,
                skills: true,
                linkedin: true,
                github: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // Removed URL construction - frontend handles full URL logic
        res.json(updatedUser);
    } catch (error: any) {
        console.error("Update profile failed:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get user profile (Public)
 */
export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                title: true,
                bio: true,
                skills: true,
                linkedin: true,
                github: true,
                createdAt: true,
            },
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Removed URL construction - frontend handles full URL logic
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user!.role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                title: true,
                bio: true,
                skills: true,
                linkedin: true,
                github: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // Removed URL construction - frontend handles full URL logic
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
