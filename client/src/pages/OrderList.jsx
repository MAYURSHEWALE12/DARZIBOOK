import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listOrders } from '../api/orders.js';
import Select from '../components/Select.jsx';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination.jsx';

export default function OrderList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => { setPage(1); }, [filters.status, filters.search]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await listOrders({ ...filters, page, limit: 10 });
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [filters.status, filters.search, page]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'received': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'in_progress': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'ready': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'delivered': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-xl shadow-sm border border-[#1e3a8a]/10">
              <span className="material-symbols-outlined text-[24px]">format_list_bulleted</span>
            </div>
            {t('nav.orders')}
          </h1>
          <p className="text-slate-500 mt-1 text-[15px]">Manage your tailoring orders and their statuses.</p>
        </div>
        <button 
          onClick={() => navigate('/orders/new')}
          className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#152a66] text-white px-5 py-2.5 rounded-xl shadow-[0_4px_12px_rgba(30,58,138,0.3)] hover:shadow-[0_4px_16px_rgba(30,58,138,0.4)] transition-all hover:-translate-y-0.5 font-medium"
        >
          <span className="material-symbols-outlined text-[20px]">add</span> 
          {t('order.new')}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-1 pb-4">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 rounded-t-lg">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              type="text"
              placeholder={t('customer.search') + "..."}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-11 pr-4 h-12 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-all text-[15px] text-slate-700 font-medium"
            />
          </div>
          <div className="w-full sm:w-48 z-10">
            <Select 
              value={filters.status} 
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[
                { value: '', label: t('order.status') + ' - All' },
                { value: 'received', label: t('order.status.received') },
                { value: 'in_progress', label: t('order.status.in_progress') },
                { value: 'ready', label: t('order.status.ready') },
                { value: 'delivered', label: t('order.status.delivered') },
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                <th className="px-6 py-3 text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('order.invoice')}</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('customer.name')}</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('order.garmentType')}</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('order.status')}</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider text-right">{t('order.pendingAmount')}</th>
                <th className="px-6 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr 
                  key={order._id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 group-hover:bg-white transition-colors">{order.invoiceNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-semibold group-hover:text-[#1e3a8a] transition-colors">{order.customerId?.name || '-'}</td>
                  <td className="px-6 py-4 text-slate-500 font-medium capitalize">{order.garmentType}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[12px] font-bold border ${getStatusColor(order.status)}`}>
                      {t(`order.status.${order.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-semibold ${order.pendingAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                      {order.pendingAmount > 0 ? `₹${order.pendingAmount}` : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/orders/${order._id}`); }}
                      className="p-2 text-slate-400 hover:text-[#1e3a8a] hover:bg-[#1e3a8a]/10 rounded-lg transition-colors inline-flex"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
              
              {orders.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <span className="material-symbols-outlined text-[40px] text-slate-300">receipt_long</span>
                      </div>
                      <p className="text-slate-600 font-semibold text-lg">{filters.search || filters.status ? "No matching orders found" : t('common.noResults')}</p>
                      <p className="text-slate-400 mt-1 max-w-[250px] mx-auto text-sm">
                        {filters.search || filters.status ? "Try adjusting your search or filters." : "You haven't created any orders yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex justify-center items-center gap-3">
                       <span className="animate-spin w-6 h-6 border-2 border-slate-200 border-t-[#1e3a8a] rounded-full"></span>
                       <span className="text-slate-500 font-medium">Loading orders...</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
