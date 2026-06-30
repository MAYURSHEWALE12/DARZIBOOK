import jwt from 'jsonwebtoken';
import { Tenant } from '../models/index.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tenant = await Tenant.findById(decoded.id).select('-passwordHash');
    if (!tenant || !tenant.isActive) return res.status(401).json({ error: 'Invalid or deactivated account' });

    req.tenantId = tenant._id;
    req.tenant = tenant;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};
