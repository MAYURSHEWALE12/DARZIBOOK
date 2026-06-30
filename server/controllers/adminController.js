import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Tenant, Subscription, Plan, SuperAdmin } from '../models/index.js';

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const adminLogin = async (req, res) => {
  const data = adminLoginSchema.parse(req.body);
  const admin = await SuperAdmin.findOne({ email: data.email });
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(data.password, admin.passwordHash);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: admin._id, role: 'superadmin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.cookie('adminToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
  res.json({ admin: { email: admin.email, role: admin.role } });
};

export const listTenants = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const [tenants, total] = await Promise.all([
    Tenant.find().select('-passwordHash').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    Tenant.countDocuments(),
  ]);

  res.json({ tenants, total, page: Number(page), pages: Math.ceil(total / limit) });
};

export const getTenantDetail = async (req, res) => {
  const tenant = await Tenant.findById(req.params.id).select('-passwordHash');
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const subscription = await Subscription.findOne({ tenantId: tenant._id });
  res.json({ tenant, subscription });
};

export const updateTenantStatus = async (req, res) => {
  const { isActive } = req.body;
  const tenant = await Tenant.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-passwordHash');
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  res.json({ tenant });
};

export const updateTenantPlan = async (req, res) => {
  const { plan } = req.body;
  if (!['basic', 'pro', 'enterprise'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  const subscription = await Subscription.findOneAndUpdate(
    { tenantId: req.params.id },
    { plan, status: 'active' },
    { new: true }
  );
  if (!subscription) return res.status(404).json({ error: 'Subscription not found' });
  res.json({ subscription });
};

export const listPlans = async (req, res) => {
  const plans = await Plan.find().sort({ priceMonthly: 1 });
  res.json({ plans });
};

export const updatePlan = async (req, res) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  res.json({ plan });
};

export const getMetrics = async (req, res) => {
  const [totalTenants, activeTenants, subscriptions] = await Promise.all([
    Tenant.countDocuments(),
    Tenant.countDocuments({ isActive: true }),
    Subscription.find(),
  ]);

  const activeSubs = subscriptions.filter(s => s.status === 'active' || s.status === 'trial');
  const churned = subscriptions.filter(s => s.status === 'expired' || s.status === 'cancelled').length;

  // MRR calculation
  let mrr = 0;
  const plans = await Plan.find();
  for (const sub of activeSubs) {
    const plan = plans.find(p => p.name === sub.plan);
    if (plan) mrr += plan.priceMonthly;
  }

  res.json({
    totalTenants,
    activeTenants,
    activeSubscriptions: activeSubs.length,
    churned,
    mrr,
  });
};
