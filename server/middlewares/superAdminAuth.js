import jwt from 'jsonwebtoken';
import { SuperAdmin } from '../models/index.js';

export const superAdminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Admin authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await SuperAdmin.findById(decoded.id);
    if (!admin) return res.status(401).json({ error: 'Invalid admin' });

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid admin token' });
  }
};
