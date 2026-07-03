import fs from 'fs';
import { z } from 'zod';
import { Order, Customer, Payment, Measurement } from '../models/index.js';

const orderSchema = z.object({
  customerId: z.string().min(1),
  measurementId: z.string().optional(),
  garmentType: z.string().min(1),
  deliveryDate: z.string().optional(),
  totalPrice: z.number().min(0),
  advancePaid: z.number().min(0).optional().default(0),
  specialInstructions: z.string().optional().default(''),
});

const generateInvoiceNumber = async (tenantId) => {
  const lastOrder = await Order.findOne({ tenantId }).sort({ createdAt: -1 });
  const lastNum = lastOrder ? parseInt(lastOrder.invoiceNumber?.replace('INV-', '') || '0') : 0;
  return `INV-${String(lastNum + 1).padStart(4, '0')}`;
};

export const listOrders = async (req, res) => {
  const { status, customerId, startDate, endDate, overdue, search, page = 1, limit = 10 } = req.query;
  const filter = { tenantId: req.tenantId };

  if (status) filter.status = status;
  if (customerId) filter.customerId = customerId;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  if (overdue === 'true') {
    filter.deliveryDate = { $lt: new Date() };
    filter.status = { $ne: 'delivered' };
  }

  if (search) {
    const matchedCustomers = await Customer.find({
      tenantId: req.tenantId,
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');
    const customerIds = matchedCustomers.map(c => c._id);

    filter.$or = [
      { customerId: { $in: customerIds } },
      { invoiceNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const skip = (parsedPage - 1) * parsedLimit;

  const totalItems = await Order.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / parsedLimit);

  const orders = await Order.find(filter)
    .populate('customerId', 'name phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit);

  res.json({ 
    orders,
    pagination: { totalItems, totalPages, currentPage: parsedPage, limit: parsedLimit }
  });
};

export const createOrder = async (req, res) => {
  const data = orderSchema.parse(req.body);

  const measurement = await Measurement.findOne({ tenantId: req.tenantId, customerId: data.customerId, garmentType: data.garmentType });
  if (!measurement) {
    return res.status(400).json({ error: `Please add a ${data.garmentType} measurement for this customer first.` });
  }

  const pendingAmount = data.totalPrice - data.advancePaid;

  let order;
  let retries = 5;
  while (retries > 0) {
    try {
      const invoiceNumber = await generateInvoiceNumber(req.tenantId);
      order = await Order.create({
        tenantId: req.tenantId,
        invoiceNumber,
        ...data,
        pendingAmount,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
      });
      break; // success
    } catch (err) {
      if (err.code === 11000) {
        retries--;
        if (retries === 0) return res.status(500).json({ error: 'Failed to generate unique invoice number due to high concurrency. Please try again.' });
        continue;
      }
      throw err;
    }
  }

  // Update customer pending total
  await Customer.findByIdAndUpdate(data.customerId, { $inc: { totalPending: pendingAmount } });

  // If advance was paid, create a Payment record so it shows up in Revenue
  if (data.advancePaid > 0) {
    try {
      await Payment.create({
        tenantId: req.tenantId,
        customerId: data.customerId,
        orderId: order._id,
        amount: data.advancePaid,
        method: 'cash',
        note: 'Advance payment at time of order',
        date: new Date(),
      });
    } catch (paymentErr) {
      console.error('Failed to create advance payment record:', paymentErr);
    }
  }

  res.status(201).json({ order });
};

export const getOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, tenantId: req.tenantId })
    .populate('customerId', 'name phone whatsapp address')
    .populate('measurementId');
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ order });
};

export const updateOrder = async (req, res) => {
  const allowedFields = ['garmentType', 'deliveryDate', 'totalPrice', 'advancePaid', 'specialInstructions'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const order = await Order.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const oldPending = order.pendingAmount;
  Object.assign(order, updates);

  if (req.body.totalPrice !== undefined || req.body.advancePaid !== undefined) {
    order.pendingAmount = order.totalPrice - order.advancePaid;
    const diff = order.pendingAmount - oldPending;
    await Customer.findByIdAndUpdate(order.customerId, { $inc: { totalPending: diff } });
  }

  await order.save();
  res.json({ order });
};

import { Notification } from '../models/index.js';

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  if (!['received', 'in_progress', 'ready', 'delivered'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updateData = { status };
  if (status === 'delivered') {
    updateData.pendingAmount = 0;
  }

  // Use { new: false } to get the original pendingAmount before the atomic update
  const oldOrder = await Order.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    updateData,
    { new: false }
  );
  if (!oldOrder) return res.status(404).json({ error: 'Order not found' });

  // If it was just marked delivered AND had a pending amount, deduct from customer
  if (status === 'delivered' && oldOrder.status !== 'delivered' && oldOrder.pendingAmount > 0) {
    try {
      await Customer.findByIdAndUpdate(oldOrder.customerId, { $inc: { totalPending: -oldOrder.pendingAmount } });
    } catch (err) {
      console.error('Failed to sync customer totalPending on delivery:', err);
    }
  }

  const order = { ...oldOrder.toObject(), ...updateData };

  // Trigger Notification when order becomes ready
  if (status === 'ready' && oldOrder.status !== 'ready') {
    const exists = await Notification.exists({ tenantId: req.tenantId, orderId: oldOrder._id, type: 'completed' });
    if (!exists) {
      await Notification.create({
        tenantId: req.tenantId,
        orderId: oldOrder._id,
        type: 'completed',
        message: `Order ${oldOrder.invoiceNumber} is now ready!`
      });
    }
  }

  res.json({ order });
};

export const deleteOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (order.pendingAmount > 0) {
    await Customer.findByIdAndUpdate(order.customerId, { $inc: { totalPending: -order.pendingAmount } });
  }

  await order.deleteOne();
  res.json({ message: 'Order deleted' });
};

import { cloudinary } from '../config/cloudinary.js';

export const uploadOrderPhotos = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const order = await Order.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const photos = req.files.map((file) => ({
    url: file.path, // Cloudinary URL
    publicId: file.filename, // Cloudinary public_id
  }));

  order.photos.push(...photos);
  await order.save();

  res.json({ photos: order.photos });
};

export const deleteOrderPhoto = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const photo = order.photos.id(req.params.photoId);
  if (!photo) return res.status(404).json({ error: 'Photo not found' });

  if (photo.publicId) {
    try {
      await cloudinary.uploader.destroy(photo.publicId);
    } catch (e) {
      console.error('Failed to delete photo from Cloudinary:', e);
    }
  }
  order.photos.pull({ _id: req.params.photoId });
  await order.save();

  res.json({ message: 'Photo deleted' });
};
