import { Router } from 'express';
import multer from "multer";
import path from 'path';
import fs from 'fs';
import { getMe, updateMe, getAllUsers, getProfile } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { UPLOADS_DIR } from '../config/constants';

const router = Router();

// Authentication Middleware
router.use(authMiddleware);

// ===========================
// Multer Storage Configuration
// ===========================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        // إزالة أي مسافات قبل وبعد الامتداد
        const ext = file.originalname.split(".").pop()?.trim().toLowerCase();
        const filename = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
        console.log("Generated filename:", filename); // تحقق من اسم الملف النهائي
        cb(null, filename);
    },
});

// Optional: فقط قبول الملفات ذات امتداد الصور
const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed!"), false);
    }
};

const upload = multer({ storage, fileFilter });

// Routes
router.get('/me', getMe);
router.put('/me', upload.single("avatar"), updateMe);
router.get('/:id', getProfile);
router.get('/', getAllUsers);

export default router;
