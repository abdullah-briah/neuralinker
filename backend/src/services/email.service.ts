// src/services/email.service.ts
import sgMail from '@sendgrid/mail';

// ضبط SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

/**
 * إرسال رسالة التفعيل
 * @param email البريد الإلكتروني للمستخدم
 * @param token رمز التحقق
 */
export const sendVerificationEmail = async (email: string, token: string): Promise<boolean> => {
    try {
        const frontendUrl = process.env.FRONTEND_URL || 'https://neuralinker-sadl.vercel.app';
        const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

        console.log(`🔄 Sending verification email to: ${email}`);

        const msg = {
            to: email,
            from: process.env.EMAIL_FROM!, // البريد الموثق في SendGrid
            subject: '✅ Verify your Neuralinker account',
            html: `
                <h2>Welcome to Neuralinker!</h2>
                <p>Please verify your email by clicking the link below:</p>
                <a href="${verificationLink}" target="_blank" style="padding:10px 20px; background:#10b981; color:white; text-decoration:none; border-radius:5px;">Verify Email</a>
                <p>If you did not register, please ignore this email.</p>
                <hr />
                <p style="font-size:12px; color:#999;">
                    Neuralinker Inc., 123 Neural Lane, Neural City, NC 12345
                </p>
            `
        };

        await sgMail.send(msg);

        console.log(`📧 Verification email sent to ${email}`);
        return true;
    } catch (error: any) {
        console.error(`❌ Failed to send verification email to ${email}:`, error.message);
        return false;
    }
};
