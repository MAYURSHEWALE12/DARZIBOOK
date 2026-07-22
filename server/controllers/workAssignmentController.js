import { z } from 'zod';
import WorkAssignment from '../models/WorkAssignment.js';
import SalaryTransaction from '../models/SalaryTransaction.js';
import Staff from '../models/Staff.js';

const createAssignmentSchema = z.object({
  staffId: z.string().min(1),
  orderId: z.string().min(1),
  itemId: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional().default('pending'),
  assignedDate: z.string().optional(),
  completedDate: z.string().optional().nullable(),
  pieceRate: z.number().min(0).optional().default(0),
  notes: z.string().optional().default(''),
});

const updateAssignmentSchema = z.object({
  staffId: z.string().min(1).optional(),
  orderId: z.string().min(1).optional(),
  itemId: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  assignedDate: z.string().optional(),
  completedDate: z.string().optional().nullable(),
  pieceRate: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const listAssignments = async (req, res) => {
  try {
    const assignments = await WorkAssignment.find({ tenantId: req.tenantId, staffId: req.params.staffId })
      .populate('orderId')
      .sort({ createdAt: -1 });
    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listAssignmentsByOrder = async (req, res) => {
  try {
    const assignments = await WorkAssignment.find({ tenantId: req.tenantId, orderId: req.params.orderId })
      .populate('staffId', 'name role')
      .sort({ createdAt: -1 });
    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createAssignment = async (req, res) => {
  try {
    const data = createAssignmentSchema.parse(req.body);
    const assignmentData = {
      ...data,
      tenantId: req.tenantId,
      assignedDate: data.assignedDate ? new Date(data.assignedDate) : new Date(),
      completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
    };

    const assignment = new WorkAssignment(assignmentData);
    await assignment.save();
    res.status(201).json({ assignment });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(400).json({ error: error.message });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const data = updateAssignmentSchema.parse(req.body);
    const assignmentData = { ...data };
    if (data.assignedDate) assignmentData.assignedDate = new Date(data.assignedDate);
    if (data.completedDate !== undefined) assignmentData.completedDate = data.completedDate ? new Date(data.completedDate) : null;

    const oldAssignment = await WorkAssignment.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!oldAssignment) return res.status(404).json({ error: 'Assignment not found' });

    const assignment = await WorkAssignment.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      assignmentData,
      { new: true, runValidators: true }
    );

    if (data.status === 'completed' && oldAssignment.status !== 'completed') {
      const pieceRate = assignment.pieceRate || 0;
      if (pieceRate > 0) {
        await SalaryTransaction.create({
          tenantId: req.tenantId,
          staffId: assignment.staffId,
          type: 'salary_credit',
          amount: pieceRate,
          notes: `Piece rate for completed assignment on order`
        });
        await Staff.findOneAndUpdate({ _id: assignment.staffId, tenantId: req.tenantId }, { $inc: { balance: pieceRate } });
      }
    } else if (data.status && data.status !== 'completed' && oldAssignment.status === 'completed') {
      const pieceRate = oldAssignment.pieceRate || 0;
      if (pieceRate > 0) {
        await SalaryTransaction.create({
          tenantId: req.tenantId,
          staffId: assignment.staffId,
          type: 'advance',
          amount: pieceRate,
          notes: `Reversed piece rate for un-completed assignment`
        });
        await Staff.findOneAndUpdate({ _id: assignment.staffId, tenantId: req.tenantId }, { $inc: { balance: -pieceRate } });
      }
    }

    res.json({ assignment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await WorkAssignment.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
