import WorkAssignment from '../models/WorkAssignment.js';

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
    const allowedFields = ['staffId', 'orderId', 'itemId', 'status', 'assignedDate', 'completedDate', 'pieceRate', 'notes'];
    const assignmentData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) assignmentData[field] = req.body[field];
    });
    assignmentData.tenantId = req.tenantId;
    const assignment = new WorkAssignment(assignmentData);
    await assignment.save();
    res.status(201).json({ assignment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const allowedFields = ['staffId', 'orderId', 'itemId', 'status', 'assignedDate', 'completedDate', 'pieceRate', 'notes'];
    const assignmentData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) assignmentData[field] = req.body[field];
    });

    // We need the old assignment to check status change
    const oldAssignment = await WorkAssignment.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!oldAssignment) return res.status(404).json({ error: 'Assignment not found' });

    const assignment = await WorkAssignment.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      assignmentData,
      { new: true, runValidators: true }
    );

    // Handle Salary hooks for piece-rate
    if (req.body.status === 'completed' && oldAssignment.status !== 'completed') {
      const pieceRate = assignment.pieceRate || 0;
      if (pieceRate > 0) {
        // Credit the staff
        await import('../models/SalaryTransaction.js').then(async ({ default: SalaryTransaction }) => {
          await SalaryTransaction.create({
            tenantId: req.tenantId,
            staffId: assignment.staffId,
            type: 'salary_credit',
            amount: pieceRate,
            notes: `Piece rate for completed assignment on order`
          });
        });
        await import('../models/Staff.js').then(async ({ default: Staff }) => {
          await Staff.findOneAndUpdate({ _id: assignment.staffId, tenantId: req.tenantId }, { $inc: { balance: pieceRate } });
        });
      }
    } else if (req.body.status && req.body.status !== 'completed' && oldAssignment.status === 'completed') {
      // Revert the credit if unmarked
      const pieceRate = oldAssignment.pieceRate || 0;
      if (pieceRate > 0) {
        await import('../models/SalaryTransaction.js').then(async ({ default: SalaryTransaction }) => {
          await SalaryTransaction.create({
            tenantId: req.tenantId,
            staffId: assignment.staffId,
            type: 'advance', // Deducts balance logically
            amount: pieceRate,
            notes: `Reversed piece rate for un-completed assignment`
          });
        });
        await import('../models/Staff.js').then(async ({ default: Staff }) => {
          await Staff.findOneAndUpdate({ _id: assignment.staffId, tenantId: req.tenantId }, { $inc: { balance: -pieceRate } });
        });
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
