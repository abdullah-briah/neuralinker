import { Router } from 'express';
import * as memberController from '../controllers/members.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/project/:projectId', memberController.list);

export default router;
