import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465, // true للـ 465، false للـ 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// تحقق من اتصال SMTP بشكل async
(async () => {
    try {
        await transporter.verify();
        console.log("✅ SMTP connection successful. Ready to send emails.");
    } catch (err: any) {
        console.error("❌ SMTP connection failed:", err.message);
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

        const info = await transporter.sendMail({
            from: `"Neuralinker" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "✅ Verify your Neuralinker account",
            html: `
                <h2>Welcome to Neuralinker!</h2>
                <p>Please verify your email by clicking the link below:</p>
                <a href="${verificationLink}" target="_blank" style="padding:10px 20px; background:#10b981; color:white; text-decoration:none; border-radius:5px;">Verify Email</a>
                <p>If you did not register, please ignore this email.</p>
            `,
        });

        console.log(`📧 Verification email sent to ${email} (Message ID: ${info.messageId})`);
        return true;
    } catch (error: any) {
        console.error(`❌ Failed to send verification email to ${email}:`, error.message);
        return false;
    }
};
