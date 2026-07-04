import { Router } from 'express';
import { listOrders, createOrder, getOrder, updateOrder, updateOrderStatus, deleteOrder, uploadOrderPhotos, deleteOrderPhoto } from '../controllers/orderController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { planGuard } from '../middlewares/planGuard.js';
import { uploadArray, handleUploadError } from '../middlewares/upload.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listOrders);
router.post('/', createOrder);
router.get('/:id', getOrder);
router.put('/:id', updateOrder);
router.patch('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);
router.post('/:id/photos', planGuard('upload_photo'), uploadArray, handleUploadError, uploadOrderPhotos);
router.delete('/:id/photos/:photoId', deleteOrderPhoto);

export default router;
