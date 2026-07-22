import { z } from 'zod';
import { Tenant } from '../models/index.js';
import { cloudinary } from '../config/cloudinary.js';

const updateProfileSchema = z.object({
  shopName: z.string().min(1).optional(),
  ownerName: z.string().min(1).optional(),
  phone: z.string().min(10).optional(),
  whatsapp: z.string().optional(),
  address: z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
  gstNumber: z.string().optional(),
  language: z.enum(['en', 'hi', 'mr']).optional(),
});

export const getProfile = async (req, res) => {
  res.json({ tenant: req.tenant });
};

export const updateProfile = async (req, res) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const tenant = await Tenant.findByIdAndUpdate(req.tenantId, data, { new: true }).select('-passwordHash');
    res.json({ tenant });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: error.message });
  }
};

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
