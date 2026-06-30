import mongoose from 'mongoose';

const measurementSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'MeasurementTemplate', required: true },
  garmentType: { type: String, required: true },
  values: { type: Map, of: String, default: {} },
  notes: { type: String, default: '' },
  image: { type: String, default: null },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

measurementSchema.index({ tenantId: 1, customerId: 1 });

export default mongoose.model('Measurement', measurementSchema);
