import { Router } from 'express';
import { listTemplates, createTemplate, updateTemplate, deleteTemplate } from '../controllers/templateController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { planGuard } from '../middlewares/planGuard.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listTemplates);
router.post('/', planGuard('custom_garment'), createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

export default router;
