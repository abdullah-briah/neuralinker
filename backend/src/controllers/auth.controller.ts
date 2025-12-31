import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json(user);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json(result);
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const token = req.query.token as string;
        if (!token) throw new Error("Token is required");

        await authService.verifyEmail(token);
        res.json({ message: 'Email verified successfully! You can now login.' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const resendVerification = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        await authService.resendVerification(email);
        res.json({ message: 'Verification email resent successfully.' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
