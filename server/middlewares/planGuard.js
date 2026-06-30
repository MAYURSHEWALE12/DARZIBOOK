import { Subscription, Plan } from '../models/index.js';

export const planGuard = (feature) => {
  return async (req, res, next) => {
    try {
      const subscription = await Subscription.findOne({ tenantId: req.tenantId });
      if (!subscription || (subscription.status !== 'trial' && subscription.status !== 'active')) {
        return res.status(402).json({ error: 'PAYMENT_REQUIRED', message: 'Active subscription required' });
      }

      if (subscription.status === 'trial' && new Date() > subscription.trialEndsAt) {
        subscription.status = 'expired';
        await subscription.save();
        return res.status(402).json({ error: 'TRIAL_EXPIRED', message: 'Trial period has ended. Please subscribe.' });
      }

      const plan = await Plan.findOne({ name: subscription.plan });
      if (!plan) return next();

      const limits = plan.limits;
      switch (feature) {
        case 'create_customer': {
          if (limits.maxCustomers === -1) return next();
          const { Customer } = await import('../models/index.js');
          const count = await Customer.countDocuments({ tenantId: req.tenantId });
          if (count >= limits.maxCustomers) {
            return res.status(403).json({ error: 'PLAN_LIMIT_CUSTOMERS', message: 'Customer limit reached for your plan' });
          }
          break;
        }
        case 'upload_photo': {
          if (limits.maxPhotosPerOrder === -1) return next();
          break;
        }
        case 'custom_garment': {
          if (limits.maxGarmentTypes === -1) return next();
          const { MeasurementTemplate } = await import('../models/index.js');
          const count = await MeasurementTemplate.countDocuments({ tenantId: req.tenantId });
          if (count >= limits.maxGarmentTypes) {
            return res.status(403).json({ error: 'PLAN_LIMIT_GARMENTS', message: 'Garment type limit reached' });
          }
          break;
        }
        case 'pdf_export': {
          if (!limits.pdfExport) {
            return res.status(403).json({ error: 'PLAN_FEATURE', message: 'PDF export not available on your plan' });
          }
          break;
        }
        case 'full_reports': {
          if (!limits.fullReports) {
            return res.status(403).json({ error: 'PLAN_FEATURE', message: 'Full reports not available on your plan' });
          }
          break;
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
