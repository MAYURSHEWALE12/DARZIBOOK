import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Users, CreditCard, LogOut, Store, Search, Filter, Download, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuperAdminTenants() {
  const [tenants, setTenants] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const navigate = useNavigate();

  const fetchTenants = async (p = page) => {
    try {
      const { data } = await axios.get(`/api/admin/tenants?page=${p}&limit=${limit}`, { withCredentials: true });
      setTenants(data.tenants);
      setTotal(data.total);
    } catch {
      toast.error('Failed to fetch tenants');
    }
  };

  useEffect(() => { fetchTenants(); }, [page]);

  const toggleStatus = async (id, isActive) => {
    try {
      await axios.patch(`/api/admin/tenants/${id}/status`, { isActive: !isActive }, { withCredentials: true });
      toast.success('Status updated');
      fetchTenants();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleLogout = () => {
    navigate('/superadmin/login');
  };

  const totalPages = Math.ceil(total / limit);

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
          <Link to="/superadmin/tenants" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1e3a8a]/5 text-[#1e3a8a] font-bold transition-all">
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
          <h1 className="text-2xl font-bold text-slate-800">Shop Management</h1>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl transition-all font-medium text-sm shadow-sm">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#152a66] text-white px-4 py-2 rounded-xl shadow-[0_4px_12px_rgba(30,58,138,0.3)] hover:shadow-[0_4px_16px_rgba(30,58,138,0.4)] transition-all font-medium text-sm">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-[1400px] mx-auto w-full">
          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
               <div className="relative w-full max-w-md">
                 <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   type="text"
                   placeholder="Search shops..."
                   className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all text-slate-700 shadow-sm font-medium"
                 />
               </div>
               <p className="text-sm font-bold text-slate-500">Showing {tenants.length} of {total} shops</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Shop Name</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenants.map((tenant) => (
                    <tr key={tenant._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm uppercase shadow-sm border border-indigo-100">
                            {tenant.shopName?.charAt(0) || 'S'}
                          </div>
                          <span className="text-slate-700 font-bold">{tenant.shopName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{tenant.ownerName}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{tenant.phone}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold border ${tenant.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                          {tenant.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleStatus(tenant._id, tenant.isActive)}
                          className={`p-2 rounded-lg transition-colors inline-flex items-center gap-1.5 text-sm font-bold ${tenant.isActive ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                        >
                          {tenant.isActive ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                          {tenant.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tenants.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                            <Store className="w-10 h-10 text-slate-300" />
                          </div>
                          <p className="text-slate-600 font-semibold text-lg">No shops found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-6 flex items-center justify-center border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-[#1e3a8a] hover:bg-[#1e3a8a]/5 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-600 transition-colors"
                >
                  Previous
                </button>
                <div className="px-4 py-2 bg-[#1e3a8a] text-white text-sm font-bold rounded-lg shadow-sm">
                  {page}
                </div>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-[#1e3a8a] hover:bg-[#1e3a8a]/5 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-600 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="h-10" />
      </main>
    </div>
  );
}
