// src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Prisma } from '@prisma/client';
import prisma from './prisma';
import * as emailService from './email.service';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

/**
 * ===============================
 * Register
 * ===============================
 */
export const register = async (data: Prisma.UserCreateInput): Promise<User> => {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

    if (existingUser) {
        if (existingUser.isVerified) {
            throw new Error('Email is already registered');
        }

        // إذا كان المستخدم غير مفعل، قم بتحديث بياناته وإعادة إرسال رمز التحقق
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const updatedUser = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                name: data.name,
                password: hashedPassword,
            },
        });

        // أنشئ توكن التحقق بصلاحية يوم واحد
        const verificationToken = jwt.sign({ id: updatedUser.id }, JWT_SECRET, { expiresIn: '1d' });

        try {
            console.log(`🔄 Resending verification email for re-registration to ${updatedUser.email}...`);
            const sent = await emailService.sendVerificationEmail(updatedUser.email, verificationToken);
            if (!sent) throw new Error(`⚠️ Failed to send verification email to ${updatedUser.email}`);
            console.log(`✅ Verification email resent to ${updatedUser.email}`);
        } catch (err: any) {
            console.error('❌ Error sending verification email:', err.message || err);
        }

        return updatedUser;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
        data: { ...data, password: hashedPassword, isVerified: false },
    });

    // أنشئ توكن التحقق بصلاحية يوم واحد
    const verificationToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

    try {
        console.log(`🔄 Sending verification email to ${user.email}...`);
        const sent = await emailService.sendVerificationEmail(user.email, verificationToken);
        if (!sent) throw new Error(`⚠️ Failed to send verification email to ${user.email}`);
        console.log(`✅ Verification email sent to ${user.email}`);
    } catch (err: any) {
        console.error('❌ Error sending verification email:', err.message || err);
    }

    return user;
};

/**
 * ===============================
 * Login
 * ===============================
 */
export const login = async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid credentials');

    if (!user.isVerified) throw new Error('Please verify your email before logging in.');

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    return { token, user };
};

/**
 * ===============================
 * Verify Email
 * ===============================
 */
export const verifyEmail = async (token: string): Promise<User> => {
    try {
        // فك تشفير token قبل التحقق للتأكد من صحته
        const decoded: any = jwt.verify(decodeURIComponent(token), JWT_SECRET);
        const userId = decoded.id;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');

        // إذا مفعل مسبقاً، أرجع المستخدم بدون خطأ
        if (user.isVerified) return user;

        return await prisma.user.update({
            where: { id: userId },
            data: { isVerified: true },
        });
    } catch (error: any) {
        // رسائل دقيقة لتسهيل Debug
        if (error.name === 'TokenExpiredError') throw new Error('Verification token has expired');
        if (error.name === 'JsonWebTokenError') throw new Error('Invalid verification token');
        throw new Error('Failed to verify email');
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

    if (user.isVerified) throw new Error('Email is already verified.');

    // أنشئ توكن جديد بصلاحية يوم واحد
    const verificationToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

    try {
        console.log(`🔄 Resending verification email to ${user.email}...`);
        const sent = await emailService.sendVerificationEmail(user.email, verificationToken);
        if (!sent) throw new Error(`⚠️ Failed to resend verification email to ${email}`);
        console.log(`✅ Resent verification email to ${user.email}`);
    } catch (err: any) {
        console.error('❌ Error resending verification email:', err.message || err);
        throw err;
    }
};
