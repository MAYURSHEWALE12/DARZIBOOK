import express from 'express';
import { listTransactions, createTransaction, deleteTransaction } from '../controllers/salaryController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/staff/:staffId', listTransactions);
router.post('/', createTransaction);
router.delete('/:id', deleteTransaction);

export default router;
