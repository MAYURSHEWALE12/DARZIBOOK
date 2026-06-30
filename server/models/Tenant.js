import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, lowercase: true, default: '' },
  passwordHash: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  whatsapp: { type: String, default: '' },
  address: {
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
  gstNumber: { type: String, default: '' },
  logo: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  language: { type: String, enum: ['en', 'hi', 'mr'], default: 'en' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Tenant', tenantSchema);
