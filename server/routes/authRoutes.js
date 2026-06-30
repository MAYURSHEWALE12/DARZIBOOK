import { Router } from 'express';
import { register, login, logout, refreshToken, getMe } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/auth.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts, please try again later' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/me', authMiddleware, getMe);

export default router;
