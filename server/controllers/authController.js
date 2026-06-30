import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Tenant, Subscription, MeasurementTemplate, Plan } from '../models/index.js';

const registerSchema = z.object({
  shopName: z.string().min(1),
  ownerName: z.string().min(1),
  phone: z.string().min(10),
  password: z.string().min(6),
  email: z.string().email().optional().default(''),
  language: z.enum(['en', 'hi', 'mr']).optional(),
});

const loginSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(1),
});

const generateTokens = (tenantId) => {
  const accessToken = jwt.sign({ id: tenantId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
  const refreshToken = jwt.sign({ id: tenantId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
  return { accessToken, refreshToken };
};

const setTokenCookies = (res, { accessToken, refreshToken }) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // Keep cookie around so server can see it's expired
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const seedDefaultTemplates = async (tenantId, language = 'en') => {
  const shirtFields = [
    { key: 'chest', labelEn: 'Chest', labelHi: 'छाती', labelMr: 'छाती' },
    { key: 'waist', labelEn: 'Waist', labelHi: 'कमर', labelMr: 'कंबर' },
    { key: 'shoulder', labelEn: 'Shoulder', labelHi: 'कंधा', labelMr: 'खांदा' },
    { key: 'sleeve', labelEn: 'Sleeve Length', labelHi: 'आस्तीन की लंबाई', labelMr: 'बाहीची लांबी' },
    { key: 'length', labelEn: 'Shirt Length', labelHi: 'कमीज़ की लंबाई', labelMr: 'शर्टची लांबी' },
    { key: 'neck', labelEn: 'Neck', labelHi: 'गर्दन', labelMr: 'मान' },
    { key: 'armhole', labelEn: 'Armhole', labelHi: 'बगल', labelMr: 'बगल' },
    { key: 'cuff', labelEn: 'Cuff', labelHi: 'कफ', labelMr: 'कफ' },
  ];
  const pantFields = [
    { key: 'waist', labelEn: 'Waist', labelHi: 'कमर', labelMr: 'कंबर' },
    { key: 'length', labelEn: 'Pant Length', labelHi: 'पैंट की लंबाई', labelMr: 'पँटची लांबी' },
    { key: 'hip', labelEn: 'Hip', labelHi: 'कूल्हा', labelMr: 'नितंब' },
    { key: 'thigh', labelEn: 'Thigh', labelHi: 'जांघ', labelMr: 'मांडी' },
    { key: 'knee', labelEn: 'Knee', labelHi: 'घुटना', labelMr: 'गुडघा' },
    { key: 'bottom', labelEn: 'Bottom', labelHi: 'पाय का घेरा', labelMr: 'तळाचा घेर' },
    { key: 'inseam', labelEn: 'Inseam', labelHi: 'आंतरिक सीम', labelMr: 'आतील शिवण' },
  ];
  
  // Generic Top fields for items like Kurta, Jacket, Blazer, Sherwani
  const genericTopFields = [
    { key: 'length', labelEn: 'Length', labelHi: 'लंबाई', labelMr: 'लांबी' },
    { key: 'chest', labelEn: 'Chest', labelHi: 'छाती', labelMr: 'छाती' },
    { key: 'waist', labelEn: 'Waist', labelHi: 'कमर', labelMr: 'कंबर' },
    { key: 'shoulder', labelEn: 'Shoulder', labelHi: 'कंधा', labelMr: 'खांदा' },
    { key: 'sleeve', labelEn: 'Sleeve', labelHi: 'आस्तीन', labelMr: 'बाही' },
    { key: 'neck', labelEn: 'Neck', labelHi: 'गर्दन', labelMr: 'मान' },
  ];

  await MeasurementTemplate.create([
    { tenantId, garmentType: 'shirt', fields: shirtFields, isDefault: true },
    { tenantId, garmentType: 'pant', fields: pantFields, isDefault: true },
    { tenantId, garmentType: 'kurta', fields: genericTopFields, isDefault: true },
    { tenantId, garmentType: 'paijama', fields: pantFields, isDefault: true },
    { tenantId, garmentType: 'nawabi', fields: genericTopFields, isDefault: true },
    { tenantId, garmentType: 'jacket', fields: genericTopFields, isDefault: true },
    { tenantId, garmentType: 'modi_jacket', fields: genericTopFields, isDefault: true },
    { tenantId, garmentType: 'blazer', fields: genericTopFields, isDefault: true },
    { tenantId, garmentType: 'apple_cut_shirt', fields: shirtFields, isDefault: true },
    { tenantId, garmentType: 'pathani', fields: genericTopFields, isDefault: true },
    { tenantId, garmentType: 'jodhpuri', fields: genericTopFields, isDefault: true },
    { tenantId, garmentType: 'sherwani', fields: genericTopFields, isDefault: true },
  ]);
};

export const register = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await Tenant.findOne({ phone: data.phone });
    if (existing) return res.status(400).json({ error: 'Phone number already registered' });

    const passwordHash = await bcrypt.hash(data.password, 12);
    const tenant = await Tenant.create({
      shopName: data.shopName,
      ownerName: data.ownerName,
      phone: data.phone,
      passwordHash,
      email: data.email,
      language: data.language || 'en',
    });

    const defaultPlan = await Plan.findOne({ name: 'basic' });
    const trialDays = defaultPlan?.trialDays || 14;
    const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

    await Subscription.create({
      tenantId: tenant._id,
      plan: 'basic',
      status: 'trial',
      trialEndsAt,
    });

    await seedDefaultTemplates(tenant._id, data.language);

    const tokens = generateTokens(tenant._id);
    setTokenCookies(res, tokens);

    res.status(201).json({
      tenant: { id: tenant._id, shopName: tenant.shopName, phone: tenant.phone, language: tenant.language },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const tenant = await Tenant.findOne({ phone: data.phone });
    if (!tenant) return res.status(401).json({ error: 'Invalid phone or password' });

    const isMatch = await bcrypt.compare(data.password, tenant.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid phone or password' });

    if (!tenant.isActive) return res.status(403).json({ error: 'Account is deactivated' });

    const tokens = generateTokens(tenant._id);
    setTokenCookies(res, tokens);

    res.json({
      tenant: { id: tenant._id, shopName: tenant.shopName, phone: tenant.phone, language: tenant.language },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'Refresh token required' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const tenant = await Tenant.findById(decoded.id);
    if (!tenant || !tenant.isActive) return res.status(401).json({ error: 'Invalid tenant' });

    const tokens = generateTokens(tenant._id);
    setTokenCookies(res, tokens);
    res.json({ message: 'Token refreshed' });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const getMe = async (req, res) => {
  res.json({ tenant: req.tenant });
};
