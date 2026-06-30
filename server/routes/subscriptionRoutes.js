import { Router } from 'express';
import { getCurrentSubscription, createOrder, verifyPayment, cancelSubscription } from '../controllers/subscriptionController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/current', getCurrentSubscription);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/cancel', cancelSubscription);

export default router;
