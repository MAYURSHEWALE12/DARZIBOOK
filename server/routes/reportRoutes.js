import { Router } from 'express';
import { getSummary, getPendingDues, getOrderReport, getRevenueReport } from '../controllers/reportController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/summary', getSummary);
router.get('/pending-dues', getPendingDues);
router.get('/orders', getOrderReport);
router.get('/revenue', getRevenueReport);

export default router;
