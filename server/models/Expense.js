import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  amount: { type: Number, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Rent', 'Electricity/Water', 'Maintenance', 'Thread/Materials', 'Marketing', 'Other'],
    default: 'Other'
  },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

expenseSchema.index({ tenantId: 1, date: -1 });

export default mongoose.model('Expense', expenseSchema);
