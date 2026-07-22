import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getOrder, updateOrder, updateOrderStatus, deleteOrder, uploadOrderPhotos, deleteOrderPhoto } from '../api/orders.js';
import { createPayment, listOrderPayments } from '../api/payments.js';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import toast from 'react-hot-toast';
import OrderBill from './OrderBill.jsx';
import MeasurementCard from './MeasurementCard.jsx';
import { listCustomerMeasurements } from '../api/measurements.js';

export default function OrderDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState(false);
  const [billModal, setBillModal] = useState(false);
  const [measurementModal, setMeasurementModal] = useState(false);
  const [payment, setPayment] = useState({ amount: '', method: 'cash', note: '' });
  const [staffList, setStaffList] = useState([]);
  const [assignModal, setAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ staffId: '', itemId: '', notes: '', pieceRate: '' });
  const [hasAssignment, setHasAssignment] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [payments, setPayments] = useState([]);

  const [isAssigning, setIsAssigning] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    getOrder(id)
      .then(({ data }) => {
        setOrder(data.order);
        const custId = typeof data.order.customerId === 'object' ? data.order.customerId._id : data.order.customerId;
        listCustomerMeasurements(custId).then(m => setMeasurements(m.data.measurements)).catch(() => {});
      })
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));

    listOrderPayments(id).then(({ data }) => setPayments(data.payments)).catch(() => {});
      
    import('../api/staff.js').then((module) => {
      module.listStaff().then(({ data }) => setStaffList(data.staff)).catch(() => {});
      module.listWorkAssignmentsByOrder(id).then(({ data }) => {
        if (data.assignments && data.assignments.length > 0) {
          setHasAssignment(true);
        }
      }).catch(() => {});
    });
  }, [id]);

  const handleAssignWork = async (e) => {
    e.preventDefault();
    if (!assignForm.staffId) return toast.error('Please select staff');
    if (isAssigning) return;
    setIsAssigning(true);
    try {
      const module = await import('../api/staff.js');
      await module.createWorkAssignment({ staffId: assignForm.staffId, orderId: id, itemId: assignForm.itemId || undefined, notes: assignForm.notes, pieceRate: Number(assignForm.pieceRate) });
      toast.success('Work assigned successfully');
      setHasAssignment(true);
      setAssignModal(false);
    } catch (err) {
      toast.error('Failed to assign work');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleStatusUpdate = async () => {
    const statuses = ['received', 'in_progress', 'ready', 'delivered'];
    const idx = statuses.indexOf(order.status);
    if (idx === statuses.length - 1) return; // Cannot update past delivered
    const nextStatus = statuses[idx + 1];
    try {
      const { data } = await updateOrderStatus(id, nextStatus);
      setOrder(data.order);
      toast.success(`Status updated to ${t(`order.status.${nextStatus}`)}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const payAmount = Number(payment.amount);
    if (payAmount > order.pendingAmount) {
      return toast.error(`Amount cannot exceed pending amount of ₹${order.pendingAmount}`);
    }
    if (isPaying) return;
    setIsPaying(true);
    
    try {
      const customerId = typeof order.customerId === 'object' ? order.customerId?._id : order.customerId;
      const { data } = await createPayment({ ...payment, amount: payAmount, customerId, orderId: id });
      setOrder(data.order);
      toast.success('Payment recorded');
      setPaymentModal(false);
      setPayments([data.payment, ...payments]);
      setPayment({ amount: '', method: 'cash', note: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setIsPaying(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const formData = new FormData();
    for (const file of files) formData.append('photos', file);
    try {
      const { data } = await uploadOrderPhotos(id, formData);
      setOrder({ ...order, photos: data.photos });
      toast.success('Photos uploaded');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await deleteOrderPhoto(id, photoId);
      setOrder({ ...order, photos: order.photos.filter((p) => p._id !== photoId) });
      toast.success('Photo deleted');
    } catch {
      toast.error('Failed to delete photo');
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
  if (!order) return <div className="text-center py-12 text-slate-500">{t('common.noResults')}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header & Back Button */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/orders')} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{t('nav.orders')} / <span className="text-[#1e3a8a]">{order.invoiceNumber}</span></h1>
        </div>
      </div>

      {/* Overview Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
            <span className="material-symbols-outlined text-[28px]">receipt_long</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{order.invoiceNumber}</h2>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-slate-500 font-medium text-[13px] cursor-pointer hover:text-[#1e3a8a] transition-colors" onClick={() => navigate(`/customers/${order.customerId?._id}`)}>
                {order.customerId?.name}
              </span>
              <Badge variant={order.status}>{t(`order.status.${order.status}`)}</Badge>
            </div>
          </div>
        </div>

        <div className={`px-5 py-3 rounded-lg flex flex-col items-end border ${order.pendingAmount > 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">{t('order.pendingAmount')}</p>
          <p className={`text-2xl font-bold ${order.pendingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            ₹{order.pendingAmount}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <div className="flex gap-3 w-full sm:w-auto relative group">
          <button 
            onClick={handleStatusUpdate} 
            disabled={order.status === 'delivered' || (order.status === 'received' && !hasAssignment)}
            className={`flex-1 sm:flex-none justify-center px-5 py-2.5 rounded-lg border font-bold shadow-sm transition-all flex items-center gap-2 text-[13px] ${
              order.status === 'delivered' || (order.status === 'received' && !hasAssignment)
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white border-slate-200 text-[#1e3a8a] hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {order.status === 'delivered' ? 'check_circle' : 'update'}
            </span>
            <span className="hidden sm:inline">
              {order.status === 'delivered' 
                ? 'Delivered' 
                : `Mark as ${t(`order.status.${['received', 'in_progress', 'ready', 'delivered'][['received', 'in_progress', 'ready', 'delivered'].indexOf(order.status) + 1]}`)}`}
            </span>
            <span className="sm:hidden">
              {order.status === 'delivered' 
                ? 'Delivered' 
                : t(`order.status.${['received', 'in_progress', 'ready', 'delivered'][['received', 'in_progress', 'ready', 'delivered'].indexOf(order.status) + 1]}`)}
            </span>
          </button>
          
          {order.status === 'received' && !hasAssignment && (
            <div className="absolute -top-10 left-0 hidden group-hover:block bg-slate-800 text-white text-[11px] px-3 py-1.5 rounded shadow-lg whitespace-nowrap z-10 animate-in fade-in zoom-in duration-200">
              Please assign work to staff first
              <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
          )}

          <button onClick={() => setBillModal(true)} className="flex-1 sm:flex-none justify-center px-5 py-2.5 rounded-lg bg-[#1e3a8a] text-white font-bold shadow-sm hover:bg-[#152a66] transition-all flex items-center gap-2 text-[13px]">
            <span className="material-symbols-outlined text-[18px]">preview</span> <span className="hidden sm:inline">Preview Bill</span><span className="sm:hidden">Bill</span>
          </button>
          <button onClick={() => setAssignModal(true)} className="flex-1 sm:flex-none justify-center px-5 py-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold shadow-sm hover:bg-blue-100 transition-all flex items-center gap-2 text-[13px]">
            <span className="material-symbols-outlined text-[18px]">engineering</span>
            <span className="hidden sm:inline">Assign Work</span><span className="sm:hidden">Assign</span>
          </button>
        </div>
        {order.pendingAmount > 0 && (
          <button onClick={() => setPaymentModal(true)} className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white border border-slate-200 text-rose-600 font-bold shadow-sm hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center justify-center gap-2 sm:ml-auto text-[13px]">
            <span className="material-symbols-outlined text-[18px]">payments</span> {t('payment.add')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Details Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('order.garmentType')}</h3>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">checkroom</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-[13px] text-slate-500 font-medium">{t('order.garmentType')}</span>
                <span className="text-[13px] text-[#1e3a8a] font-bold capitalize text-right">
                  {order.items && order.items.length > 0 ? (
                    order.items.map(i => `${i.garmentType} (x${i.quantity})`).join(', ')
                  ) : (
                    <>{order.garmentType} {order.quantity > 1 && <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-1">x{order.quantity}</span>}</>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-[13px] text-slate-500 font-medium">{t('order.totalPrice')}</span>
                <span className="text-[13px] text-slate-800 font-bold">₹{order.totalPrice}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-[13px] text-slate-500 font-medium">{t('order.advancePaid')}</span>
                <span className="text-[13px] text-emerald-600 font-bold">₹{order.advancePaid}</span>
              </div>
              {order.deliveryDate && (
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-[13px] text-slate-500 font-medium">{t('order.deliveryDate')}</span>
                  <span className="text-[13px] text-slate-800 font-bold">{new Date(order.deliveryDate).toLocaleDateString()}</span>
                </div>
              )}
              {order.specialInstructions && (
                <div className="flex flex-col gap-2 pt-3">
                  <span className="text-[13px] text-slate-500 font-medium">{t('order.specialInstructions')}</span>
                  <span className="text-[13px] text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200 italic">"{order.specialInstructions}"</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Photos Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('order.photos')}</h3>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded border border-[#1e3a8a] bg-[#1e3a8a]/5 text-[#1e3a8a] hover:bg-[#1e3a8a]/10 transition-colors text-[10px] font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">add_a_photo</span> Upload
              <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {(!order.photos || order.photos.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <span className="material-symbols-outlined text-[32px] mb-2 text-slate-300">image</span>
                <p className="text-[13px] font-medium">No photos uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {order.photos.map((photo) => (
                  <div key={photo._id} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                    <img src={photo.url} alt="Order reference" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <button onClick={() => handleDeletePhoto(photo._id)} className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-all shadow-lg transform scale-50 group-hover:scale-100 duration-300">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {(() => {
        const itemsToRender = order.items && order.items.length > 0 ? order.items : [{ garmentType: order.garmentType }];
        return itemsToRender.map((item, idx) => {
          const measurement = measurements.find(m => m.garmentType?.toLowerCase().trim() === item.garmentType?.toLowerCase().trim());
          if (!measurement) return null;
          return (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-6">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{item.garmentType} Measurements</h3>
                <span className="material-symbols-outlined text-slate-400 text-[18px]">straighten</span>
              </div>
              <div className="p-6">
                <div className="flex flex-nowrap overflow-x-auto custom-scrollbar pb-2 gap-4">
                  {Object.entries(measurement.values || {}).map(([key, value]) => (
                    <div key={key} className="min-w-[100px] flex-1 bg-slate-50 border border-slate-100 rounded-lg p-3 flex flex-col justify-center text-center hover:border-slate-200 transition-colors shrink-0">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 truncate" title={key.replace(/_/g, ' ')}>{key.replace(/_/g, ' ')}</p>
                      <p className="text-sm font-black text-slate-800">{value}</p>
                    </div>
                  ))}
                </div>
                {measurement.notes && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Measurement Notes</p>
                    <p className="text-[13px] text-amber-900 font-medium">{measurement.notes}</p>
                  </div>
                )}
              </div>
            </div>
          );
        });
      })()}

      {/* Payment History Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-6">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">Payment History</h3>
          <span className="material-symbols-outlined text-slate-400 text-[18px]">history</span>
        </div>
        <div className="p-0 overflow-x-auto">
          {payments.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">No payments recorded yet.</div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 text-xs">
                <tr>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3 font-semibold">Method</th>
                  <th className="px-6 py-3 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">{new Date(p.date).toLocaleDateString()} {new Date(p.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">₹{p.amount}</td>
                    <td className="px-6 py-4"><span className="capitalize text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600">{p.method}</span></td>
                    <td className="px-6 py-4 text-slate-500 italic">{p.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={paymentModal} onClose={() => setPaymentModal(false)} title={t('payment.add')}>
        <div className="mb-4 mt-2 p-4 bg-[#1e3a8a]/5 rounded-xl border border-[#1e3a8a]/10 flex justify-between items-center">
          <span className="text-sm font-semibold text-[#1e3a8a]">Remaining Amount:</span>
          <span className="text-xl font-bold text-[#1e3a8a]">₹{order.pendingAmount}</span>
        </div>
        <form onSubmit={handlePayment} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('payment.amount')}</label>
            <input 
              type="number" 
              value={payment.amount} 
              onChange={(e) => setPayment({ ...payment, amount: e.target.value })} 
              required 
              max={order.pendingAmount}
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
          <button type="submit" disabled={isPaying} className={`w-full h-12 mt-2 rounded-xl text-white font-bold shadow-lg transition-all ${isPaying ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-[#1e3a8a] shadow-[#1e3a8a]/20 hover:-translate-y-0.5'}`}>
            {isPaying ? 'Processing...' : t('payment.add')}
          </button>
        </form>
      </Modal>

      {/* Bill Preview Modal */}
      {billModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200 p-6">
          <div className="flex justify-between items-center mb-6 max-w-3xl mx-auto w-full px-4">
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c5a059]">receipt_long</span> Invoice Preview
            </h2>
            <div className="flex gap-3">
              <button onClick={() => window.open(`/orders/${id}/bill`, '_blank')} className="px-5 py-2 bg-[#c5a059] text-white font-bold rounded-lg hover:bg-[#b38a42] shadow-lg flex items-center gap-2 transition-all">
                <span className="material-symbols-outlined text-[20px]">print</span> Print
              </button>
              <button onClick={() => setBillModal(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors border border-white/20">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
          <div className="flex-1 w-full flex justify-center items-start overflow-hidden">
             {/* Use zoom/scale to make it a cute small preview card */}
             <div 
               className="shadow-2xl rounded-lg overflow-hidden border border-white/10"
               style={{ 
                 transform: 'scale(0.55)', 
                 transformOrigin: 'top center',
                 width: '793px',
                 height: '1122px',
                 marginBottom: '-45%' // Counteracts the unscaled height for the container
               }}
             >
               <OrderBill orderId={id} isPreview={true} />
             </div>
          </div>
        </div>
      )}
      {/* Assign Work Modal */}
      <Modal open={assignModal} onClose={() => setAssignModal(false)} title="Assign Work to Staff">
        <form onSubmit={handleAssignWork} className="space-y-5 mt-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Item</label>
            <div className="relative">
              <select 
                value={assignForm.itemId} 
                onChange={(e) => setAssignForm({ ...assignForm, itemId: e.target.value })} 
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent transition-all outline-none text-slate-700 appearance-none cursor-pointer"
              >
                <option value="">Whole Order (All Items)</option>
                {order?.items?.map((item, idx) => (
                  <option key={idx} value={item._id}>{item.garmentType} (x{item.quantity})</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Staff</label>
            <div className="relative">
              <select 
                value={assignForm.staffId} 
                onChange={(e) => setAssignForm({ ...assignForm, staffId: e.target.value })} 
                required
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent transition-all outline-none text-slate-700 appearance-none cursor-pointer"
              >
                <option value="">Choose a staff member...</option>
                {staffList.map(staff => (
                  <option key={staff._id} value={staff._id}>{staff.name} ({staff.role})</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Piece Rate / Amount (₹)</label>
            <input 
              type="number" 
              value={assignForm.pieceRate} 
              onChange={(e) => setAssignForm({ ...assignForm, pieceRate: e.target.value })} 
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent transition-all outline-none text-slate-700"
              placeholder="e.g. 200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes / Instructions</label>
            <textarea 
              value={assignForm.notes} 
              onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })} 
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent transition-all outline-none text-slate-700 resize-none h-24"
              placeholder="Any specific instructions for this garment..."
            />
          </div>
          <button type="submit" disabled={isAssigning} className={`w-full h-12 mt-2 rounded-xl text-white font-bold shadow-lg transition-all ${isAssigning ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 shadow-blue-600/20 hover:-translate-y-0.5'}`}>
            {isAssigning ? 'Saving...' : 'Save Assignment'}
          </button>
        </form>
      </Modal>

    </div>
  );
}
