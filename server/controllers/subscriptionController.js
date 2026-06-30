import { Subscription, Plan, Tenant } from '../models/index.js';
import razorpay from '../config/razorpay.js';

export const getCurrentSubscription = async (req, res) => {
  const subscription = await Subscription.findOne({ tenantId: req.tenantId });
  if (!subscription) return res.status(404).json({ error: 'No subscription found' });

  const plan = await Plan.findOne({ name: subscription.plan });
  res.json({ subscription, plan });
};

export const createOrder = async (req, res) => {
  const { planName, period } = req.body; // period: 'monthly' | 'yearly'
  if (!['basic', 'pro', 'enterprise'].includes(planName)) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  const plan = await Plan.findOne({ name: planName });
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  const amount = period === 'yearly' ? plan.priceYearly : plan.priceMonthly;

  const options = {
    amount: amount * 100, // Razorpay expects paise
    currency: 'INR',
    receipt: `sub_${req.tenantId}_${Date.now()}`,
    notes: {
      tenantId: req.tenantId.toString(),
      planName,
      period,
    },
  };

  const order = await razorpay.orders.create(options);
  res.json({ order, plan });
};

export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName } = req.body;

  const hasRazorpayKeys = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
  if (hasRazorpayKeys && razorpay_signature) {
    const crypto = await import('crypto');
    const sign = crypto.default.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (sign !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }
  } else {
    console.log('Razorpay verification skipped — using mock mode');
  }

  const plan = await Plan.findOne({ name: planName });
  const subscription = await Subscription.findOne({ tenantId: req.tenantId });

  if (subscription) {
    subscription.plan = planName;
    subscription.status = 'active';
    subscription.currentPeriodStart = new Date();
    subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    subscription.razorpaySubscriptionId = razorpay_payment_id;
    await subscription.save();
  } else {
    await Subscription.create({
      tenantId: req.tenantId,
      plan: planName,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      razorpaySubscriptionId: razorpay_payment_id,
    });
  }

  res.json({ message: 'Payment verified, subscription activated' });
};

export const cancelSubscription = async (req, res) => {
  const subscription = await Subscription.findOne({ tenantId: req.tenantId });
  if (!subscription) return res.status(404).json({ error: 'No subscription found' });

  subscription.status = 'cancelled';
  await subscription.save();
  res.json({ message: 'Subscription cancelled' });
};
