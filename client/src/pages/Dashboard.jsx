import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSummary, getPendingDues } from '../api/reports.js';
import { listOrders } from '../api/orders.js';

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingDues, setPendingDues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSummary({ period: 'daily' }),
      listOrders({}),
      getPendingDues()
    ])
      .then(([summaryRes, ordersRes, duesRes]) => {
        setData(summaryRes.data);
        setRecentOrders(ordersRes.data.orders.slice(0, 5));
        setPendingDues(duesRes.data.customers.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: t('dashboard.todayOrders'), value: data?.orders?.count || 0, icon: 'shopping_bag', color: 'from-[#1e3a8a] to-[#152a66]' },
    { label: t('dashboard.pendingDues'), value: `₹${data?.orders?.pendingAmount || 0}`, icon: 'payments', color: 'from-rose-500 to-rose-600' },
    { label: t('dashboard.totalCustomers'), value: data?.totalCustomers || 0, icon: 'group', color: 'from-blue-600 to-blue-800' },
    { label: t('dashboard.revenue'), value: `₹${data?.payments?.total || 0}`, icon: 'trending_up', color: 'from-amber-500 to-orange-500' },
  ];

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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{t('nav.dashboard')}</h1>
          <p className="text-slate-500 mt-1 text-[15px]">Here's what's happening with your store today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative group hover:shadow-md transition-shadow">
            <div className={`absolute -right-8 -top-8 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${stat.color} opacity-[0.08] group-hover:scale-150 transition-transform duration-700 ease-out`}></div>
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between relative z-10 gap-3 sm:gap-0">
              <div className="order-2 sm:order-1">
                <p className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider mb-1 sm:mb-2 line-clamp-1">{stat.label}</p>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                  {loading ? <span className="animate-pulse bg-slate-200 h-6 sm:h-8 w-12 sm:w-16 rounded-md inline-block"></span> : stat.value}
                </h3>
              </div>
              <div className={`order-1 sm:order-2 self-start p-2 sm:p-3 rounded-[10px] bg-gradient-to-br ${stat.color} shadow-sm text-white`}>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sections below */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('nav.orders')}</h3>
            <Link to="/orders" className="text-[11px] font-bold text-slate-500 hover:text-[#1e3a8a] uppercase tracking-wider transition-colors flex items-center gap-1">
              {t('common.search')} <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
            {recentOrders.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <div key={order._id} onClick={() => navigate(`/orders/${order._id}`)} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 group-hover:bg-white transition-colors">
                        {order.invoiceNumber}
                      </span>
                      <div>
                        <p className="font-bold text-[13px] text-slate-800">{order.customerId?.name || 'Unknown'}</p>
                        <p className="text-[12px] font-medium text-slate-500 capitalize">
                          {order.garmentType}
                          {order.quantity > 1 && <span className="ml-1 text-[10px] bg-slate-200 text-slate-600 px-1 rounded-sm font-bold">x{order.quantity}</span>}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded border text-[11px] font-bold ${getStatusColor(order.status)}`}>
                      {t(`order.status.${order.status}`)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <span className="material-symbols-outlined text-[32px] text-slate-300 mb-2">inbox</span>
                <p className="text-slate-500 font-medium text-[13px]">{t('common.noResults')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Dues Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('report.pendingDues')}</h3>
            <Link to="/reports" className="text-[11px] font-bold text-slate-500 hover:text-[#1e3a8a] uppercase tracking-wider transition-colors flex items-center gap-1">
              {t('common.search')} <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
            {pendingDues.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {pendingDues.map((customer) => (
                  <div key={customer._id} onClick={() => navigate(`/customers/${customer._id}`)} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[11px] uppercase border border-slate-200">
                        {customer.name?.charAt(0) || '?'}
                      </div>
                      <span className="font-bold text-[13px] text-slate-800">{customer.name}</span>
                    </div>
                    <span className="text-rose-600 font-bold text-[13px]">₹{customer.totalPending}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <span className="material-symbols-outlined text-[32px] text-slate-300 mb-2">receipt_long</span>
                <p className="text-slate-500 font-medium text-[13px]">{t('common.noResults')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
