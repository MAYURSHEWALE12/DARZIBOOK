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

export const createAssignment = async (req, res) => {
  try {
    const assignment = new WorkAssignment({ ...req.body, tenantId: req.tenantId });
    await assignment.save();
    res.status(201).json({ assignment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const assignment = await WorkAssignment.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
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
