import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['Master', 'Tailor', 'Helper', 'Cutter', 'Other'], default: 'Tailor' },
  salaryType: { type: String, enum: ['weekly', 'monthly', 'piece_rate'], default: 'weekly' },
  baseSalary: { type: Number, default: 0 },
  balance: { type: Number, default: 0 }, // Positive = Shop owes Staff, Negative = Staff took advance
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  joinDate: { type: Date, default: Date.now },
  notes: { type: String }
}, { timestamps: true });

staffSchema.index({ tenantId: 1, status: 1 });
staffSchema.index({ tenantId: 1, name: 1 });

export default mongoose.model('Staff', staffSchema);
