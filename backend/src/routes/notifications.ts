import { Router } from 'express';
import * as notificationController from '../controllers/notifications.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', notificationController.list);
router.put('/:id/read', notificationController.read);

export default router;
