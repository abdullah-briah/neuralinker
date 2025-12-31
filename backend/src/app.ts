import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import joinRequestRoutes from './routes/joinRequests';
import memberRoutes from './routes/members';
import notificationRoutes from './routes/notifications';
import aiRoutes from './routes/ai';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';

import { UPLOADS_DIR } from './config/constants';

const app = express();

// CORS Configuration
const corsOptions = {
    origin: [
        "https://neuralinker-sadl.vercel.app", // الدومين الرئيسي
        "https://neuralinker-sadl-git-main-abdullah-ahmed-briahs-projects.vercel.app", // Preview
        "https://neuralinker-sadl-qh0oeh8sb-abdullah-ahmed-briahs-projects.vercel.app" // Preview
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200 // لتجنب مشاكل بعض المتصفحات مع preflight
};

app.use(cors(corsOptions));

// Middlewares
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(morgan('dev'));
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(UPLOADS_DIR));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/join-requests', joinRequestRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.send('Neuralinker Backend is running');
});

export default app;
