import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['cash', 'upi', 'card', 'other'], default: 'cash' },
  note: { type: String, default: '' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

paymentSchema.index({ tenantId: 1, customerId: 1 });
paymentSchema.index({ tenantId: 1, orderId: 1 });

export default mongoose.model('Payment', paymentSchema);
