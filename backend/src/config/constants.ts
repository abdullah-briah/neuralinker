import path from 'path';
import fs from 'fs';

// Define Uploads Directory relative to the project root (backend/)
export const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
