import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    type: { 
      type: String, 
      enum: ['completed', 'delayed', 'missed_pickup'], 
      required: true 
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for faster queries
notificationSchema.index({ tenantId: 1, isRead: 1 });
notificationSchema.index({ tenantId: 1, orderId: 1, type: 1 });

export default mongoose.model('Notification', notificationSchema);
