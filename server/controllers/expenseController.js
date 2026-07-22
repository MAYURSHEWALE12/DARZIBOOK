import { z } from 'zod';
import { Expense } from '../models/index.js';

const createExpenseSchema = z.object({
  amount: z.number().min(0),
  category: z.enum(['Rent', 'Electricity/Water', 'Maintenance', 'Thread/Materials', 'Marketing', 'Other']).optional().default('Other'),
  description: z.string().min(1),
  date: z.string().optional(),
});

export const createExpense = async (req, res) => {
  try {
    const data = createExpenseSchema.parse(req.body);

    const expense = await Expense.create({
      tenantId: req.tenantId,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date ? new Date(data.date) : new Date()
    });

    res.status(201).json({ expense });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
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
