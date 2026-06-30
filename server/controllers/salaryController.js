import SalaryTransaction from '../models/SalaryTransaction.js';
import Staff from '../models/Staff.js';

export const listTransactions = async (req, res) => {
  try {
    const transactions = await SalaryTransaction.find({ tenantId: req.tenantId, staffId: req.params.staffId }).sort({ date: -1, createdAt: -1 });
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { staffId, type, amount, date, notes } = req.body;
    
    // Create transaction
    const transaction = new SalaryTransaction({
      tenantId: req.tenantId,
      staffId,
      type,
      amount: Number(amount),
      date: date || Date.now(),
      notes
    });
    
    await transaction.save();

    // Update staff balance
    // salary_credit = +amount (shop owes staff)
    // advance/payment = -amount (shop pays staff)
    let balanceChange = 0;
    if (type === 'salary_credit') {
      balanceChange = Number(amount);
    } else if (type === 'advance' || type === 'payment') {
      balanceChange = -Number(amount);
    }

    const staff = await Staff.findOneAndUpdate(
      { _id: staffId, tenantId: req.tenantId },
      { $inc: { balance: balanceChange } },
      { new: true }
    );

    res.status(201).json({ transaction, staffBalance: staff.balance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await SalaryTransaction.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    
    // Reverse the balance change
    let balanceChange = 0;
    if (transaction.type === 'salary_credit') {
      balanceChange = -Number(transaction.amount);
    } else if (transaction.type === 'advance' || transaction.type === 'payment') {
      balanceChange = Number(transaction.amount);
    }

    await Staff.findOneAndUpdate(
      { _id: transaction.staffId, tenantId: req.tenantId },
      { $inc: { balance: balanceChange } }
    );

    await transaction.deleteOne();

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
