import Staff from '../models/Staff.js';
import SalaryTransaction from '../models/SalaryTransaction.js';
import WorkAssignment from '../models/WorkAssignment.js';

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
    const allowedFields = ['name', 'phone', 'role', 'salaryType', 'baseSalary', 'status', 'joinDate', 'notes'];
    const staffData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) staffData[field] = req.body[field];
    });
    staffData.tenantId = req.tenantId;
    
    const staff = new Staff(staffData);
    await staff.save();
    res.status(201).json({ staff });
  } catch (error) {
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
    const allowedFields = ['name', 'phone', 'role', 'salaryType', 'baseSalary', 'status', 'joinDate', 'notes'];
    const staffData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) staffData[field] = req.body[field];
    });

    const staff = await Staff.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      staffData,
      { new: true, runValidators: true }
    );
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    res.json({ staff });
  } catch (error) {
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
