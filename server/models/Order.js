import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  measurementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Measurement' },
  // Deprecated fields, keeping for backward compatibility
  garmentType: { type: String, required: false },
  quantity: { type: Number, default: 1 },
  // New items array
  items: [{
    garmentType: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 }
  }],
  deliveryDate: Date,
  totalPrice: { type: Number, default: 0 },
  advancePaid: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['received', 'in_progress', 'ready', 'delivered'], default: 'received' },
  specialInstructions: { type: String, default: '' },
  photos: [{ url: String, publicId: String }],
  invoiceNumber: { type: String, required: true },
}, { timestamps: true });

orderSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });
orderSchema.index({ tenantId: 1, customerId: 1 });
orderSchema.index({ tenantId: 1, status: 1 });
orderSchema.index({ tenantId: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);
