import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createCustomer } from '../api/customers.js';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Card, { CardHeader, CardContent } from '../components/Card.jsx';
import toast from 'react-hot-toast';
import { User, Phone, MessageCircle, MapPin, StickyNote, UserPlus } from 'lucide-react';

export default function CustomerForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', whatsapp: '', address: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await createCustomer(form);
      toast.success('Customer created');
      navigate(`/customers/${data.customer._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-[#1e3a8a]">
           <UserPlus className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{t('customer.add')}</h1>
          <p className="text-slate-500 text-sm mt-0.5">Create a new customer profile</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <h2 className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider">{t('customer.add')}</h2>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input icon={User} label={t('customer.name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="E.g. John Doe" />
            <Input icon={Phone} label={t('customer.phone')} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit number" />
            <Input icon={MessageCircle} label={t('customer.whatsapp')} value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="WhatsApp number" />
            <Input icon={MapPin} label={t('customer.address')} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" />
            <Input icon={StickyNote} label={t('customer.notes')} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special instructions..." />
            
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button type="submit" loading={loading} className="flex-1">{t('common.save')}</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/customers')} className="flex-1">{t('common.cancel')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
