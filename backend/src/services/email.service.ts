import nodemailer from "nodemailer";

// إنشاء transporter للبريد
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.sendgrid.net",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465, // true للـ 465، false للـ 587
    auth: {
        user: process.env.EMAIL_USER, // عند SendGrid دائماً "apikey"
        pass: process.env.EMAIL_PASS, // مفتاح API من SendGrid
    },
});

// تحقق من اتصال SMTP عند بدء السيرفر
(async () => {
    try {
        console.log("🔄 Verifying SMTP connection...");
        const success = await transporter.verify();
        console.log("✅ SMTP connection successful:", success);
    } catch (err: any) {
        console.error("❌ SMTP connection failed:", err);
    }
})();

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

        const info = await transporter.sendMail({
            from: `"Neuralinker" <neuralinkerservice@gmail.com>`, // البريد الموثق في SendGrid
            to: email,
            subject: "✅ Verify your Neuralinker account",
            html: `
                <h2>Welcome to Neuralinker!</h2>
                <p>Please verify your email by clicking the link below:</p>
                <a href="${verificationLink}" target="_blank" style="padding:10px 20px; background:#10b981; color:white; text-decoration:none; border-radius:5px;">Verify Email</a>
                <p>If you did not register, please ignore this email.</p>
                <hr />
                <p style="font-size:12px; color:#999;">
                    Neuralinker Inc., 123 Neural Lane, Neural City, NC 12345
                </p>
            `,
        });

        console.log(`📧 Verification email sent to ${email} (Message ID: ${info.messageId})`);
        return true;
    } catch (error: any) {
        console.error(`❌ Failed to send verification email to ${email}:`, error.message);
        return false;
    }
};
