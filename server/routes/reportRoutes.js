import { Router } from 'express';
import { 
  getSummary, 
  getPendingDues, 
  getOrderReport, 
  getRevenueReport,
  getExpenseReport,
  getSalaryReport,
  getDailyStitchingReport
} from '../controllers/reportController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/summary', getSummary);
router.get('/pending-dues', getPendingDues);
router.get('/orders', getOrderReport);
router.get('/revenue', getRevenueReport);
router.get('/expenses', getExpenseReport);
router.get('/salary', getSalaryReport);
router.get('/daily-stitching', getDailyStitchingReport);

export default router;
