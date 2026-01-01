import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

/**
 * ===============================
 * Register Controller - Fast & Optimized
 * ===============================
 */
export const register = async (req: Request, res: Response) => {
    try {
        const user = await authService.register(req.body);

        // 201 Created مباشرة → لا ينتظر البريد
        res.status(201).json({
            message: 'User registered successfully!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
                role: user.role,
            }
        });

        // البريد يُرسل في الخلفية بالفعل من auth.service
    } catch (error: any) {
        console.error('Register Error:', error.message);
        res.status(400).json({ message: error.message });
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
        const result = await authService.login(email, password);

        res.status(200).json({
            message: 'Login successful!',
            token: result.token,
            user: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                isVerified: result.user.isVerified,
                role: result.user.role,
            }
        });
    } catch (error: any) {
        console.error('Login Error:', error.message);
        res.status(401).json({ message: error.message });
    }
};

/**
 * ===============================
 * Verify Email Controller
 * ===============================
 */
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const token = req.query.token as string;
        if (!token) throw new Error("Token is required");

        await authService.verifyEmail(token);

        res.status(200).json({ message: 'Email verified successfully! You can now login.' });
    } catch (error: any) {
        console.error('Verify Email Error:', error.message);
        res.status(400).json({ message: error.message });
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
        await authService.resendVerification(email);

        res.status(200).json({ message: 'Verification email resent successfully.' });
    } catch (error: any) {
        console.error('Resend Verification Error:', error.message);
        res.status(400).json({ message: error.message });
    }
};
