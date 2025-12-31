import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', aiController.create);
router.get('/:joinRequestId', aiController.get);

export default router;
