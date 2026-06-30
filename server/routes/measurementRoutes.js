import { Router } from 'express';
import { listCustomerMeasurements, listAllMeasurements, createMeasurement, getMeasurement, updateMeasurement } from '../controllers/measurementController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { uploadSingle, handleUploadError } from '../middlewares/upload.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listAllMeasurements);
router.get('/customer/:customerId', listCustomerMeasurements);
router.post('/', uploadSingle, handleUploadError, createMeasurement);
router.get('/:id', getMeasurement);
router.put('/:id', uploadSingle, handleUploadError, updateMeasurement);

export default router;
