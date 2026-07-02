import { Router } from 'express';
import { createExpense, listExpenses, deleteExpense } from '../controllers/expenseController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createExpense);
router.get('/', listExpenses);
router.delete('/:id', deleteExpense);

export default router;
