import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateProfile, uploadLogo } from '../api/profile.js';
import useAuthStore from '../store/authStore.js';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Button from '../components/Button.jsx';
import Card, { CardHeader, CardContent } from '../components/Card.jsx';
import toast from 'react-hot-toast';
import i18n from '../i18n/i18n.js';
import { Store, User, Phone, MessageCircle, MapPin, Hash, Globe, Building, Navigation } from 'lucide-react';

export default function Profile() {
  const { t } = useTranslation();
  const { tenant, setTenant } = useAuthStore();
  const [form, setForm] = useState({
    shopName: tenant?.shopName || '',
    ownerName: tenant?.ownerName || '',
    phone: tenant?.phone || '',
    whatsapp: tenant?.whatsapp || '',
    address: {
      line1: tenant?.address?.line1 || '',
      line2: tenant?.address?.line2 || '',
      city: tenant?.address?.city || '',
      state: tenant?.address?.state || '',
      pincode: tenant?.address?.pincode || ''
    },
    gstNumber: tenant?.gstNumber || '',
    language: tenant?.language || 'en',
  });
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await updateProfile(form);
      setTenant(data.tenant);
      i18n.changeLanguage(form.language);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('logo', file);
    setLogoUploading(true);
    try {
      const { data } = await uploadLogo(formData);
      setTenant({ ...tenant, logo: data.logo });
      toast.success('Logo uploaded successfully');
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setLogoUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <div className="p-2.5 bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-xl shadow-sm border border-[#1e3a8a]/10">
            <Store className="w-6 h-6" />
          </div>
          {t('nav.profile')}
        </h1>
        <p className="text-slate-500 mt-1 text-[15px]">Manage your business profile, address, and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">imagesmode</span>
            {t('profile.logo')}
          </h2>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-[13px] font-medium text-slate-500 mb-6">This logo will appear on your dashboard and customer invoices.</p>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative group">
              {tenant?.logo?.url ? (
                <img src={tenant.logo.url} alt="Logo" className="w-32 h-32 object-cover rounded-xl shadow-sm border border-slate-200 group-hover:opacity-75 transition-opacity" />
              ) : (
                <div className="w-32 h-32 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 group-hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined text-[32px] mb-2">add_photo_alternate</span>
                  <span className="text-[11px] font-medium uppercase tracking-wider">No Logo</span>
                </div>
              )}
              {logoUploading && (
                <div className="absolute inset-0 bg-white/60 rounded-xl flex items-center justify-center backdrop-blur-[2px]">
                   <span className="animate-spin w-6 h-6 border-2 border-slate-200 border-t-[#1e3a8a] rounded-full"></span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-slate-200 text-[#1e3a8a] px-4 py-2.5 rounded-lg shadow-sm hover:bg-slate-50 transition-all text-[13px] font-bold">
                <span className="material-symbols-outlined text-[18px]">upload</span>
                Upload New Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={logoUploading} />
              </label>
              <p className="text-[12px] text-slate-400 font-medium">Recommended size: 512x512px. Max file size: 5MB.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <Card>
          <CardHeader>
             <h2 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">info</span>
              Business Information
            </h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input icon={Store} label={t('profile.shopName')} value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} required />
              <Input icon={User} label={t('profile.ownerName')} value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input icon={Phone} label={t('profile.phone')} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input icon={MessageCircle} label={t('profile.whatsapp')} type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              Address Details
            </h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <Input icon={MapPin} label={t('profile.address') + ' - Line 1'} value={form.address.line1} onChange={(e) => setForm({ ...form, address: { ...form.address, line1: e.target.value } })} />
              <Input icon={MapPin} label={t('profile.address') + ' - Line 2 (Optional)'} value={form.address.line2} onChange={(e) => setForm({ ...form, address: { ...form.address, line2: e.target.value } })} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input icon={Building} label="City" value={form.address.city} onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
                <Input icon={Navigation} label="State" value={form.address.state} onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} />
                <Input icon={Hash} label="Pincode" value={form.address.pincode} onChange={(e) => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">settings</span>
              Settings
            </h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <Input icon={Hash} label={t('profile.gst')} value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} />
              <Select label={t('profile.language')} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} options={[
                { value: 'en', label: 'English' }, { value: 'hi', label: 'हिन्दी' }, { value: 'mr', label: 'मराठी' },
              ]} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={loading} className="px-10 bg-[#1e3a8a] text-white hover:bg-[#152a66] font-bold">
            {t('common.save')} Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
