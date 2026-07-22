import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import { getOrder } from '../api/orders.js';
import { listCustomerMeasurements } from '../api/measurements.js';
import { Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MeasurementCard({ orderId: propOrderId, isPreview = false }) {
  const { id: paramId } = useParams();
  const id = propOrderId || paramId;
  const [order, setOrder] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id)
      .then(({ data }) => {
        setOrder(data.order);
        const custId = typeof data.order.customerId === 'object' ? data.order.customerId._id : data.order.customerId;
        return listCustomerMeasurements(custId);
      })
      .then(({ data }) => setMeasurements(data.measurements))
      .catch(() => toast.error('Failed to load measurements'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!loading && order && measurements.length > 0 && !isPreview) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [loading, order, measurements, isPreview]);

  if (loading || !order) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const itemsToRender = order.items && order.items.length > 0 ? order.items : [{ garmentType: order.garmentType }];

  return (
    <div className="min-h-screen bg-slate-200 py-8 print:bg-transparent print:py-0 font-sans text-slate-800">
      {/* A4 Container */}
      <div className="w-[210mm] min-h-[297mm] bg-[#fcfbf7] mx-auto shadow-2xl print:shadow-none relative" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
        
        {/* Outer Gold Border */}
        <div className="absolute inset-1.5 border-4 border-[#001f3f] pointer-events-none z-50"></div>
        <div className="absolute inset-2 border border-[#c5a059] pointer-events-none z-50"></div>

        {/* Header Section */}
        <div className="flex justify-between items-start pt-8 px-8 relative z-10">
          {/* Left Navy Block */}
          <div className="bg-[#001f3f] w-[200px] rounded-br-[50px] p-6 text-center text-[#c5a059] shadow-lg relative -ml-8 -mt-8">
            <div className="w-24 h-24 mx-auto rounded-full border-2 border-[#c5a059] flex items-center justify-center mb-2 overflow-hidden bg-white/5">
              {tenant?.logo?.url ? (
                <img src={tenant.logo.url} alt="Shop Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="material-symbols-outlined text-5xl">checkroom</span>
              )}
            </div>
            <p className="text-xs font-bold tracking-widest mt-2">SINCE {new Date(tenant?.createdAt).getFullYear() || '1985'}</p>
          </div>

          {/* Center Title */}
          <div className="flex-1 text-center mt-2 px-4">
            <p className="text-sm font-bold text-slate-600 mb-1">M/s.</p>
            <h1 className="text-4xl font-black tracking-tight text-[#001f3f] leading-none mb-1 uppercase">
              {tenant?.shopName || 'GOHEL TAILORS'}
            </h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-[1px] w-12 bg-[#c5a059]"></div>
              <span className="text-[#c5a059] text-xs font-bold uppercase tracking-widest">
                TAILORS & SONS
              </span>
              <div className="h-[1px] w-12 bg-[#c5a059]"></div>
            </div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mt-2">
              MEASUREMENT CARD
            </p>
          </div>

          {/* Right Navy Block */}
          <div className="bg-[#001f3f] w-[240px] rounded-bl-[50px] p-6 text-white text-xs space-y-3 relative -mr-8 -mt-8 shadow-lg text-right">
            <div className="flex items-center justify-end gap-2 text-sm font-bold">
              <Phone className="w-4 h-4 text-[#c5a059]" /> {tenant?.phone}
            </div>
            {tenant?.whatsapp && (
               <div className="flex items-center justify-end gap-2 text-sm font-bold text-emerald-400">
                 <span className="material-symbols-outlined text-[16px]">chat</span> {tenant?.whatsapp}
               </div>
            )}
            <div className="pt-3 border-t border-white/20 mt-3 text-[10px] leading-tight flex gap-2 justify-end text-right">
               <div className="flex-1">
                 {tenant?.address?.line1 || 'Main Street'}<br/>
                 {tenant?.address?.city || 'City'}, {tenant?.address?.state}<br/>
                 {tenant?.address?.pincode}
               </div>
               <MapPin className="w-4 h-4 text-[#c5a059] flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Customer & Order Details Grid */}
        <div className="px-10 mt-12 mb-10 relative z-10 grid grid-cols-2 gap-8">
          {/* Customer Details */}
          <div className="border border-[#001f3f]/20 rounded-2xl p-5 bg-white relative">
            <div className="absolute -top-3 left-6 bg-[#c5a059] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">person</span> CUSTOMER
            </div>
            <div className="space-y-2.5 mt-2">
              <div className="grid grid-cols-[80px_1fr] text-sm">
                <span className="text-slate-500 font-semibold">Name</span>
                <span className="text-[#001f3f] font-bold capitalize">: {order.customerId?.name}</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] text-sm">
                <span className="text-slate-500 font-semibold">Mobile</span>
                <span className="text-slate-800 font-medium">: {order.customerId?.phone}</span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="border border-[#001f3f]/20 rounded-2xl p-5 bg-white relative">
            <div className="absolute -top-3 left-6 bg-[#c5a059] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">receipt_long</span> ORDER
            </div>
            <div className="space-y-2.5 mt-2">
              <div className="grid grid-cols-[80px_1fr] text-sm">
                <span className="text-slate-500 font-semibold">Order No.</span>
                <span className="text-[#001f3f] font-bold">: {order.invoiceNumber}</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] text-sm">
                <span className="text-slate-500 font-semibold">Date</span>
                <span className="text-slate-800 font-medium">: {formatDate(order.createdAt)}</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] text-sm">
                <span className="text-slate-500 font-semibold">Delivery</span>
                <span className="text-slate-800 font-medium">: {formatDate(order.deliveryDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Measurements Content */}
        <div className="px-10 mb-8 relative z-10 space-y-8 pb-10">
          {itemsToRender.map((item, idx) => {
            const measurement = measurements.find(m => m.garmentType?.toLowerCase().trim() === item.garmentType?.toLowerCase().trim());
            
            return (
              <div key={idx} className="border border-slate-300 rounded-2xl overflow-hidden bg-white print:border-slate-400">
                <div className="bg-[#001f3f] text-white px-6 py-3 flex items-center justify-between">
                  <h3 className="font-bold text-lg uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined">straighten</span> 
                    {item.garmentType} <span className="text-[#c5a059]">({item.quantity} PCs)</span>
                  </h3>
                </div>
                
                <div className="p-6">
                  {!measurement ? (
                    <div className="text-slate-500 italic">No measurement profile found for this garment type.</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Object.entries(measurement.values || {}).map(([key, value]) => (
                          <div key={key} className="border-b-2 border-slate-200 pb-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{key.replace(/_/g, ' ')}</p>
                            <p className="text-xl font-black text-[#001f3f]">{value}</p>
                          </div>
                        ))}
                      </div>
                      
                      {measurement.notes && (
                        <div className="mt-8 border border-dashed border-[#c5a059] bg-[#c5a059]/5 rounded-xl p-4">
                          <p className="text-xs font-bold text-[#c5a059] uppercase tracking-widest mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">note_alt</span> Notes
                          </p>
                          <p className="text-sm font-medium text-slate-700 italic">{measurement.notes}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          
          {order.specialInstructions && (
            <div className="mt-4 border-2 border-slate-800 rounded-xl p-4 bg-slate-50">
               <p className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-1">
                 <span className="material-symbols-outlined text-[14px]">warning</span> Special Order Instructions
               </p>
               <p className="text-sm font-bold text-slate-700 uppercase">{order.specialInstructions}</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
