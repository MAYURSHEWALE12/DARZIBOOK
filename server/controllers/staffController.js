import { z } from 'zod';
import Staff from '../models/Staff.js';
import SalaryTransaction from '../models/SalaryTransaction.js';
import WorkAssignment from '../models/WorkAssignment.js';

const createStaffSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().default(''),
  role: z.enum(['Master', 'Tailor', 'Helper', 'Cutter', 'Other']).optional().default('Tailor'),
  salaryType: z.enum(['weekly', 'monthly', 'piece_rate']).optional().default('weekly'),
  baseSalary: z.number().min(0).optional().default(0),
  status: z.enum(['active', 'inactive']).optional().default('active'),
  joinDate: z.string().optional(),
  notes: z.string().optional().default(''),
});

const updateStaffSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.enum(['Master', 'Tailor', 'Helper', 'Cutter', 'Other']).optional(),
  salaryType: z.enum(['weekly', 'monthly', 'piece_rate']).optional(),
  baseSalary: z.number().min(0).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  joinDate: z.string().optional(),
  notes: z.string().optional(),
});

export const listStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = { tenantId: req.tenantId };
    
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    const totalItems = await Staff.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / parsedLimit);

    const staff = await Staff.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit);
      
    res.json({ 
      staff,
      pagination: { totalItems, totalPages, currentPage: parsedPage, limit: parsedLimit }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createStaff = async (req, res) => {
  try {
    const data = createStaffSchema.parse(req.body);
    const staffData = { ...data, tenantId: req.tenantId };
    if (data.joinDate) staffData.joinDate = new Date(data.joinDate);

    const staff = new Staff(staffData);
    await staff.save();
    res.status(201).json({ staff });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(400).json({ error: error.message });
  }
};

export const getStaff = async (req, res) => {
  try {
    const staff = await Staff.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    res.json({ staff });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const data = updateStaffSchema.parse(req.body);
    if (data.joinDate) data.joinDate = new Date(data.joinDate);

    const staff = await Staff.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      data,
      { new: true, runValidators: true }
    );
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    res.json({ staff });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(400).json({ error: error.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    
    // Optionally: check if they have assignments/transactions and prevent deletion
    // For now, cascade delete or just leave it. We will just delete staff.
    await WorkAssignment.deleteMany({ staffId: staff._id });
    await SalaryTransaction.deleteMany({ staffId: staff._id });

    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
