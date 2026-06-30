import express from 'express';
import { listAssignments, createAssignment, updateAssignment, deleteAssignment } from '../controllers/workAssignmentController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/staff/:staffId', listAssignments);
router.post('/', createAssignment);
router.put('/:id', updateAssignment);
router.delete('/:id', deleteAssignment);

export default router;
