import mongoose from 'mongoose';
import { Order, Customer, Payment, Expense, SalaryTransaction, WorkAssignment } from '../models/index.js';

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

  const [orderStats, paymentStats, customerCount, expenseStats, salaryStats] = await Promise.all([
    Order.aggregate([
      { $match: { tenantId: req.tenantId, createdAt: { $gte: startDate } } },
      { $group: { _id: null, count: { $sum: 1 }, totalRevenue: { $sum: '$totalPrice' }, pendingAmount: { $sum: '$pendingAmount' } } },
    ]),
    Payment.aggregate([
      { $match: { tenantId: req.tenantId, date: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Customer.countDocuments({ tenantId: req.tenantId }),
    Expense.aggregate([
      { $match: { tenantId: req.tenantId, date: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    SalaryTransaction.aggregate([
      { $match: { tenantId: req.tenantId, date: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  const totalSales = orderStats[0]?.totalRevenue || 0;
  const totalExpenses = expenseStats[0]?.total || 0;
  const totalSalaries = salaryStats[0]?.total || 0;
  const netProfit = totalSales - totalExpenses - totalSalaries;

  res.json({
    orders: orderStats[0] || { count: 0, totalRevenue: 0, pendingAmount: 0 },
    payments: paymentStats[0] || { total: 0, count: 0 },
    expenses: { total: totalExpenses },
    salaries: { total: totalSalaries },
    netProfit,
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

export const getExpenseReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  const filter = { tenantId: req.tenantId };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const expenses = await Expense.aggregate([
    { $match: filter },
    { $group: {
      _id: '$category',
      total: { $sum: '$amount' },
      count: { $sum: 1 },
    }},
    { $sort: { total: -1 } },
  ]);

  res.json({ expenses });
};

export const getSalaryReport = async (req, res) => {
  const { startDate, endDate, month, year, staffId } = req.query;
  const filter = { tenantId: req.tenantId };
  
  if (staffId && staffId !== 'all') {
    filter.staffId = new mongoose.Types.ObjectId(staffId);
  }

  if (month && year) {
    // month is 1-12
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  } else if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const salaries = await SalaryTransaction.aggregate([
    { $match: filter },
    { $group: {
      _id: '$staffId',
      totalAmount: { $sum: '$amount' },
      count: { $sum: 1 },
    }},
    { $lookup: {
      from: 'staffs',
      localField: '_id',
      foreignField: '_id',
      as: 'staff'
    }},
    { $unwind: '$staff' },
    { $project: {
      _id: 1,
      totalAmount: 1,
      count: 1,
      staffName: '$staff.name',
      staffRole: '$staff.role'
    }},
    { $sort: { totalAmount: -1 } }
  ]);

  res.json({ salaries });
};

export const getDailyStitchingReport = async (req, res) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const assignments = await WorkAssignment.find({
    tenantId: req.tenantId,
    assignedDate: { $gte: startOfDay }
  })
  .populate('staffId', 'name role')
  .populate({
    path: 'orderId',
    select: 'invoiceNumber customerId garmentType status deliveryDate',
    populate: { path: 'customerId', select: 'name phone' }
  })
  .sort({ assignedDate: -1 });
  
  res.json({ assignments });
};
