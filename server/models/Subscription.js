import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  plan: { type: String, enum: ['basic', 'pro', 'enterprise'], default: 'basic' },
  status: { type: String, enum: ['trial', 'active', 'expired', 'cancelled'], default: 'trial' },
  trialEndsAt: Date,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  razorpaySubscriptionId: String,
}, { timestamps: true });

export default mongoose.model('Subscription', subscriptionSchema);
