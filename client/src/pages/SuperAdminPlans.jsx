import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Users, CreditCard, LogOut, Store, CheckCircle2, Shield, Settings2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuperAdminPlans() {
  const [plans, setPlans] = useState([]);
  const [editPlan, setEditPlan] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get('/api/admin/plans', { withCredentials: true });
      setPlans(data.plans);
    } catch {
      toast.error('Failed to fetch plans');
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openEdit = (plan) => {
    setEditPlan(plan);
    setForm({
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      trialDays: plan.trialDays,
      'limits.maxCustomers': plan.limits.maxCustomers,
      'limits.maxPhotosPerOrder': plan.limits.maxPhotosPerOrder,
      'limits.maxGarmentTypes': plan.limits.maxGarmentTypes,
    });
    setEditModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/plans/${editPlan._id}`, {
        priceMonthly: Number(form.priceMonthly),
        priceYearly: Number(form.priceYearly),
        trialDays: Number(form.trialDays),
        limits: {
          maxCustomers: Number(form['limits.maxCustomers']),
          maxPhotosPerOrder: Number(form['limits.maxPhotosPerOrder']),
          maxGarmentTypes: Number(form['limits.maxGarmentTypes']),
        },
      }, { withCredentials: true });
      toast.success('Plan updated');
      setEditModal(false);
      fetchPlans();
    } catch {
      toast.error('Failed to update plan');
    }
  };

  const handleLogout = () => {
    navigate('/superadmin/login');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex-col hidden md:flex shadow-sm relative z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#152a66] flex items-center justify-center text-white shadow-md">
            <Store className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-800">DarziBook <span className="text-[#1e3a8a]">Admin</span></span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/superadmin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-medium transition-all">
            <LayoutDashboard className="w-5 h-5" />
            <span>Overview</span>
          </Link>
          <Link to="/superadmin/tenants" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-medium transition-all">
            <Users className="w-5 h-5" />
            <span>Shops</span>
          </Link>
          <Link to="/superadmin/plans" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1e3a8a]/5 text-[#1e3a8a] font-bold transition-all">
            <CreditCard className="w-5 h-5" />
            <span>Plans</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-medium transition-all">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto relative z-10">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-2xl font-bold text-slate-800">Plan Management</h1>
        </header>

        <div className="p-8 space-y-6 max-w-[1400px] mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan._id} className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 p-8 flex flex-col relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow">
                
                {plan.name === 'pro' && (
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#1e3a8a] to-[#152a66]"></div>
                )}
                {plan.name === 'enterprise' && (
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-indigo-500"></div>
                )}

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 capitalize">{plan.name}</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                      {plan.name === 'basic' ? 'Essential features for starters' : 
                       plan.name === 'pro' ? 'Perfect for growing businesses' : 'For large scale operations'}
                    </p>
                  </div>
                  {plan.name === 'pro' && (
                    <span className="bg-[#1e3a8a]/10 text-[#1e3a8a] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Popular
                    </span>
                  )}
                </div>

                <div className="flex items-end gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-slate-800">₹{plan.priceMonthly}</span>
                  <span className="text-slate-500 font-medium mb-1">/month</span>
                </div>

                <div className="space-y-4 flex-1 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#1e3a8a]" />
                    <span className="text-sm font-medium text-slate-700">₹{plan.priceYearly} / year (Discounted)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#1e3a8a]" />
                    <span className="text-sm font-medium text-slate-700">{plan.trialDays} Days Free Trial</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#1e3a8a]" />
                    <span className="text-sm font-medium text-slate-700">
                      {plan.limits.maxCustomers === -1 ? 'Unlimited Customers' : `Up to ${plan.limits.maxCustomers} Customers`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#1e3a8a]" />
                    <span className="text-sm font-medium text-slate-700">
                      {plan.limits.maxPhotosPerOrder === -1 ? 'Unlimited Photos' : `Up to ${plan.limits.maxPhotosPerOrder} Photos/Order`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#1e3a8a]" />
                    <span className="text-sm font-medium text-slate-700">
                      {plan.limits.maxGarmentTypes === -1 ? 'Unlimited Garment Types' : `Up to ${plan.limits.maxGarmentTypes} Garment Types`}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => openEdit(plan)}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    plan.name === 'pro' 
                    ? 'bg-[#1e3a8a] hover:bg-[#152a66] text-white shadow-lg shadow-[#1e3a8a]/20' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Edit className="w-4 h-4" /> Edit Plan
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="h-10" />
      </main>

      {/* Custom Inline Modal for Plan Edit */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-[#1e3a8a]" /> Edit {editPlan?.name} Plan
              </h2>
              <button 
                onClick={() => setEditModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
              >
                <LogOut className="w-5 h-5 rotate-180" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="edit-plan-form" onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-700 ml-1">Monthly Price (₹)</label>
                    <input type="number" required value={form.priceMonthly} onChange={(e) => setForm({ ...form, priceMonthly: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all text-slate-700 font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-700 ml-1">Yearly Price (₹)</label>
                    <input type="number" required value={form.priceYearly} onChange={(e) => setForm({ ...form, priceYearly: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all text-slate-700 font-medium" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-700 ml-1">Trial Days</label>
                  <input type="number" required value={form.trialDays} onChange={(e) => setForm({ ...form, trialDays: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all text-slate-700 font-medium" />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" /> Plan Limits <span className="text-xs font-medium text-slate-400 font-normal">(-1 for unlimited)</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-[13px] font-bold text-slate-700 ml-1">Max Customers</label>
                      <input type="number" required value={form['limits.maxCustomers']} onChange={(e) => setForm({ ...form, 'limits.maxCustomers': e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all text-slate-700 font-medium" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[13px] font-bold text-slate-700 ml-1">Max Photos Per Order</label>
                      <input type="number" required value={form['limits.maxPhotosPerOrder']} onChange={(e) => setForm({ ...form, 'limits.maxPhotosPerOrder': e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all text-slate-700 font-medium" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[13px] font-bold text-slate-700 ml-1">Max Garment Types</label>
                      <input type="number" required value={form['limits.maxGarmentTypes']} onChange={(e) => setForm({ ...form, 'limits.maxGarmentTypes': e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all text-slate-700 font-medium" />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end">
              <button 
                onClick={() => setEditModal(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="edit-plan-form"
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#1e3a8a] hover:bg-[#152a66] shadow-lg shadow-[#1e3a8a]/20 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
