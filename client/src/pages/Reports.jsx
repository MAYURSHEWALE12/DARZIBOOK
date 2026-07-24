import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  getSummary, 
  getPendingDues, 
  getOrderReport, 
  getRevenueReport,
  getExpenseReport,
  getSalaryReport,
  getDailyStitchingReport
} from '../api/reports.js';
import Select from '../components/Select.jsx';
import CustomSelect from '../components/CustomSelect.jsx';
import Button from '../components/Button.jsx';
import { listStaff } from '../api/staff.js';
import { cn } from '../utils/cn.js';

export default function Reports() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('daily');
  const [activeTab, setActiveTab] = useState('overview');
  
  const [summary, setSummary] = useState(null);
  const [dues, setDues] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [dailyStitching, setDailyStitching] = useState([]);
  const [salaryMonth, setSalaryMonth] = useState(new Date().getMonth() + 1);
  const [salaryYear, setSalaryYear] = useState(new Date().getFullYear());
  const [salaryStaff, setSalaryStaff] = useState('all');
  const [staffList, setStaffList] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSummary({ period }),
      getPendingDues(),
      getRevenueReport(),
      getOrderReport({ period }),
      getExpenseReport({ period }),
      
      getDailyStitchingReport()
    ]).then(([summaryRes, duesRes, revenueRes, orderRes, expenseRes, stitchRes]) => {
      setSummary(summaryRes.data);
      setDues(duesRes.data.customers);
      setRevenue(revenueRes.data.revenue);
      setOrders(orderRes.data.orders);
      setExpenses(expenseRes.data.expenses);
      
      setDailyStitching(stitchRes.data.assignments);
      listStaff().then(res => setStaffList(res.data.staff)).catch(() => {});
    }).finally(() => {
      setLoading(false);
    });
  }, [period]);

  useEffect(() => {
    getSalaryReport({ month: salaryMonth, year: salaryYear, staffId: salaryStaff })
      .then(res => setSalaries(res.data.salaries))
      .catch(() => {});
  }, [salaryMonth, salaryYear, salaryStaff]);

  const tabs = [
    { id: 'overview', label: t('report.tabOverview'), icon: 'analytics' },
    { id: 'orders', label: t('report.tabOrders'), icon: 'format_list_bulleted' },
    { id: 'staff', label: t('report.tabStaff'), icon: 'badge' }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative overflow-hidden">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">TOTAL SALES</p>
          <h3 className="text-2xl font-bold text-emerald-600">₹{summary?.orders?.totalRevenue || 0}</h3>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative overflow-hidden">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t("report.totalExpenses")}</p>
          <h3 className="text-2xl font-bold text-rose-500">₹{summary?.expenses?.total || 0}</h3>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative overflow-hidden">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t("report.totalSalariesPaid")}</p>
          <h3 className="text-2xl font-bold text-amber-500">₹{summary?.salaries?.total || 0}</h3>
        </div>
        <div className="bg-[#1e3a8a] rounded-xl border border-[#1e3a8a] shadow-sm p-5 relative overflow-hidden text-white">
          <p className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-1">{t("report.netProfit")}</p>
          <h3 className="text-2xl font-bold">₹{summary?.netProfit || 0}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expenses Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t("report.expenseBreakdown")}</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            {expenses.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <div key={exp._id} className="flex justify-between items-center p-4">
                    <span className="font-medium text-slate-700 text-[13px]">{exp._id}</span>
                    <span className="font-bold text-rose-500 text-[14px]">₹{exp.total}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">{t("report.noExpenses")}</div>
            )}
          </div>
        </div>

        {/* Pending Dues */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t("report.pendingDuesTop10")}</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            {dues.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {dues.slice(0, 10).map((c) => (
                  <div key={c._id} className="flex justify-between items-center p-4">
                    <span className="font-bold text-slate-800 text-[13px]">{c.name}</span>
                    <span className="font-bold text-rose-600 text-[14px]">₹{c.totalPending}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">{t("report.noPendingDues")}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider mb-6">{t("report.ordersByStatus")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['received', 'in_progress', 'ready', 'delivered'].map((status) => {
            const stat = orders.find(o => o._id === status) || { count: 0, totalRevenue: 0 };
            return (
              <div key={status} className="border border-slate-100 rounded-xl p-4 bg-slate-50 text-center">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{status.replace('_', ' ')}</p>
                <p className="text-3xl font-bold text-slate-800 mb-1">{stat.count}</p>
                <p className="text-[12px] font-medium text-emerald-600">₹{stat.totalRevenue}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStaffTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
      {/* Daily Stitching */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t("report.todaysStitching")}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{t("report.todaysStitchingDesc")}</p>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          {dailyStitching.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {dailyStitching.map((wa) => (
                <div key={wa._id} className="p-4 flex justify-between items-start">
                  <div>
                    <p className="font-bold text-[13px] text-slate-800">{wa.staffId?.name} <span className="text-slate-400 font-normal">({wa.staffId?.role})</span></p>
                    <p className="text-[12px] font-medium text-slate-600 mt-1">Order: #{wa.orderId?.invoiceNumber} - {wa.orderId?.garmentType}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Customer: {wa.orderId?.customerId?.name}</p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-1 rounded-md",
                      wa.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                      wa.status === 'in_progress' ? "bg-amber-50 text-amber-600" :
                      "bg-slate-100 text-slate-600"
                    )}>{wa.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">{t("report.noStitching")}</div>
          )}
        </div>
      </div>

      {/* Salary Reports */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('report.salaryPayouts')}</h3>
          <div className="flex items-center gap-2">
            <CustomSelect 
              value={salaryMonth} 
              onChange={(val) => setSalaryMonth(Number(val))}
              options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('default', { month: 'short' }) }))}
              searchable={false}
              className="w-20 sm:w-24"
              buttonClassName="!h-8 !text-xs !rounded shadow-sm"
            />
            <CustomSelect 
              value={salaryYear} 
              onChange={(val) => setSalaryYear(Number(val))}
              options={[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(y => ({ value: y, label: String(y) }))}
              searchable={false}
              className="w-20 sm:w-24"
              buttonClassName="!h-8 !text-xs !rounded shadow-sm"
            />
            <CustomSelect 
              value={salaryStaff} 
              onChange={(val) => setSalaryStaff(val)}
              options={[{ value: 'all', label: 'All Staff' }, ...staffList.map(s => ({ value: s._id, label: s.name }))]}
              searchable={false}
              className="w-28 sm:w-36"
              buttonClassName="!h-8 !text-xs !rounded shadow-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          {salaries.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {salaries.map((s) => (
                <div key={s._id} className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[11px] uppercase">
                      {s.staffName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[13px] text-slate-800">{s.staffName}</p>
                      <p className="text-[11px] text-slate-500">{s.staffRole}</p>
                    </div>
                  </div>
                  <span className="font-bold text-[14px] text-emerald-600">₹{s.totalAmount}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">{t("report.noSalaries")}</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-xl shadow-sm border border-[#1e3a8a]/10">
              <span className="material-symbols-outlined text-[24px]">analytics</span>
            </div>
            {t("report.title")}
          </h1>
          <p className="text-slate-500 mt-1 text-[15px]">{t("report.subtitle")}</p>
        </div>
        
        <div className="w-full sm:w-48 z-10">
          <Select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { value: 'daily', label: t('period.daily') },
              { value: 'weekly', label: t('period.weekly') },
              { value: 'monthly', label: t('period.monthly') },
              { value: 'yearly', label: t('period.yearly') }
            ]}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-bold text-[13px] uppercase tracking-wider transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-[#1e3a8a] text-white border-b-2 border-transparent" 
                : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            )}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <span className="material-symbols-outlined animate-spin text-[#1e3a8a] text-[32px]">progress_activity</span>
        </div>
      ) : (
        <div className="min-h-[500px]">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'orders' && renderOrdersTab()}
          {activeTab === 'staff' && renderStaffTab()}
        </div>
      )}
    </div>
  );
}
