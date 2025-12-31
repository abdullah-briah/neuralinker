import { Request } from "express";
import { UserRole } from "@prisma/client";

export interface UserPayload {
    id: string;
    email: string;
    role: UserRole;        // "user" | "admin"
    name?: string;         // ✅ مطلوب
    avatarUrl?: string;    // ✅ مطلوب
}

export interface AuthRequest extends Request {
    user?: UserPayload;
}
