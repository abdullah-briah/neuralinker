import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

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

// ===== CORS Configuration =====
const corsOptions = {
    origin: [
        "http://localhost:5173",
        "https://neuralinker-sadl.vercel.app",
        "https://neuralinker-sadl-9ok0y5443-abdullah-ahmed-briahs-projects.vercel.app",
        "https://neuralinker-sadl-git-main-abdullah-ahmed-briahs-projects.vercel.app",
        "https://neuralinker-sadl-j0sq7uh5r-abdullah-ahmed-briahs-projects.vercel.app",
        "https://neuralinker-sadl-qh0oeh8sb-abdullah-ahmed-briahs-projects.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ===== Middlewares =====
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan('dev'));
app.use(express.json());

// ===== Health Endpoint =====
app.get('/api/health', (req, res) => {
    res.json({ status: "ok" });
});

// ===== Serve uploaded files =====
app.use('/uploads', express.static(UPLOADS_DIR));

// ===== Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/join-requests', joinRequestRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// ===== Root endpoint =====
app.get('/', (req, res) => {
    res.send('Neuralinker Backend is running');
});


export default app;
