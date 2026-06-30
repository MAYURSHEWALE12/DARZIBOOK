import { Router } from 'express';
import { getProfile, updateProfile, uploadLogo } from '../controllers/profileController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { uploadLogo as uploadLogoMiddleware } from '../middlewares/upload.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/logo', uploadLogoMiddleware, uploadLogo);

export default router;
