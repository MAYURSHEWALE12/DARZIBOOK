import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  customerNumber: { type: String }, // e.g., CUST-0001
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  address: { type: String, default: '' },
  notes: { type: String, default: '' },
  photo: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  totalPending: { type: Number, default: 0 },
}, { timestamps: true });

customerSchema.index({ tenantId: 1, customerNumber: 1 });

customerSchema.index({ tenantId: 1, name: 1 });
customerSchema.index({ tenantId: 1, phone: 1 });

export default mongoose.model('Customer', customerSchema);
