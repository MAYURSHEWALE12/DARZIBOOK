import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: { type: String, enum: ['basic', 'pro', 'enterprise'], required: true, unique: true },
  priceMonthly: { type: Number, required: true },
  priceYearly: { type: Number, required: true },
  trialDays: { type: Number, default: 14 },
  limits: {
    maxCustomers: { type: Number, default: -1 },
    maxPhotosPerOrder: { type: Number, default: 5 },
    maxGarmentTypes: { type: Number, default: 10 },
    languages: [String],
    whatsappShare: { type: Boolean, default: false },
    pdfExport: { type: Boolean, default: false },
    fullReports: { type: Boolean, default: false },
  },
}, { timestamps: true });

export default mongoose.model('Plan', planSchema);
