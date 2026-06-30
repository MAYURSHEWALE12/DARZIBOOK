import { Order, Customer, Payment } from '../models/index.js';

export const getSummary = async (req, res) => {
  const { period = 'daily' } = req.query;
  const now = new Date();
  let startDate;

  switch (period) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  const [orderStats, paymentStats, customerCount] = await Promise.all([
    Order.aggregate([
      { $match: { tenantId: req.tenantId, createdAt: { $gte: startDate } } },
      { $group: { _id: null, count: { $sum: 1 }, totalRevenue: { $sum: '$totalPrice' }, pendingAmount: { $sum: '$pendingAmount' } } },
    ]),
    Payment.aggregate([
      { $match: { tenantId: req.tenantId, date: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Customer.countDocuments({ tenantId: req.tenantId }),
  ]);

  res.json({
    orders: orderStats[0] || { count: 0, totalRevenue: 0, pendingAmount: 0 },
    payments: paymentStats[0] || { total: 0, count: 0 },
    totalCustomers: customerCount,
  });
};

export const getPendingDues = async (req, res) => {
  const customers = await Customer.find({ tenantId: req.tenantId, totalPending: { $gt: 0 } })
    .sort({ totalPending: -1 });
  res.json({ customers });
};

export const getOrderReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  const filter = { tenantId: req.tenantId };

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const orders = await Order.aggregate([
    { $match: filter },
    { $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalRevenue: { $sum: '$totalPrice' },
      totalPending: { $sum: '$pendingAmount' },
    }},
  ]);

  res.json({ orders });
};

export const getRevenueReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  const filter = { tenantId: req.tenantId };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const revenue = await Payment.aggregate([
    { $match: filter },
    { $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
      total: { $sum: '$amount' },
      count: { $sum: 1 },
    }},
    { $sort: { _id: 1 } },
  ]);

  res.json({ revenue });
};
