import { Router } from 'express';
import * as projectController from '../controllers/projects.controller';
import { authMiddleware, projectOwnerMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

// Projects CRUD
router.post('/', projectController.create);
router.get('/', projectController.list);

// User specific projects
router.get('/my', projectController.getMyProjects);
router.get('/joined', projectController.getJoinedProjects);

// Join Requests for owner's projects (Place before /:id to prevent blocking)
router.get('/:projectId/join-requests', projectOwnerMiddleware, projectController.getJoinRequests);

router.get('/:id', projectController.get);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.remove);

// ✅ New: Join a project (any user except owner)
router.post('/:projectId/join', projectController.joinProject);

// ✅ Project Chat
router.get('/:id/messages', projectController.getMessages);
router.post('/:id/messages', projectController.sendMessage);

export default router;
