import { Router } from 'express';
import { listCustomerPayments, createPayment } from '../controllers/paymentController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/customer/:customerId', listCustomerPayments);
router.post('/', createPayment);

export default router;
