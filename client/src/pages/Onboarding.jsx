import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { updateProfile } from '../api/profile.js';
import useAuthStore from '../store/authStore.js';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Card, { CardHeader, CardContent } from '../components/Card.jsx';
import toast from 'react-hot-toast';

export default function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tenant, setTenant } = useAuthStore();
  const [form, setForm] = useState({
    shopName: tenant?.shopName || '',
    phone: tenant?.phone || '',
    whatsapp: tenant?.whatsapp || '',
    address: { line1: '', city: '', state: '', pincode: '' },
    gstNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await updateProfile(form);
      setTenant(data.tenant);
      toast.success('Profile updated!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <h1 className="text-headline-sm text-on-surface">{t('profile.shopName')}</h1>
          <p className="text-body-md text-on-surface-variant">Complete your shop profile to get started</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label={t('profile.shopName')} value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} required />
            <Input label={t('profile.phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label={t('profile.whatsapp')} value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            <Input label={t('profile.address') + ' (Line 1)'} value={form.address.line1} onChange={(e) => setForm({ ...form, address: { ...form.address, line1: e.target.value } })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" value={form.address.city} onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
              <Input label="State" value={form.address.state} onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} />
            </div>
            <Input label="Pincode" value={form.address.pincode} onChange={(e) => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })} />
            <Input label={t('profile.gst')} value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} />
            <Button type="submit" loading={loading} className="w-full">{t('common.save')}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
