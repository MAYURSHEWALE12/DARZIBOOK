import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createOrder, uploadOrderPhotos } from '../api/orders.js';
import { listCustomers } from '../api/customers.js';
import { listTemplates } from '../api/templates.js';
import Button from '../components/Button.jsx';
import CustomSelect from '../components/CustomSelect.jsx';
import DatePicker from '../components/DatePicker.jsx';
import AutocompleteSelect from '../components/AutocompleteSelect.jsx';
import Card, { CardHeader, CardContent } from '../components/Card.jsx';
import toast from 'react-hot-toast';
import { User, Shirt, CalendarDays, IndianRupee, CreditCard, AlignLeft } from 'lucide-react';

export default function OrderForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [customerMeasurements, setCustomerMeasurements] = useState([]);
  const [form, setForm] = useState({
    customerId: searchParams.get('customerId') || '',
    items: [{ garmentType: '', quantity: 1, price: '' }],
    deliveryDate: new Date().toISOString().split('T')[0],
    totalPrice: '',
    advancePaid: '0',
    specialInstructions: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listCustomers()
      .then(({ data }) => setCustomers(data.customers))
      .catch(() => toast.error('Failed to load customers'));
    listTemplates()
      .then(({ data }) => setTemplates(data.templates))
      .catch(() => toast.error('Failed to load garment templates'));
  }, []);

  useEffect(() => {
    if (!form.customerId) {
      setCustomerMeasurements([]);
      return;
    }
    
    // We need to import listCustomerMeasurements
    import('../api/measurements.js').then(({ listCustomerMeasurements }) => {
      listCustomerMeasurements(form.customerId)
        .then(({ data }) => {
          setCustomerMeasurements(data.measurements || []);
          // If the currently selected garmentType is not in the new measurements list, clear it
          
          setForm(prev => {
            const newItems = prev.items.map(item => {
              if (item.garmentType && !data.measurements.find(m => m.garmentType?.toLowerCase().trim() === item.garmentType.toLowerCase().trim())) {
                return { ...item, garmentType: '' };
              }
              return item;
            });
            return { ...prev, items: newItems };
          });

        })
        .catch(() => toast.error('Failed to load customer measurements'));
    });
  }, [form.customerId]);

  const availableGarments = templates.filter(t => 
    customerMeasurements.some(m => 
      m.templateId === t._id || 
      (m.garmentType && t.garmentType && m.garmentType.toLowerCase().trim() === t.garmentType.toLowerCase().trim())
    )
  );

  const garmentEmptyState = !form.customerId ? (
    <div className="py-6 text-center flex flex-col items-center px-4">
      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-3">
        <span className="material-symbols-outlined text-[20px] text-slate-300">person_search</span>
      </div>
      <p className="text-slate-500 font-medium text-[13px] leading-snug">Please select a customer first to view their available garments.</p>
    </div>
  ) : availableGarments.length === 0 ? (
    <div className="py-6 text-center flex flex-col items-center px-4">
      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-3">
        <span className="material-symbols-outlined text-[20px] text-slate-300">straighten</span>
      </div>
      <p className="text-slate-500 font-medium text-[13px] mb-3 leading-snug">No measurements found for this customer.</p>
      <button 
        type="button"
        onClick={() => navigate(`/measurements/new?customerId=${form.customerId}`)}
        className="text-[#1e3a8a] text-[12px] font-bold bg-[#1e3a8a]/10 hover:bg-[#1e3a8a]/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        Add Measurement
      </button>
    </div>
  ) : undefined;

  const calculatedTotal = form.items.reduce((sum, item) => sum + (Number(item.quantity || 1) * Number(item.price || 0)), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await createOrder({
        ...form,
        totalPrice: calculatedTotal,
        advancePaid: Number(form.advancePaid),
        items: form.items.map(i => ({ ...i, quantity: Number(i.quantity || 1), price: Number(i.price || 0) }))
      });

      if (form.photos && form.photos.length > 0) {
        const formData = new FormData();
        Array.from(form.photos).forEach(file => formData.append('photos', file));
        try {
          await uploadOrderPhotos(data.order._id, formData);
        } catch (uploadErr) {
          const errMsg = uploadErr.response?.data?.message || uploadErr.response?.data?.error || 'failed to upload some photos.';
          toast.error(`Order created, but ${errMsg}`);
        }
      }

      toast.success('Order created');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{t('order.new')}</h1>
          <p className="text-slate-500 mt-1">{t('order.newDesc')}</p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Customer & Garment */}
        <Card>
          <CardHeader>
            <h2 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('order.customerAndGarment')}</h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('customer.name')}</label>
                <AutocompleteSelect 
                  value={form.customerId} 
                  onChange={(val) => setForm({ ...form, customerId: val })}
                  options={customers.map((c) => ({ value: c._id, label: `${c.name} (${c.phone})` }))}
                  placeholder={t('customer.searchPlaceholder')}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('order.garments')}</label>
                  <button type="button" onClick={() => setForm({...form, items: [...form.items, {garmentType: '', quantity: 1, price: ''}]})} className="text-[12px] font-bold text-[#1e3a8a] flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-[16px]">add</span> {t('order.addGarment')}
                  </button>
                </div>
                
                <div className="mt-2 border border-slate-200 rounded-xl bg-white shadow-sm w-full relative z-10">
                  <table className="w-full text-left table-fixed">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-1 sm:px-4 py-3 w-[42%] sm:w-auto rounded-tl-xl break-words">{t('order.garmentType')}</th>
                        <th className="px-1 sm:px-4 py-3 w-[22%] sm:w-24 break-words leading-tight text-[9px] sm:text-[10px]">{t('order.quantity')}</th>
                        <th className="px-1 sm:px-4 py-3 w-[26%] sm:w-28 break-words leading-tight text-[9px] sm:text-[10px]">Rate (₹)</th>
                        <th className="px-1 sm:px-4 py-3 w-[10%] sm:w-12 text-center rounded-tr-xl"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {form.items.map((item, index) => (
                        <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-1 sm:px-4 py-3 align-top sm:align-middle">
                            <CustomSelect 
                              value={item.garmentType} 
                              onChange={(val) => {
                                const newItems = [...form.items];
                                newItems[index].garmentType = val;
                                setForm({ ...form, items: newItems });
                              }}
                              options={availableGarments.map((t) => ({ value: t.garmentType, label: t.garmentType }))}
                              placeholder={!form.customerId ? t('order.selectCustomerFirst') : availableGarments.length === 0 ? t('order.noMeasurements') : t('order.selectType')}
                              emptyState={garmentEmptyState}
                              searchable={false}
                              className="w-full bg-white rounded-lg border-slate-200"
                            />
                          </td>
                          <td className="px-1 sm:px-4 py-3 align-top sm:align-middle">
                            <input 
                              type="number"
                              min="1"
                              value={item.quantity || 1} 
                              onChange={(e) => {
                                const newItems = [...form.items];
                                newItems[index].quantity = parseInt(e.target.value) || 1;
                                setForm({ ...form, items: newItems });
                              }}
                              className="w-full h-[42px] px-2 sm:px-3 bg-white border border-slate-200 rounded-lg outline-none text-[13px] text-slate-800 font-bold focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                            />
                          </td>
                          <td className="px-1 sm:px-4 py-3 align-top sm:align-middle">
                            <input 
                              type="number"
                              min="0"
                              value={item.price ?? ''} 
                              onChange={(e) => {
                                const newItems = [...form.items];
                                newItems[index].price = e.target.value;
                                setForm({ ...form, items: newItems });
                              }}
                              placeholder="0"
                              className="w-full h-[42px] px-2 sm:px-3 bg-white border border-slate-200 rounded-lg outline-none text-[13px] text-slate-800 font-bold focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                            />
                          </td>
                          <td className="px-1 sm:px-4 py-3 text-center align-top sm:align-middle pt-4 sm:pt-3">
                            {form.items.length > 1 ? (
                              <button 
                                type="button" 
                                onClick={() => {
                                  const newItems = [...form.items];
                                  newItems.splice(index, 1);
                                  setForm({...form, items: newItems});
                                }} 
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors mx-auto"
                                title={t('order.removeGarment')}
                              >
                                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">delete</span>
                              </button>
                            ) : (
                              <div className="w-7 h-7 sm:w-8 sm:h-8 mx-auto"></div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <h2 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('order.details')}</h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('order.deliveryDate')}</label>
                <DatePicker 
                  selected={form.deliveryDate} 
                  onChange={(date) => setForm({ ...form, deliveryDate: date.toISOString().split('T')[0] })} 
                  minDate={new Date()}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('order.totalPrice')}</label>
                <div className="relative flex items-center w-full h-12 rounded-lg border border-slate-200 focus-within:ring-1 focus-within:ring-[#1e3a8a] focus-within:border-[#1e3a8a] transition-all overflow-hidden bg-white">
                  <div className="h-full px-4 flex items-center justify-center bg-slate-50 border-r border-slate-200">
                    <IndianRupee className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    type="number"
                    value={calculatedTotal} 
                    readOnly
                    placeholder="0"
                    className="w-full h-full px-4 bg-transparent outline-none text-[14px] text-slate-800 font-bold cursor-not-allowed opacity-70"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('order.advancePaid')}</label>
                <div className="relative flex items-center w-full h-12 rounded-lg border border-slate-200 focus-within:ring-1 focus-within:ring-[#1e3a8a] focus-within:border-[#1e3a8a] transition-all overflow-hidden bg-white">
                  <div className="h-full px-4 flex items-center justify-center bg-slate-50 border-r border-slate-200">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                  </div>
                  <input 
                    type="number"
                    value={form.advancePaid} 
                    onChange={(e) => setForm({ ...form, advancePaid: e.target.value })}
                    placeholder="0"
                    className="w-full h-full px-4 bg-transparent outline-none text-[14px] text-emerald-600 font-bold"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Remarks & Images */}
        <Card>
          <CardHeader>
            <h2 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">Remarks & Images</h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('order.specialInstructions')}</label>
                <div className="relative flex w-full rounded-lg border border-slate-200 focus-within:ring-1 focus-within:ring-[#1e3a8a] focus-within:border-[#1e3a8a] transition-all overflow-hidden bg-white h-full">
                  <div className="px-4 py-3 flex items-start justify-center bg-slate-50 border-r border-slate-200">
                    <AlignLeft className="w-4 h-4 text-slate-400" />
                  </div>
                  <textarea 
                    value={form.specialInstructions} 
                    onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })}
                    className="w-full p-3 bg-transparent outline-none text-[13px] text-slate-700 min-h-[120px] resize-none font-medium"
                    placeholder="Any specific design requests or fabric notes..."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('order.referenceImages')}</label>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {form.photos?.length > 0 && Array.from(form.photos).map((file, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg border border-slate-200 overflow-hidden group shadow-sm">
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={(e) => {
                          e.preventDefault();
                          const newPhotos = [...form.photos];
                          newPhotos.splice(idx, 1);
                          setForm({...form, photos: newPhotos});
                        }} className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-white text-[20px]">delete</span>
                        </button>
                      </div>
                    ))}
                    {(!form.photos || form.photos.length < 5) && (
                      <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-slate-400 text-[24px]">add_photo_alternate</span>
                        <span className="text-[10px] text-slate-500 font-bold mt-1">ADD</span>
                        <input 
                          type="file" 
                          multiple 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => {
                            if (!e.target.files?.length) return;
                            const files = Array.from(e.target.files);
                            const existing = form.photos ? Array.from(form.photos) : [];
                            const combined = [...existing, ...files].slice(0, 5);
                            setForm({ ...form, photos: combined });
                            e.target.value = ''; 
                          }} 
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">{t('order.referenceImagesDesc')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-4 pt-2 pb-8">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="px-8 bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50">
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={loading} disabled={!form.customerId || !form.items.some(i => i.garmentType)} className="px-10 bg-[#1e3a8a] text-white hover:bg-[#152a66] font-bold">
            {t('common.create')}
          </Button>
        </div>
      </form>
    </div>
  );
}
