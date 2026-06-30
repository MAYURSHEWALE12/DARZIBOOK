import { Router } from 'express';
import { listCustomers, createCustomer, getCustomer, updateCustomer, deleteCustomer, uploadCustomerPhoto } from '../controllers/customerController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { planGuard } from '../middlewares/planGuard.js';
import { uploadSingle } from '../middlewares/upload.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listCustomers);
router.post('/', planGuard('create_customer'), createCustomer);
router.get('/:id', getCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);
router.post('/:id/photo', uploadSingle, uploadCustomerPhoto);

export default router;
