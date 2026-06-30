import { z } from 'zod';
import { Payment, Order, Customer } from '../models/index.js';

const paymentSchema = z.object({
  customerId: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.number().min(1),
  method: z.enum(['cash', 'upi', 'card', 'other']).optional().default('cash'),
  note: z.string().optional().default(''),
  date: z.string().optional(),
});

export const listCustomerPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      tenantId: req.tenantId,
      customerId: req.params.customerId,
    }).sort({ date: -1 });
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list payments' });
  }
};

export const createPayment = async (req, res) => {
  try {
    console.log('Payment Request Body:', req.body);
    const data = paymentSchema.parse(req.body);

    const order = await Order.findOne({ _id: data.orderId, tenantId: req.tenantId });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const payment = await Payment.create({
      tenantId: req.tenantId,
      customerId: data.customerId,
      orderId: data.orderId,
      amount: data.amount,
      method: data.method,
      note: data.note,
      date: data.date || new Date(),
    });

    // Update order pending amount atomically to avoid race conditions
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: data.orderId, tenantId: req.tenantId },
      { $inc: { advancePaid: data.amount, pendingAmount: -data.amount } },
      { new: true }
    );

    // Update customer total pending
    await Customer.findByIdAndUpdate(data.customerId, { $inc: { totalPending: -data.amount } });

    res.status(201).json({ payment, order: updatedOrder });
  } catch (err) {
    console.error('Payment Error:', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message, details: err.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
