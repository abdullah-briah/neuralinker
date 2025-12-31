import multer from 'multer';
import path from 'path';
import fs from 'fs';

// مجلد تخزين الصور (تأكد أن المجلد موجود)
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// إعدادات multer
export const avatarUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            cb(null, file.fieldname + '-' + uniqueSuffix + ext);
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.test(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG/PNG images are allowed'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
