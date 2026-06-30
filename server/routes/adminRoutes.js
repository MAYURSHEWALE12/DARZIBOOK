import { Router } from 'express';
import { adminLogin, listTenants, getTenantDetail, updateTenantStatus, updateTenantPlan, listPlans, updatePlan, getMetrics } from '../controllers/adminController.js';
import { superAdminAuth } from '../middlewares/superAdminAuth.js';

const router = Router();

router.post('/login', adminLogin);

router.use(superAdminAuth);
router.get('/tenants', listTenants);
router.get('/tenants/:id', getTenantDetail);
router.patch('/tenants/:id/status', updateTenantStatus);
router.patch('/tenants/:id/plan', updateTenantPlan);
router.get('/plans', listPlans);
router.put('/plans/:id', updatePlan);
router.get('/metrics', getMetrics);

export default router;
