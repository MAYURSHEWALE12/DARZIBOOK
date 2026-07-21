import { Subscription, Plan } from '../models/index.js';

export const planGuard = (feature) => {
  return async (req, res, next) => {
    // TEMPORARILY DISABLED: Bypassing all subscription checks
    next();
  };
};
