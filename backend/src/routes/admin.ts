import express from 'express';
import * as adminController from '../controllers/admin.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// Route Protection: Authenticated + Admin Role
const protectAdmin = [authMiddleware, roleMiddleware(['admin'])];

router.get('/stats', ...protectAdmin, adminController.getDashboardStats);
router.get('/users', ...protectAdmin, adminController.getUsers);
router.get('/projects', ...protectAdmin, adminController.getProjects);
router.get('/requests', ...protectAdmin, adminController.getJoinRequests);

// Action Routes
router.delete('/users/:id', ...protectAdmin, adminController.deleteUser);
router.delete('/projects/:id', ...protectAdmin, adminController.deleteProject);
router.patch('/requests/:id', ...protectAdmin, adminController.updateJoinRequestStatus);

export default router;
