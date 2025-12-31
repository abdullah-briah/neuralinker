import nodemailer from "nodemailer";

// إنشاء الـ transporter للبريد
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,           // مثال: smtp.gmail.com
    port: Number(process.env.EMAIL_PORT),   // مثال: 465
    secure: true,                           // true إذا كان المنفذ 465
    auth: {
        user: process.env.EMAIL_USER,       // بريدك الإلكتروني
        pass: process.env.EMAIL_PASS,       // App Password من Gmail أو أي SMTP آخر
    },
});

// التحقق من اتصال الـ SMTP عند بدء التطبيق
transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP connection error:", error);
    } else {
        console.log("SMTP connection successful. Ready to send emails.");
    }
});

/**
 * إرسال رسالة التفعيل
 * @param email البريد الإلكتروني للمستخدم
 * @param token رمز التحقق
 */
export const sendVerificationEmail = async (email: string, token: string) => {
    try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

        const info = await transporter.sendMail({
            from: `"Neuralinker" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify your email",
            html: `
                <h2>Welcome to Neuralinker!</h2>
                <p>Please verify your email by clicking the link below:</p>
                <a href="${verificationLink}">Verify Email</a>
            `,
        });

        console.log(`Verification email sent to ${email}`);
        console.log("Message ID:", info.messageId);
        return true;
    } catch (error: any) {
        console.error("Error sending verification email:", error.message);
        return false;
    }
};
