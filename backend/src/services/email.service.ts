// src/services/email.service.ts
import sgMail from "@sendgrid/mail";

// ===== إعداد المتغيرات من البيئة =====
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "service@neuralinker.com";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// التأكد من وجود مفتاح SendGrid
if (!SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY is not defined in environment variables");
}

// ===== تفعيل SendGrid =====
sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * إرسال رسالة التفعيل للمستخدم
 * @param email البريد الإلكتروني للمستخدم
 * @param token رمز التحقق
 * @returns true إذا تم الإرسال بنجاح، false إذا فشل
 */
export const sendVerificationEmail = async (email: string, token: string): Promise<boolean> => {
    try {
        // 🔑 تشفير الـ token لمنع أي تشوه عند النقل عبر الرابط
        const verificationLink = `${FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

        console.log(`🔄 Sending verification email to: ${email}`);
        console.log(`🔗 Verification link: ${verificationLink}`);

        // تكوين الرسالة
        const msg = {
            to: email,
            from: EMAIL_FROM,
            subject: "✅ Verify your Neuralinker account",
            html: `
                <div style="font-family: Arial, sans-serif; line-height:1.5; color:#333;">
                    <h2 style="color:#10b981;">Welcome to Neuralinker!</h2>
                    <p>Please verify your email by clicking the link below:</p>
                    <a href="${verificationLink}" target="_blank" 
                       style="display:inline-block; padding:10px 20px; background:#10b981; color:white; text-decoration:none; border-radius:5px;">
                       Verify Email
                    </a>
                    <p>If you did not register, please ignore this email.</p>
                    <hr />
                    <p style="font-size:12px; color:#999;">
                        Neuralinker Inc., 123 Neural Lane, Neural City, NC 12345
                    </p>
                </div>
            `,
        };

        const response = await sgMail.send(msg);
        console.log(`📧 Verification email sent to ${email} (Status: ${response[0].statusCode})`);
        return true;
    } catch (error: any) {
        console.error(`❌ Failed to send verification email to ${email}:`, error.message || error);
        return false;
    }
};
