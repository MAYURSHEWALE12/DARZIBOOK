import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  key: { type: String, required: true },
  labelEn: { type: String, required: true },
  labelHi: { type: String, default: '' },
  labelMr: { type: String, default: '' },
}, { _id: false });

const measurementTemplateSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  garmentType: { type: String, required: true },
  fields: [fieldSchema],
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

measurementTemplateSchema.index({ tenantId: 1, garmentType: 1 }, { unique: true });

export default mongoose.model('MeasurementTemplate', measurementTemplateSchema);
