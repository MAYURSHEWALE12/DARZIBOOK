import express from 'express';
import { listStaff, createStaff, getStaff, updateStaff, deleteStaff } from '../controllers/staffController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listStaff);
router.post('/', createStaff);
router.get('/:id', getStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

export default router;
