// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

/**
 * ===============================
 * Register Controller
 * ===============================
 */
export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required.'
            });
        }

        const user = await authService.register({ name, email, password });
        console.log(`✅ User registered: ${user.email}`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully! Check your email to verify.',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.error('❌ Register Error:', error.stack || error);
        res.status(400).json({
            success: false,
            message: error.message || 'Registration failed'
        });
    }
};

/**
 * ===============================
 * Login Controller
 * ===============================
 */
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        const result = await authService.login(email, password);
        console.log(`🔑 User logged in: ${result.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            data: {
                token: result.token,
                user: {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                    isVerified: result.user.isVerified,
                    role: result.user.role,
                },
            },
        });
    } catch (error: any) {
        console.error('❌ Login Error:', error.stack || error);
        res.status(401).json({
            success: false,
            message: error.message || 'Login failed'
        });
    }
};

/**
 * ===============================
 * Verify Email Controller
 * ===============================
 */
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const tokenParam = req.query.token as string;

        if (!tokenParam) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required.'
            });
        }

        // فك التشفير قبل الإرسال إلى الخدمة للتأكد من عدم حدوث تشوه في الرابط
        const token = decodeURIComponent(tokenParam);

        const user = await authService.verifyEmail(token);
        console.log(`✅ Email verified for: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now login.'
        });
    } catch (error: any) {
        console.error('❌ Verify Email Error:', error.stack || error);
        res.status(400).json({
            success: false,
            message: error.message || 'Email verification failed'
        });
    }
};

/**
 * ===============================
 * Resend Verification Email Controller
 * ===============================
 */
export const resendVerification = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required.'
            });
        }

        await authService.resendVerification(email);
        console.log(`🔄 Verification email resent to: ${email}`);

        res.status(200).json({
            success: true,
            message: 'Verification email resent successfully.'
        });
    } catch (error: any) {
        console.error('❌ Resend Verification Error:', error.stack || error);
        res.status(400).json({
            success: false,
            message: error.message || 'Resending verification failed'
        });
    }
};
