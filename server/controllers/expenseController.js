import { Expense } from '../models/index.js';

export const createExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    
    if (!amount || !description) {
      return res.status(400).json({ error: 'Amount and description are required' });
    }

    const expense = await Expense.create({
      tenantId: req.tenantId,
      amount: Number(amount),
      category: category || 'Other',
      description,
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json({ expense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listExpenses = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { tenantId: req.tenantId };
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json({ expenses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
