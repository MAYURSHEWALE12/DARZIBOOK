import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listCustomers } from '../api/customers.js';
import toast from 'react-hot-toast';

export default function CustomerList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const { data } = await listCustomers({ search });
      setCustomers(data.customers);
    } catch {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-xl">
              <span className="material-symbols-outlined text-[24px]">groups</span>
            </div>
            {t('nav.customers')}
          </h1>
          <p className="text-slate-500 mt-1 text-[15px]">Manage and view your customer database.</p>
        </div>
        <button 
          onClick={() => navigate('/customers/new')}
          className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#152a66] text-white px-5 py-2.5 rounded-xl shadow-[0_4px_12px_rgba(30,58,138,0.3)] hover:shadow-[0_4px_16px_rgba(30,58,138,0.4)] transition-all hover:-translate-y-0.5 font-medium"
        >
          <span className="material-symbols-outlined text-[20px]">add</span> 
          {t('customer.add')}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              type="text"
              placeholder={t('customer.search') + "..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 h-12 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-all text-[15px] text-slate-700 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                <th className="px-6 py-3 text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('customer.name')}</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('customer.phone')}</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider text-right">{t('customer.pendingAmount')}</th>
                <th className="px-6 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((customer) => (
                <tr 
                  key={customer._id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/customers/${customer._id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-[#1e3a8a] font-bold text-sm uppercase shadow-sm border border-white/50">
                        {customer.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-slate-700 font-semibold group-hover:text-[#1e3a8a] transition-colors">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{customer.phone || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[13px] font-bold ${customer.totalPending > 0 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      ₹{customer.totalPending || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/customers/${customer._id}`); }}
                      className="p-2 text-slate-400 hover:text-[#1e3a8a] hover:bg-[#1e3a8a]/10 rounded-lg transition-colors inline-flex"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
              
              {customers.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <span className="material-symbols-outlined text-[40px] text-slate-300">person_search</span>
                      </div>
                      <p className="text-slate-600 font-semibold text-lg">{search ? "No customers found" : t('common.noResults')}</p>
                      <p className="text-slate-400 mt-1 max-w-[250px] mx-auto text-sm">
                        {search ? "Try adjusting your search query." : "You haven't added any customers yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex justify-center items-center gap-3">
                       <span className="animate-spin w-6 h-6 border-2 border-slate-200 border-t-[#1e3a8a] rounded-full"></span>
                       <span className="text-slate-500 font-medium">Loading customers...</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
