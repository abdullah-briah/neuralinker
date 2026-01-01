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
 * Register - Optimized
 * ===============================
 */
export const register = async (data: Prisma.UserCreateInput): Promise<User> => {
    // 1️⃣ تحقق إذا البريد موجود
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) throw new Error('Email is already registered');

    // 2️⃣ Hash كلمة المرور بسرعة وأمان
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3️⃣ إنشاء المستخدم في قاعدة البيانات
    const user = await prisma.user.create({
        data: {
            ...data,
            password: hashedPassword,
            isVerified: false,
        },
    });

    // 4️⃣ إنشاء رمز التحقق
    const verificationToken = jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: '1d' }
    );

    // 5️⃣ إرسال البريد في الخلفية بدون انتظار (fire & forget)
    emailService.sendVerificationEmail(user.email, verificationToken)
        .then(sent => {
            if (!sent) console.warn(`⚠️ Failed to send verification email to ${user.email}`);
            else console.log(`✅ Verification email sent to ${user.email}`);
        })
        .catch(err => console.error('Error sending verification email:', err));

    // 6️⃣ إعادة المستخدم مباشرة → response سريع جداً
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

    // إرسال البريد في الخلفية أيضاً
    emailService.sendVerificationEmail(user.email, verificationToken)
        .then(sent => {
            if (!sent) throw new Error(`Failed to resend verification email to ${email}`);
        })
        .catch(console.error);
};
