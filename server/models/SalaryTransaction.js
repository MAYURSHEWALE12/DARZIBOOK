import mongoose from 'mongoose';

const salaryTransactionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  type: { type: String, enum: ['advance', 'payment', 'salary_credit'], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  notes: { type: String }
}, { timestamps: true });

// Positive amounts for salary_credit (increases balance)
// Positive amounts for advance/payment (decreases balance)
// The balance logic will be handled in the controller.

salaryTransactionSchema.index({ tenantId: 1, staffId: 1, date: -1 });

export default mongoose.model('SalaryTransaction', salaryTransactionSchema);
