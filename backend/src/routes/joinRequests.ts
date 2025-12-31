import { Router } from 'express';
import * as joinRequestController from '../controllers/joinRequests.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

// إنشاء طلب انضمام
router.post('/', joinRequestController.create);

// عرض طلبات مشروع (مالك المشروع فقط)
router.get('/:projectId', joinRequestController.listProjectRequests);

// الرد على طلب (قبول/رفض)
router.patch('/:id/respond', joinRequestController.respond);

// الحصول على تفاصيل طلب معين
router.get('/request/:id', joinRequestController.getById);

export default router;
