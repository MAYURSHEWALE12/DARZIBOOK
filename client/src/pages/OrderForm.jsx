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
    items: [{ garmentType: '', quantity: 1 }],
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await createOrder({
        ...form,
        totalPrice: Number(form.totalPrice),
        advancePaid: Number(form.advancePaid),
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
          <p className="text-slate-500 mt-1">Create a new tailoring order and track payment.</p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Customer & Garment */}
        <Card>
          <CardHeader>
            <h2 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">Customer & Garment</h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('customer.name')}</label>
                <AutocompleteSelect 
                  value={form.customerId} 
                  onChange={(val) => setForm({ ...form, customerId: val })}
                  options={customers.map((c) => ({ value: c._id, label: `${c.name} (${c.phone})` }))}
                  placeholder="Search customer by name or phone..."
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Garments</label>
                  <button type="button" onClick={() => setForm({...form, items: [...form.items, {garmentType: '', quantity: 1}]})} className="text-[12px] font-bold text-[#1e3a8a] flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-[16px]">add</span> Add Garment
                  </button>
                </div>
                
                <div className="mt-4 space-y-4">
                  {form.items.map((item, index) => (
                    <div key={index} className="relative border border-slate-200 rounded-xl bg-slate-50/50 p-4 sm:p-5 group hover:border-slate-300 transition-colors">
                      {form.items.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => {
                            const newItems = [...form.items];
                            newItems.splice(index, 1);
                            setForm({...form, items: newItems});
                          }} 
                          className="absolute -top-2.5 -right-2.5 bg-white border border-rose-200 text-rose-500 rounded-full w-7 h-7 flex items-center justify-center shadow-sm hover:bg-rose-50 hover:text-rose-700 transition-colors z-10"
                          title="Remove Garment"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                        <div className="sm:col-span-8 lg:col-span-9 space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('order.garmentType')}</label>
                          <CustomSelect 
                            value={item.garmentType} 
                            onChange={(val) => {
                              const newItems = [...form.items];
                              newItems[index].garmentType = val;
                              setForm({ ...form, items: newItems });
                            }}
                            options={availableGarments.map((t) => ({ value: t.garmentType, label: t.garmentType }))}
                            placeholder={!form.customerId ? "Select customer first" : availableGarments.length === 0 ? "No measurements found" : "Select type"}
                            emptyState={garmentEmptyState}
                            searchable={false}
                            className="w-full bg-white rounded-lg border-slate-200 shadow-sm"
                          />
                        </div>
                        
                        <div className="sm:col-span-4 lg:col-span-3 space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('order.quantity')}</label>
                          <input 
                            type="number"
                            min="1"
                            value={item.quantity || 1} 
                            onChange={(e) => {
                              const newItems = [...form.items];
                              newItems[index].quantity = parseInt(e.target.value) || 1;
                              setForm({ ...form, items: newItems });
                            }}
                            className="w-full h-[42px] px-3 bg-white border border-slate-200 rounded-lg shadow-sm outline-none text-[13px] text-slate-800 font-bold focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <h2 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">Order Details</h2>
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
                    value={form.totalPrice} 
                    onChange={(e) => setForm({ ...form, totalPrice: e.target.value })}
                    required
                    placeholder="0"
                    className="w-full h-full px-4 bg-transparent outline-none text-[14px] text-slate-800 font-bold"
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
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Order Reference Images</label>
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
                  <p className="text-[11px] text-slate-500 font-medium">Upload up to 5 reference images for design or fabric details.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
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
