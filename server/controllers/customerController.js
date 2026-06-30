import fs from 'fs';
import { z } from 'zod';
import { Customer, Order, Payment, Measurement } from '../models/index.js';

const customerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().default(''),
  whatsapp: z.string().optional().default(''),
  address: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export const listCustomers = async (req, res) => {
  const { search, pending } = req.query;
  const filter = { tenantId: req.tenantId };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  if (pending === 'true') filter.totalPending = { $gt: 0 };

  const customers = await Customer.find(filter).sort({ createdAt: -1 });
  res.json({ customers });
};

export const createCustomer = async (req, res) => {
  const data = customerSchema.parse(req.body);
  const customer = await Customer.create({ tenantId: req.tenantId, ...data });
  res.status(201).json({ customer });
};

export const getCustomer = async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  const measurements = await Measurement.find({ customerId: customer._id, tenantId: req.tenantId }).sort({ date: -1 }).limit(5);
  const orders = await Order.find({ customerId: customer._id, tenantId: req.tenantId }).sort({ createdAt: -1 });
  const payments = await Payment.find({ customerId: customer._id, tenantId: req.tenantId }).sort({ date: -1 }).limit(20);

  res.json({ customer, measurements, orders, payments });
};

export const updateCustomer = async (req, res) => {
  const allowedFields = ['name', 'phone', 'whatsapp', 'address', 'notes'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const customer = await Customer.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    updates,
    { new: true }
  );
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json({ customer });
};

export const deleteCustomer = async (req, res) => {
  const customer = await Customer.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json({ message: 'Customer deleted' });
};

export const uploadCustomerPhoto = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const customer = await Customer.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  if (customer.photo?.publicId && fs.existsSync(customer.photo.publicId)) {
    fs.unlinkSync(customer.photo.publicId);
  }

  customer.photo = { url: `/uploads/${req.file.filename}`, publicId: req.file.path };
  await customer.save();
  res.json({ photo: customer.photo });
};
