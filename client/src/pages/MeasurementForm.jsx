import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createMeasurement, getMeasurement, updateMeasurement } from '../api/measurements.js';
import { listTemplates } from '../api/templates.js';
import { listCustomers } from '../api/customers.js';
import toast from 'react-hot-toast';
import CustomSelect from '../components/CustomSelect.jsx';

export default function MeasurementForm() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerId: searchParams.get('customerId') || '',
    templateId: '',
    garmentType: '',
    values: {},
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    Promise.all([listCustomers(), listTemplates()]).then(([custRes, tempRes]) => {
      setCustomers(custRes.data.customers);
      setTemplates(tempRes.data.templates);
      
      if (id) {
        getMeasurement(id).then(({ data }) => {
          const m = data.measurement;
          setForm({
            customerId: typeof m.customerId === 'object' ? m.customerId._id : m.customerId,
            templateId: m.templateId,
            garmentType: m.garmentType,
            values: m.values,
            notes: m.notes || '',
            date: m.date ? new Date(m.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          });
          const template = tempRes.data.templates.find((t) => t._id === m.templateId);
          setSelectedTemplate(template);
        }).catch(() => toast.error('Failed to load measurement'));
      }
    });
  }, [id]);

  const handleTemplateChange = (templateId) => {
    const template = templates.find((t) => t._id === templateId);
    setSelectedTemplate(template);
    setForm({ ...form, templateId, garmentType: template?.garmentType || '', values: {} });
  };

  const handleValueChange = (key, value) => {
    setForm({ ...form, values: { ...form.values, [key]: value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('customerId', form.customerId);
      formData.append('templateId', form.templateId);
      formData.append('garmentType', form.garmentType);
      formData.append('notes', form.notes);
      formData.append('date', form.date);
      formData.append('values', JSON.stringify(form.values));
      if (form.image) {
        formData.append('photo', form.image);
      }

      if (id) {
        await updateMeasurement(id, formData);
        toast.success('Measurement updated successfully');
      } else {
        await createMeasurement(formData);
        toast.success('Measurement saved successfully');
      }
      navigate(`/customers/${form.customerId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const lang = i18n.language || 'en';
  const getLabel = (field) => field[`label${lang.charAt(0).toUpperCase() + lang.slice(1)}`] || field.labelEn;

  const selectedCustomer = customers.find(c => c._id === form.customerId);

  const fields = selectedTemplate?.fields || [];

  return (
    <div className="max-w-[1400px] mx-auto min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800 -m-6 md:-m-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-white border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 text-[#001f3f]">
            <span className="material-symbols-outlined text-[28px]">straighten</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#001f3f] tracking-tight uppercase">{id ? t('measurement.edit', 'Edit Measurement') : t('measurement.sheet', 'Measurement Sheet')}</h1>
            <p className="text-sm text-slate-500 font-medium">{t('measurement.subtitle', 'Accurate Measurements, Perfect Fit')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-sm font-semibold text-slate-600 w-full md:w-auto">
          <div className="flex-1 md:flex-none flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 bg-slate-50 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-slate-200 focus-within:border-[#1e3a8a] focus-within:ring-1 focus-within:ring-[#1e3a8a] transition-all relative">
            <span className="uppercase text-[10px] sm:text-xs text-slate-400">{t('common.date', 'Date')}</span>
            <input 
              type="date" 
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="bg-transparent outline-none text-slate-700 text-[11px] sm:text-sm font-semibold w-full sm:w-[125px] cursor-pointer appearance-none"
            />
          </div>
          <div className="flex-1 md:flex-none flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 bg-slate-50 px-2 sm:px-4 py-2 rounded-lg border border-slate-200">
            <span className="uppercase text-[10px] sm:text-xs text-slate-400">{t('common.orderNo', 'Order No.')}</span>
            <span className="text-slate-700 text-[11px] sm:text-sm">{t('common.new', 'NEW')}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 p-6">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible flex flex-col z-20">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 rounded-t-[11px]">
              <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('customer.info', 'Customer Information')}</h3>
            </div>
            <div className="p-4 grid grid-cols-1 gap-y-3 flex-1">
              <div className="flex items-center gap-3">
                <span className="w-28 text-[12px] font-semibold text-slate-500">{t('customer.name', 'Customer Name')}</span>
                <CustomSelect
                  value={form.customerId}
                  onChange={(val) => setForm({ ...form, customerId: val })}
                  options={customers.map((c) => ({ value: c._id, label: c.name }))}
                  placeholder={t('customer.select', 'Select customer...')}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-28 text-[12px] font-semibold text-slate-500">{t('customer.phone', 'Phone Number')}</span>
                <input type="text" readOnly value={selectedCustomer?.phone || ''} className="flex-1 h-9 px-3 rounded-md text-[13px] font-medium border border-slate-200 bg-slate-50/50 text-slate-600 outline-none" />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-28 text-[12px] font-semibold text-slate-500">{t('customer.address', 'Address')}</span>
                <input type="text" readOnly value={selectedCustomer?.address?.city || ''} className="flex-1 h-9 px-3 rounded-md text-[13px] font-medium border border-slate-200 bg-slate-50/50 text-slate-600 outline-none" />
              </div>
            </div>
          </div>

          {/* Garment Details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible flex flex-col z-10">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 rounded-t-[11px]">
              <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('garment.details', 'Garment Details')}</h3>
            </div>
            <div className="p-4 grid grid-cols-1 gap-y-3 flex-1">
              <div className="flex items-center gap-3">
                <span className="w-28 text-[12px] font-semibold text-slate-500">{t('order.garmentType', 'Garment Type')}</span>
                <CustomSelect
                  value={form.templateId}
                  onChange={(val) => handleTemplateChange(val)}
                  options={templates.map((t) => ({ value: t._id, label: t.garmentType }))}
                  placeholder={t('garment.select', 'Select garment...')}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-3 opacity-60 pointer-events-none">
                <span className="w-28 text-[12px] font-semibold text-slate-500">{t('garment.fit', 'Fit')}</span>
                <CustomSelect
                  value="Regular Fit"
                  onChange={() => {}}
                  options={[{ value: 'Regular Fit', label: 'Regular Fit' }]}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-3 opacity-60 pointer-events-none">
                <span className="w-28 text-[12px] font-semibold text-slate-500">{t('garment.fabric', 'Fabric')}</span>
                <CustomSelect
                  value="Cotton"
                  onChange={() => {}}
                  options={[{ value: 'Cotton', label: 'Cotton' }]}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:col-span-2 lg:col-span-1">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('measurement.remarks', 'Remarks / Notes')}</h3>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <textarea 
                value={form.notes} 
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="flex-1 w-full p-3 border border-slate-200 rounded-md outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] text-[13px] resize-none font-medium text-slate-700"
                placeholder={t('measurement.notesPlaceholder', 'Any additional notes...')}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Measurements Grid and Image */}
        {fields.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-[#0f172a] px-4 py-3 text-center border-b border-slate-200">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">
                {form.garmentType} {t('measurement.title', 'Measurements')}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 p-5 bg-slate-50/30">
              {fields.map((field, index) => {
                const absoluteIndex = index + 1;
                return (
                  <div key={field.key} className="flex items-center px-4 py-3 gap-4 hover:bg-white bg-white/50 border border-transparent hover:border-slate-200 shadow-sm hover:shadow-md transition-all rounded-xl">
                    <div className="w-7 h-7 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-[12px] font-bold shrink-0 shadow-sm">
                      {absoluteIndex}
                    </div>
                    <label className="flex-1 text-[13px] font-semibold text-slate-700 truncate" title={getLabel(field)}>
                      {getLabel(field)}
                    </label>
                    <div className="flex items-center w-28 relative">
                      <input 
                        type="text"
                        value={form.values[field.key] || ''} 
                        onChange={(e) => handleValueChange(field.key, e.target.value)}
                        className="w-full h-10 px-3 pr-8 rounded-lg border border-slate-200 bg-white focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 outline-none text-[14px] text-right font-bold text-[#1e3a8a] transition-all"
                      />
                      <span className="absolute right-3 text-[12px] text-slate-400 font-medium pointer-events-none">in</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 border-dashed p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-[48px] text-slate-300 mb-4">straighten</span>
            <p className="text-slate-500 font-medium">{t('measurement.empty', 'Select a Garment Type to reveal measurement fields.')}</p>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-8 flex flex-wrap items-center justify-center sm:justify-end gap-3 pb-8">
        <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
          {t('common.cancel', 'Cancel')}
        </button>
        <button type="button" onClick={() => setForm({...form, values: {}})} className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
          {t('common.reset', 'Reset')}
        </button>
        <button 
          onClick={handleSubmit} 
          disabled={!form.customerId || !form.templateId || loading} 
          className="px-8 py-2.5 rounded-lg bg-[#008f39] hover:bg-[#00702b] text-white font-bold text-sm shadow-md shadow-[#008f39]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('common.saving', 'Saving...') : (id ? t('measurement.update', 'Update Measurement') : t('measurement.save', 'Save Measurement'))}
        </button>
      </div>
    </div>
  );
}
