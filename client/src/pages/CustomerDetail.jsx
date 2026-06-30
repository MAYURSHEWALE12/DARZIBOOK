import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCustomer } from '../api/customers.js';
import { createPayment } from '../api/payments.js';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import toast from 'react-hot-toast';

export default function CustomerDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState(false);
  const [payment, setPayment] = useState({ amount: '', method: 'cash', note: '' });

  useEffect(() => {
    getCustomer(id)
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Customer not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePayment = async (e) => {
    e.preventDefault();
    const payAmount = Number(payment.amount);
    if (payAmount > customer.totalPending) {
      return toast.error(`Amount cannot exceed pending amount of ₹${customer.totalPending}`);
    }

    try {
      await createPayment({ ...payment, amount: payAmount, customerId: id, orderId: data.orders[0]?._id });
      toast.success('Payment recorded');
      setPaymentModal(false);
      setPayment({ amount: '', method: 'cash', note: '' });
      const res = await getCustomer(id);
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <svg className="animate-spin h-8 w-8 text-[#1e3a8a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
  if (!data) return <div className="text-center py-12 text-slate-500">{t('common.noResults')}</div>;

  const { customer, orders, measurements } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header & Back Button */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/customers')} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{t('nav.customers')} / <span className="text-[#1e3a8a]">{customer.name}</span></h1>
        </div>
      </div>

      {/* Customer Overview Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 text-xl font-bold border border-slate-200">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{customer.name}</h2>
            <div className="flex items-center gap-4 mt-1 text-slate-500 font-medium text-[13px]">
              <p className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">call</span> {customer.phone}</p>
              {customer.address && <p className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">location_on</span> {customer.address}</p>}
            </div>
          </div>
        </div>

        <div className={`px-5 py-3 rounded-lg flex flex-col items-end border ${customer.totalPending > 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">{t('customer.pendingAmount')}</p>
          <p className={`text-2xl font-bold ${customer.totalPending > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            ₹{customer.totalPending}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button onClick={() => navigate(`/orders/new?customerId=${id}`)} className="px-5 py-2.5 rounded-lg bg-[#1e3a8a] text-white font-bold shadow-sm hover:bg-[#152a66] transition-all flex items-center gap-2 text-[13px]">
          <span className="material-symbols-outlined text-[18px]">add</span> {t('order.new')}
        </button>
        <button onClick={() => navigate(`/measurements/new?customerId=${id}`)} className="px-5 py-2.5 rounded-lg bg-white border border-slate-200 text-[#1e3a8a] font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 text-[13px]">
          <span className="material-symbols-outlined text-[18px]">straighten</span> {t('measurement.new')}
        </button>
        {customer.totalPending > 0 && (
          <button onClick={() => setPaymentModal(true)} className="px-5 py-2.5 rounded-lg bg-white border border-slate-200 text-rose-600 font-bold shadow-sm hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center gap-2 ml-auto text-[13px]">
            <span className="material-symbols-outlined text-[18px]">payments</span> {t('payment.add')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('nav.orders')}</h3>
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">{orders.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <span className="material-symbols-outlined text-slate-300 text-[32px] mb-2">receipt_long</span>
                <p className="text-[13px] font-medium text-slate-500">No orders found.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <div key={order._id} onClick={() => navigate(`/orders/${order._id}`)} className="group flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-[#1e3a8a] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">styler</span>
                      </div>
                      <div>
                        <p className="font-bold text-[13px] text-slate-800">{order.invoiceNumber}</p>
                        <p className="text-[12px] font-medium text-slate-500 capitalize">{order.garmentType}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <Badge variant={order.status}>{t(`order.status.${order.status}`)}</Badge>
                      <p className="text-[12px] font-bold text-slate-700">₹{order.totalPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Measurements List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">Measurements</h3>
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">{measurements.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {measurements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <span className="material-symbols-outlined text-slate-300 text-[32px] mb-2">straighten</span>
                <p className="text-[13px] font-medium text-slate-500">No measurements recorded.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {measurements.map((m) => (
                  <div key={m._id} className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-bold text-[13px] text-[#1e3a8a] capitalize">{m.garmentType}</p>
                      <button 
                        onClick={() => navigate(`/measurements/${m._id}/edit`)} 
                        className="text-slate-400 hover:text-[#1e3a8a] transition-colors p-1 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-center"
                        title="Edit Measurement"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                    </div>
                    <p className="text-[11px] font-medium text-slate-400 mb-3">{new Date(m.date).toLocaleDateString()}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(m.values).slice(0, 3).map(([k, v]) => (
                        <span key={k} className="inline-block px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-600 capitalize">
                          {k.substring(0, 4)}: {v}
                        </span>
                      ))}
                      {Object.keys(m.values).length > 3 && (
                        <span className="inline-block px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-400">
                          +{Object.keys(m.values).length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={paymentModal} onClose={() => setPaymentModal(false)} title={t('payment.add')}>
        <div className="mb-4 mt-2 p-4 bg-[#1e3a8a]/5 rounded-xl border border-[#1e3a8a]/10 flex justify-between items-center">
          <span className="text-sm font-semibold text-[#1e3a8a]">Remaining Amount:</span>
          <span className="text-xl font-bold text-[#1e3a8a]">₹{customer.totalPending}</span>
        </div>
        <form onSubmit={handlePayment} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('payment.amount')}</label>
            <input 
              type="number" 
              value={payment.amount} 
              onChange={(e) => setPayment({ ...payment, amount: e.target.value })} 
              required 
              max={customer.totalPending}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent transition-all outline-none text-slate-700"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('payment.method')}</label>
            <div className="relative">
              <select 
                value={payment.method} 
                onChange={(e) => setPayment({ ...payment, method: e.target.value })} 
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent transition-all outline-none text-slate-700 appearance-none cursor-pointer"
              >
                <option value="cash">{t('payment.cash')}</option>
                <option value="upi">{t('payment.upi')}</option>
                <option value="card">{t('payment.card')}</option>
                <option value="other">{t('payment.other')}</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('payment.note')}</label>
            <input 
              type="text" 
              value={payment.note} 
              onChange={(e) => setPayment({ ...payment, note: e.target.value })} 
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent transition-all outline-none text-slate-700"
            />
          </div>
          <button type="submit" className="w-full h-12 mt-2 rounded-xl bg-[#1e3a8a] text-white font-bold shadow-lg shadow-[#1e3a8a]/20 hover:-translate-y-0.5 transition-all">
            {t('payment.add')}
          </button>
        </form>
      </Modal>
    </div>
  );
}
