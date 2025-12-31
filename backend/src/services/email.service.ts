import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,           // عادة smtp.gmail.com
    port: Number(process.env.EMAIL_PORT),   // عادة 465
    secure: true,                           // true للـ 465
    auth: {
        user: process.env.EMAIL_USER,         // بريدك الإلكتروني
        pass: process.env.EMAIL_PASS,         // App Password من Gmail
    },
});

export const sendVerificationEmail = async (email: string, token: string) => {
    try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

        await transporter.sendMail({
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
        return true;
    } catch (error) {
        console.error("Error sending verification email:", error);
        return false;
    }
};
