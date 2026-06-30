import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Users, CreditCard, LogOut, TrendingUp, TrendingDown, Store, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/admin/metrics', { withCredentials: true })
      .then(({ data }) => setMetrics(data))
      .catch(() => toast.error('Failed to load metrics'));
  }, []);

  const handleLogout = async () => {
    navigate('/superadmin/login');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shadow-sm relative z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#152a66] flex items-center justify-center text-white shadow-md">
            <Store className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-800">DarziBook <span className="text-[#1e3a8a]">Admin</span></span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/superadmin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1e3a8a]/5 text-[#1e3a8a] font-bold transition-all">
            <LayoutDashboard className="w-5 h-5" />
            <span>Overview</span>
          </Link>
          <Link to="/superadmin/tenants" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-medium transition-all">
            <Users className="w-5 h-5" />
            <span>Shops</span>
          </Link>
          <Link to="/superadmin/plans" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-medium transition-all">
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
          <h1 className="text-2xl font-bold text-slate-800">System Overview</h1>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3">
               <div className="text-right">
                 <p className="text-sm font-bold text-slate-700">Super Admin</p>
                 <p className="text-xs text-slate-500">admin@darzibook.com</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                 <User className="w-5 h-5" />
               </div>
             </div>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-[1400px] mx-auto w-full">
          {/* Stats Section */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 md:col-span-2 flex flex-col justify-between h-[180px] relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-40 h-40 bg-gradient-to-br from-[#1e3a8a]/5 to-transparent rounded-bl-full"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Recurring Revenue</p>
                  <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">₹{(metrics?.mrr || 0).toLocaleString()}</h2>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100">
                  <TrendingUp className="w-3 h-3" /> +12.4%
                </div>
              </div>
              <div className="h-12 w-full mt-4 relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 400 40" preserveAspectRatio="none">
                  <path d="M0,35 Q50,30 100,32 T200,10 T300,25 T400,5" fill="none" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
                  <path d="M0,35 Q50,30 100,32 T200,10 T300,25 T400,5 V40 H0 Z" fill="url(#gradient)" opacity="0.1" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1e3a8a" stopOpacity="1" />
                      <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-[180px]">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Shops</p>
                <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">{metrics?.totalTenants || 0}</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-medium text-slate-500">Active: {metrics?.activeTenants || 0}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between h-[180px]">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Churn Rate</p>
                <h2 className="text-4xl font-extrabold text-rose-500 tracking-tight">2.1%</h2>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                <TrendingDown className="w-4 h-4 text-emerald-500" />
                <span>0.4% from last month</span>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Users</p>
                <h3 className="text-2xl font-bold text-slate-800">{metrics?.activeSubscriptions || 0}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Trial Accounts</p>
                <h3 className="text-2xl font-bold text-slate-800">{metrics?.activeTenants ? Math.max(0, metrics.activeTenants - (metrics.activeSubscriptions || 0)) : 0}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Store className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between">
              <h3 className="text-sm font-bold text-slate-800 mb-6">Plan Distribution</h3>
              <div className="space-y-5 flex-1 flex flex-col justify-center">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-600">PRO</span>
                    <span className="text-slate-800 font-bold">45%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-600">ENTERPRISE</span>
                    <span className="text-slate-800 font-bold">32%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1e3a8a] rounded-full" style={{ width: '32%' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-600">BASIC</span>
                    <span className="text-slate-800 font-bold">23%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 rounded-full" style={{ width: '23%' }} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="h-10" />
        </div>
      </main>
    </div>
  );
}
