import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { listExpenses, createExpense, deleteExpense } from '../api/expenses.js';
import Button from '../components/Button.jsx';
import CustomSelect from '../components/CustomSelect.jsx';
import DatePicker from '../components/DatePicker.jsx';
import toast from 'react-hot-toast';

export default function Expenses() {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    amount: '',
    category: 'Other',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = [
    { value: 'Rent', label: 'Rent' },
    { value: 'Electricity/Water', label: 'Electricity/Water' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Thread/Materials', label: 'Thread/Materials' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Other', label: 'Other' }
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExpenses = async () => {
    try {
      const { data } = await listExpenses();
      setExpenses(data.expenses);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.description) return toast.error('Amount and description required');
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createExpense(form);
      toast.success('Expense added');
      setForm({
        amount: '',
        category: 'Other',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      toast.success('Expense deleted');
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl shadow-sm border border-rose-500/10">
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
          </div>
          Shop Expenses
        </h1>
        <p className="text-slate-500 mt-1 text-[15px]">{t("expense.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 sticky top-6">
            <h2 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider mb-2">Add Expense</h2>
            
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount (₹)</label>
              <input 
                type="number" 
                value={form.amount} 
                onChange={(e) => setForm({...form, amount: e.target.value})}
                className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-[13px] font-medium outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <CustomSelect 
                value={form.category}
                onChange={(val) => setForm({...form, category: val})}
                options={categories}
                searchable={false}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
              <input 
                type="text" 
                value={form.description} 
                onChange={(e) => setForm({...form, description: e.target.value})}
                className="w-full h-10 px-3.5 rounded-lg border border-slate-200 text-[13px] font-medium outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                placeholder={t("expense.placeholderDesc")}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</label>
              <DatePicker 
                selected={form.date} 
                onChange={(date) => setForm({...form, date: date.toISOString().split('T')[0]})} 
                required 
              />
            </div>

            <Button type="submit" loading={isSubmitting} disabled={isSubmitting} className="w-full h-10 bg-rose-600 text-white font-bold hover:bg-rose-700">
              Save Expense
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recent Expenses</h3>
            </div>
            
            {loading ? (
              <div className="flex-1 flex justify-center items-center py-20">
                <span className="material-symbols-outlined animate-spin text-[#1e3a8a] text-[32px]">progress_activity</span>
              </div>
            ) : expenses.length > 0 ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 p-0">
                {expenses.map((expense) => (
                  <div key={expense._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                        <span className="material-symbols-outlined text-[18px]">payments</span>
                      </div>
                      <div>
                        <p className="font-bold text-[14px] text-slate-800">{expense.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">{expense.category}</span>
                          <span className="text-[12px] text-slate-400">
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-[15px] text-rose-600 tracking-tight">₹{expense.amount}</span>
                      <button 
                        onClick={() => handleDelete(expense._id)}
                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete expense"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 py-20">
                <span className="material-symbols-outlined text-[40px] text-slate-200 mb-3">receipt_long</span>
                <p className="text-slate-500 font-medium text-[14px]">{t("expense.empty")}</p>
                <p className="text-[12px] text-slate-400 mt-1 max-w-[250px]">{t("expense.emptyDesc")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
