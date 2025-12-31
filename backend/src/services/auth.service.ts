import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Prisma } from '@prisma/client';
import prisma from './prisma';
import * as emailService from './email.service';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

/**
 * ===============================
 * Register
 * ===============================
 */
export const register = async (data: Prisma.UserCreateInput): Promise<User> => {
    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (existingUser) {
        throw new Error('Email is already registered');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user in DB
    const user = await prisma.user.create({
        data: {
            ...data,
            password: hashedPassword,
            isVerified: false, // Must exist in schema
        },
    });

    // Generate Verification Token
    const verificationToken = jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: '1d' }
    );

    // Send Verification Email
    const emailSent = await emailService.sendVerificationEmail(user.email, verificationToken);
    if (!emailSent) {
        console.warn(`Failed to send verification email to ${user.email}`);
    }

    return user;
};

/**
 * ===============================
 * Login
 * ===============================
 */
export const login = async (
    email: string,
    password: string
): Promise<{ token: string; user: User }> => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid credentials');

    // Force email verification
    if (!user.isVerified) throw new Error('Please verify your email before logging in.');

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '1d' }
    );

    return { token, user };
};

/**
 * ===============================
 * Verify Email
 * ===============================
 */
export const verifyEmail = async (token: string): Promise<User> => {
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');
        if (user.isVerified) throw new Error('Email already verified');

        return await prisma.user.update({
            where: { id: userId },
            data: { isVerified: true },
        });

    } catch (error) {
        throw new Error('Invalid or expired verification token');
    }
};

/**
 * ===============================
 * Resend Verification Email
 * ===============================
 */
export const resendVerification = async (email: string): Promise<void> => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');
    if (user.isVerified) throw new Error('Email already verified');

    const verificationToken = jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: '1d' }
    );

    const emailSent = await emailService.sendVerificationEmail(user.email, verificationToken);
    if (!emailSent) {
        throw new Error(`Failed to resend verification email to ${email}`);
    }
};
