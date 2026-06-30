import fs from 'fs';
import { Tenant } from '../models/index.js';

export const getProfile = async (req, res) => {
  res.json({ tenant: req.tenant });
};

export const updateProfile = async (req, res) => {
  const allowedFields = ['shopName', 'ownerName', 'phone', 'whatsapp', 'address', 'gstNumber', 'language'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const tenant = await Tenant.findByIdAndUpdate(req.tenantId, updates, { new: true }).select('-passwordHash');
  res.json({ tenant });
};

import { cloudinary } from '../config/cloudinary.js';

export const uploadLogo = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const tenant = await Tenant.findById(req.tenantId);
  if (tenant.logo?.publicId) {
    try {
      await cloudinary.uploader.destroy(tenant.logo.publicId);
    } catch (e) {
      console.error('Failed to delete old logo from Cloudinary:', e);
    }
  }

  tenant.logo = { url: req.file.path, publicId: req.file.filename };
  await tenant.save();
  res.json({ logo: tenant.logo });
};
