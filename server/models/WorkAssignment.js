import mongoose from 'mongoose';

const workAssignmentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  assignedDate: { type: Date, default: Date.now },
  completedDate: { type: Date },
  pieceRate: { type: Number, default: 0 }, // Useful if salaryType is piece_rate
  notes: { type: String }
}, { timestamps: true });

workAssignmentSchema.index({ tenantId: 1, staffId: 1, status: 1 });
workAssignmentSchema.index({ tenantId: 1, orderId: 1 });

export default mongoose.model('WorkAssignment', workAssignmentSchema);
