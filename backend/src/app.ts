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
    origin: (origin, callback) => {
        // Allow all origins for now to fix access issues
        callback(null, true);
    },
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
