import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSummary, getPendingDues, getOrderReport, getRevenueReport } from '../api/reports.js';
import Select from '../components/Select.jsx';

export default function Reports() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('daily');
  const [summary, setSummary] = useState(null);
  const [dues, setDues] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSummary({ period }),
      getPendingDues(),
      getRevenueReport()
    ]).then(([summaryRes, duesRes, revenueRes]) => {
      setSummary(summaryRes.data);
      setDues(duesRes.data.customers);
      setRevenue(revenueRes.data.revenue);
    }).finally(() => {
      setLoading(false);
    });
  }, [period]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-xl shadow-sm border border-[#1e3a8a]/10">
              <span className="material-symbols-outlined text-[24px]">analytics</span>
            </div>
            {t('nav.reports')}
          </h1>
          <p className="text-slate-500 mt-1 text-[15px]">Analyze your business performance and pending dues.</p>
        </div>
        
        <div className="w-full sm:w-48 z-10">
          <Select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' }
            ]}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative group hover:shadow-md transition-shadow">
          <div className="absolute -right-8 -top-8 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#152a66] opacity-[0.08] group-hover:scale-150 transition-transform duration-700 ease-out"></div>
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between relative z-10 gap-3 sm:gap-0">
            <div className="order-2 sm:order-1">
              <p className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider mb-1 sm:mb-2 line-clamp-1">{t('dashboard.todayOrders')}</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">{summary?.orders?.count || 0}</h3>
              <p className="text-[11px] font-medium text-slate-500 mt-1 sm:mt-2">Revenue: <span className="text-[#1e3a8a] font-bold">₹{summary?.orders?.totalRevenue || 0}</span></p>
            </div>
            <div className="order-1 sm:order-2 self-start p-2 sm:p-3 rounded-[10px] bg-gradient-to-br from-[#1e3a8a] to-[#152a66] shadow-sm text-white">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative group hover:shadow-md transition-shadow">
          <div className="absolute -right-8 -top-8 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-rose-500 to-red-600 opacity-[0.08] group-hover:scale-150 transition-transform duration-700 ease-out"></div>
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between relative z-10 gap-3 sm:gap-0">
            <div className="order-2 sm:order-1">
              <p className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider mb-1 sm:mb-2 line-clamp-1">{t('dashboard.pendingDues')}</p>
              <h3 className="text-xl sm:text-2xl font-bold text-rose-600 tracking-tight">₹{summary?.orders?.pendingAmount || 0}</h3>
              <p className="text-[11px] font-medium text-slate-500 mt-1 sm:mt-2 line-clamp-1">Total outstanding</p>
            </div>
            <div className="order-1 sm:order-2 self-start p-2 sm:p-3 rounded-[10px] bg-gradient-to-br from-rose-500 to-red-600 shadow-sm text-white">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative group hover:shadow-md transition-shadow">
          <div className="absolute -right-8 -top-8 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-emerald-500 to-[#1e3a8a] opacity-[0.08] group-hover:scale-150 transition-transform duration-700 ease-out"></div>
          <div className="p-4 sm:p-5 flex flex-row justify-between relative z-10">
            <div>
              <p className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider mb-1 sm:mb-2 line-clamp-1">{t('dashboard.revenue')}</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-emerald-600 tracking-tight">₹{summary?.payments?.total || 0}</h3>
              <p className="text-[11px] font-medium text-slate-500 mt-1 sm:mt-2">{summary?.payments?.count || 0} transactions</p>
            </div>
            <div className="self-start p-2 sm:p-3 rounded-[10px] bg-gradient-to-br from-emerald-500 to-[#1e3a8a] shadow-sm text-white">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('report.pendingDues')} Top 10</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
            {dues.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {dues.slice(0, 10).map((customer) => (
                  <div key={customer._id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
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
                <span className="material-symbols-outlined text-[32px] text-slate-300 mb-2">task_alt</span>
                <p className="text-slate-500 font-medium text-[13px]">{t('common.noResults')}</p>
                <p className="text-[12px] text-slate-400 mt-1 max-w-[250px]">All dues are cleared. Outstanding balances will appear here.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('report.revenue')} History</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
            {revenue.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {revenue.slice(0, 10).map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200">
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      </div>
                      <span className="text-[13px] font-bold text-slate-700">{item._id}</span>
                    </div>
                    <span className="text-emerald-600 font-bold text-[13px]">₹{item.total}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <span className="material-symbols-outlined text-[32px] text-slate-300 mb-2">show_chart</span>
                <p className="text-slate-500 font-medium text-[13px]">{t('common.noResults')}</p>
                <p className="text-[12px] text-slate-400 mt-1 max-w-[250px]">No revenue data found for this period.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
