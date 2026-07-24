import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore.js';
import { getOrder } from '../api/orders.js';
import { Scissors, Phone, MapPin, CheckCircle2, Ruler, Instagram, Facebook, Twitter, Crown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderBill({ orderId: propOrderId, isPreview = false }) {
  const { id: paramId } = useParams();
  const id = propOrderId || paramId;
  const [order, setOrder] = useState(null);
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!loading && order && !isPreview) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [loading, order, isPreview]);

  if (loading || !order) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-200 py-8 print:bg-transparent print:py-0 font-sans text-slate-800">
      {/* A4 Container */}
      <div className="w-[210mm] min-h-[297mm] bg-[#fcfbf7] mx-auto shadow-2xl print:shadow-none overflow-hidden relative" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
        
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
              PERFECT FIT, PERFECT YOU
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

        {/* RECEIPT / INVOICE Title Pill */}
        <div className="flex justify-center mt-4 mb-6 relative z-10">
          <div className="bg-[#001f3f] text-white px-8 py-2 rounded-full border border-[#c5a059] shadow-md">
            <h2 className="text-sm font-bold tracking-widest">RECEIPT / INVOICE</h2>
          </div>
        </div>

        {/* Details Cards Section */}
        <div className="px-10 grid grid-cols-3 gap-6 mb-8 items-start relative z-10">
          
          {/* Customer Details */}
          <div className="border border-[#c5a059] rounded-xl pt-6 p-4 relative bg-white h-full">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c5a059] text-white px-4 py-1 rounded-full text-[10px] font-bold tracking-wider whitespace-nowrap flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-[14px]">person</span> CUSTOMER DETAILS
            </div>
            <table className="w-full text-xs font-semibold text-slate-700 border-separate border-spacing-y-2">
              <tbody>
                <tr><td className="w-6 text-slate-400"><span className="material-symbols-outlined text-[16px]">person</span></td><td className="w-16 text-slate-500">Name</td><td>: {order.customerId?.name}</td></tr>
                <tr><td className="w-6 text-slate-400"><Phone className="w-3.5 h-3.5" /></td><td className="w-16 text-slate-500">Mobile</td><td>: {order.customerId?.phone}</td></tr>
                <tr><td className="w-6 text-slate-400"><MapPin className="w-3.5 h-3.5" /></td><td className="w-16 text-slate-500 align-top">Address</td><td className="align-top">: {order.customerId?.address || '-'}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Central Invoice Block */}
          <div className="bg-[#001f3f] border-2 border-[#c5a059] rounded-xl p-4 text-center text-white shadow-lg h-full flex flex-col justify-center">
            <p className="text-[10px] font-bold text-[#c5a059] mb-2 uppercase">INVOICE NO.</p>
            <div className="bg-white/10 border border-[#c5a059] text-[#c5a059] py-1.5 px-2 rounded font-mono font-bold text-sm tracking-wider mb-3">
              {order.invoiceNumber}
            </div>
            <div className="w-full h-[1px] bg-white/20 mb-3"></div>
            <p className="text-[10px] font-bold text-[#c5a059] mb-1 uppercase">DATE</p>
            <p className="font-bold text-sm">{formatDate(order.createdAt)}</p>
          </div>

          {/* Order Details */}
          <div className="border border-[#c5a059] rounded-xl pt-6 p-4 relative bg-white h-full">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c5a059] text-white px-4 py-1 rounded-full text-[10px] font-bold tracking-wider whitespace-nowrap flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-[14px]">receipt_long</span> ORDER DETAILS
            </div>
            <table className="w-full text-xs font-semibold text-slate-700 border-separate border-spacing-y-2">
              <tbody>
                <tr><td className="w-20 text-slate-500">Order No.</td><td>: {order.invoiceNumber}</td></tr>
                <tr><td className="w-20 text-slate-500">Order Date</td><td>: {formatDate(order.createdAt)}</td></tr>
                <tr><td className="w-20 text-slate-500">Delivery</td><td>: {formatDate(order.deliveryDate) || '-'}</td></tr>
                <tr><td className="w-20 text-slate-500">Status</td><td className="capitalize">: {order.status.replace('_', ' ')}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="px-10 mb-8 relative z-10">
          <table className="w-full text-sm border-collapse border border-slate-200 bg-white">
            <thead>
              <tr className="bg-[#001f3f] text-white text-[10px] font-bold uppercase tracking-wider">
                <th className="py-2 px-3 border-r border-[#001f3f] border-x-white/20 text-center w-10">SR.</th>
                <th className="py-2 px-3 border-r border-[#001f3f] border-x-white/20 text-left">PARTICULARS</th>
                <th className="py-2 px-3 border-r border-[#001f3f] border-x-white/20 text-center w-12">QTY.</th>
                <th className="py-2 px-3 border-r border-[#001f3f] border-x-white/20 text-right w-20">RATE (₹)</th>
                <th className="py-2 px-3 text-right w-20">AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              {/* Dynamic Items Rendering */}
              {order.items && order.items.length > 0 ? (
                (() => {
                  const hasValidPrices = order.items.some(i => i.price > 0);
                  const totalQty = order.items.reduce((sum, i) => sum + (i.quantity || 1), 0);
                  const fallbackRate = (!hasValidPrices && order.totalPrice > 0 && totalQty > 0) ? (order.totalPrice / totalQty) : 0;

                  return order.items.map((item, index) => {
                    const rateToUse = item.price || fallbackRate;
                    const amountToUse = rateToUse * (item.quantity || 1);

                    return (
                      <tr key={index} className="border-b border-slate-200">
                        <td className="py-2 px-3 border-r border-slate-200 text-center text-[11px] font-semibold text-slate-500">{index + 1}</td>
                        <td className="py-2 px-3 border-r border-slate-200">
                          <div className="flex items-center gap-2 font-bold text-slate-800 capitalize text-[11px]">
                            <div>
                              {item.garmentType}
                              {order.specialInstructions && index === 0 && (
                                <div className="text-[9px] text-slate-500 font-normal normal-case mt-0.5">Note: {order.specialInstructions}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200 text-center font-semibold text-slate-700 text-[11px]">{item.quantity}</td>
                        <>
                          <td className="py-2 px-3 border-r border-slate-200 text-right font-semibold text-slate-700 text-[11px]">{rateToUse.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-800 text-[11px]">{amountToUse.toFixed(2)}</td>
                        </>
                      </tr>
                    );
                  });
                })()
              ) : (
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-3 border-r border-slate-200 text-center text-[11px] font-semibold text-slate-500">1</td>
                  <td className="py-2 px-3 border-r border-slate-200">
                    <div className="flex items-center gap-2 font-bold text-slate-800 capitalize text-[11px]">
                      <div>
                        {order.garmentType}
                        {order.specialInstructions && (
                          <div className="text-[9px] text-slate-500 font-normal normal-case mt-0.5">Note: {order.specialInstructions}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-center font-semibold text-slate-700 text-[11px]">{order.quantity || 1}</td>
                  <td className="py-2 px-3 border-r border-slate-200 text-right font-semibold text-slate-700 text-[11px]">{order.quantity ? (order.totalPrice / order.quantity).toFixed(2) : '0.00'}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-800 text-[11px]">{order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</td>
                </tr>
              )}
              {/* Total Row */}
              <tr className="border-t-2 border-[#001f3f] bg-white">
                <td colSpan="4" className="py-2.5 px-3 border-r border-slate-200 text-right font-bold text-[#001f3f] text-[10px] uppercase tracking-wider">Overall Amount</td>
                <td className="py-2.5 px-3 text-right font-bold text-[#001f3f] text-[12px]">₹ {order.totalPrice.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary & Payments Section */}
        <div className="px-10 grid grid-cols-3 gap-6 mb-8 items-stretch relative z-10">
          
          {/* Payment Details Box */}
          <div className="bg-white border-2 border-[#001f3f] rounded-xl relative h-full flex flex-col overflow-hidden">
             <div className="bg-[#001f3f] text-white text-[11px] font-bold px-4 py-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#c5a059]">account_balance_wallet</span> PAYMENT DETAILS
             </div>
             <div className="p-4 flex-1 flex flex-col justify-between">
                <table className="w-full text-xs font-semibold text-slate-700 border-separate border-spacing-y-2">
                  <tbody>
                    <tr><td className="w-28 text-slate-500">Total Amount</td><td>:</td><td className="text-right font-bold text-slate-800">₹ {order.totalPrice.toFixed(2)}</td></tr>
                    <tr><td className="w-28 text-slate-500">Advance Paid</td><td>:</td><td className="text-right font-bold text-emerald-600">₹ {order.advancePaid.toFixed(2)}</td></tr>
                    <tr><td className="w-28 text-slate-500">Balance Amount</td><td>:</td><td className="text-right font-bold text-rose-600">₹ {order.pendingAmount.toFixed(2)}</td></tr>
                    <tr><td className="w-28 text-slate-500">Payment Mode</td><td>:</td><td className="text-right font-bold text-slate-700 capitalize">Cash/UPI</td></tr>
                  </tbody>
                </table>
             </div>
             <div className="bg-[#fcfbf7] p-3 border-t border-slate-100">
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">AMOUNT (IN WORDS)</p>
               <p className="text-[11px] font-bold text-[#001f3f] capitalize">
                 {(() => {
                    const num = Math.floor(order.totalPrice || 0);
                    if (num === 0) return 'Zero Rupees Only';
                    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
                    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
                    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
                    if (!n) return 'Amount too large';
                    let str = '';
                    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
                    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
                    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
                    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
                    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
                    return str.trim() + ' rupees only';
                 })()}
               </p>
             </div>
          </div>

          {/* Center Premium Badge */}
          <div className="flex flex-col items-center justify-center text-center mt-2">
             <div className="w-24 h-28 bg-[#001f3f] rounded-t-full relative flex items-center justify-center border-4 border-[#c5a059] shadow-lg mb-2">
               <div className="text-center absolute inset-0 flex flex-col items-center justify-center pt-2">
                 <Crown className="w-6 h-6 text-[#c5a059] mb-1" />
                 <p className="text-[#c5a059] text-[9px] font-bold uppercase tracking-wider leading-tight px-2">PREMIUM<br/>STITCHING</p>
               </div>
             </div>
             <div className="bg-[#c5a059] text-white text-[10px] font-bold px-4 py-1 uppercase tracking-widest relative -mt-4 shadow-md z-10 w-[110%] text-center border border-[#b38a42]">
               QUALITY & TRUST
             </div>
             <p className="font-cursive text-[#001f3f] text-2xl mt-4" style={{ fontFamily: "'Dancing Script', cursive" }}>Thank You!</p>
             <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mt-1">We appreciate your trust in us.</p>
          </div>

          {/* Summary Box */}
          <div className="bg-white border-2 border-[#001f3f] rounded-xl relative h-full flex flex-col overflow-hidden">
             <div className="bg-[#001f3f] text-white text-[11px] font-bold px-4 py-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#c5a059]">bar_chart</span> SUMMARY
             </div>
             <div className="p-4 flex-1">
                <table className="w-full text-xs font-semibold text-slate-700 border-separate border-spacing-y-2 mb-4">
                  <tbody>
                    <tr><td className="w-24 text-slate-500">Sub Total</td><td>:</td><td className="text-right font-bold text-slate-800">₹ {order.totalPrice.toFixed(2)}</td></tr>
                    <tr><td className="w-24 text-slate-500">Discount</td><td>:</td><td className="text-right font-bold text-slate-800">₹ 0.00</td></tr>
                    <tr><td className="w-24 text-slate-500">Tax (0%)</td><td>:</td><td className="text-right font-bold text-slate-800">₹ 0.00</td></tr>
                  </tbody>
                </table>
                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-[#800000] uppercase tracking-wider">GRAND TOTAL</span>
                  <span className="text-sm font-black text-[#800000]">₹ {order.totalPrice.toFixed(2)}</span>
                </div>
             </div>
             <div className="bg-[#fdf0d5] border border-[#f5d9a0] m-3 mt-0 p-3 rounded-lg text-center shadow-inner">
               <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">BALANCE DUE</p>
               <p className="text-xl font-black text-[#001f3f]">₹ {order.pendingAmount.toFixed(2)}</p>
             </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="px-10 mt-auto relative z-10 pb-[100px]">
          <div className="border border-slate-200 rounded-xl bg-white p-4 flex justify-between items-start">
            <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                 <Ruler className="w-4 h-4" />
               </div>
               <div>
                 <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-1">MEASUREMENT TAKEN BY</p>
                 <p className="text-xs font-semibold text-slate-500">{tenant?.ownerName || 'Master Tailor'}</p>
                 <p className="text-xs font-semibold text-slate-400">{formatDate(order.createdAt)}</p>
               </div>
            </div>
            
            <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                 <CheckCircle2 className="w-4 h-4" />
               </div>
               <div>
                 <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-1">TERMS & CONDITIONS</p>
                 <ul className="text-[9px] text-slate-500 font-medium space-y-0.5 list-disc pl-4">
                   <li>No exchange or return after stitching.</li>
                   <li>Advance once paid will not be refunded.</li>
                   <li>Delivery date may vary depending on workload.</li>
                 </ul>
               </div>
            </div>

            <div className="flex gap-3 items-center border-l border-slate-200 pl-6">
               <Scissors className="w-6 h-6 text-[#c5a059] -rotate-45" />
               <div>
                 <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-1">THANK YOU!</p>
                 <p className="text-[9px] text-slate-500 font-medium mb-1">We look forward to<br/>serving you again.</p>
                 <p className="text-[9px] font-bold text-slate-800 uppercase tracking-widest">M/s. {tenant?.shopName || 'TAILORS & SONS'}</p>
               </div>
            </div>
          </div>
        </div>



      </div>
      
      {/* Import Dancing Script for the signature and Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }
          html, body {
            height: 100vh;
            overflow: hidden;
          }
        }
      `}} />
    </div>
  );
}
