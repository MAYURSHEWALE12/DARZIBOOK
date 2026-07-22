import { Router } from 'express';
import { listCustomerPayments, createPayment, listOrderPayments } from '../controllers/paymentController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/customer/:customerId', listCustomerPayments);
router.get('/order/:orderId', listOrderPayments);
router.post('/', createPayment);

export default router;
