import crypto from 'crypto';
import { z } from 'zod';
import { Subscription, Plan, Tenant } from '../models/index.js';
import razorpay from '../config/razorpay.js';

const createOrderSchema = z.object({
  planName: z.enum(['basic', 'pro', 'enterprise']),
  period: z.enum(['monthly', 'yearly']),
});

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string().optional().default(''),
  planName: z.enum(['basic', 'pro', 'enterprise']),
});

export const getCurrentSubscription = async (req, res) => {
  const subscription = await Subscription.findOne({ tenantId: req.tenantId });
  if (!subscription) return res.status(404).json({ error: 'No subscription found' });

  const plan = await Plan.findOne({ name: subscription.plan });
  res.json({ subscription, plan });
};

export const createOrder = async (req, res) => {
  try {
    const { planName, period } = createOrderSchema.parse(req.body);

    const plan = await Plan.findOne({ name: planName });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const amount = period === 'yearly' ? plan.priceYearly : plan.priceMonthly;

    const options = {
      amount: amount * 100,
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
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName } = verifyPaymentSchema.parse(req.body);

    const hasRazorpayKeys = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
    if (hasRazorpayKeys && razorpay_signature) {
      const sign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
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
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: error.message });
  }
};

export const cancelSubscription = async (req, res) => {
  const subscription = await Subscription.findOne({ tenantId: req.tenantId });
  if (!subscription) return res.status(404).json({ error: 'No subscription found' });

  subscription.status = 'cancelled';
  await subscription.save();
  res.json({ message: 'Subscription cancelled' });
};
