import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { register } from '../api/auth.js';
import useAuthStore from '../store/authStore.js';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import { Phone, Lock, Eye, EyeOff, Store, User, Mail } from 'lucide-react';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setTenant } = useAuthStore();
  const [form, setForm] = useState({ shopName: '', ownerName: '', phone: '', password: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await register(form);
      setTenant(data.tenant);
      toast.success('Account created!');
      navigate('/onboarding');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#f4f7f6] font-sans relative px-4 sm:px-6 py-10">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#1e3a8a]/5 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#1e3a8a]/5 blur-[100px] pointer-events-none"></div>
      
      {/* Absolute Language Switcher */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-50">
        <LanguageSwitcher />
      </div>

      {/* Main Register Card */}
      <div className="w-full max-w-md bg-white rounded-[24px] sm:rounded-[36px] shadow-2xl p-6 sm:p-8 relative z-10 border border-white/50 mt-8 sm:mt-0">
        
        {/* Logo */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-50">
            <img src={logo} alt="DargiBook Logo" className="h-10 w-10 sm:h-14 sm:w-14 object-contain" />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-5 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight mb-1 sm:mb-2">
            Create an <span className="text-[#1e3a8a]">Account</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-[15px]">
            Please fill in your details to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Inputs Section */}
          <div className="space-y-4">
            
            {/* Shop Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('auth.shopName')}</label>
              <div className="relative flex items-center w-full h-12 sm:h-14 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-[#1e3a8a] focus-within:border-transparent transition-all overflow-hidden bg-white">
                <div className="h-full px-3 sm:px-4 flex items-center justify-center bg-[#1e3a8a]/5 border-r border-slate-100">
                  <Store className="w-4 h-4 sm:w-5 sm:h-5 text-[#1e3a8a]" />
                </div>
                <input 
                  type="text" 
                  value={form.shopName} 
                  onChange={(e) => setForm({ ...form, shopName: e.target.value })} 
                  required 
                  className="w-full h-full px-3 sm:px-4 text-sm sm:text-base text-slate-800 focus:outline-none bg-transparent placeholder:text-slate-400"
                  placeholder="Enter shop name"
                />
              </div>
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('auth.ownerName')}</label>
              <div className="relative flex items-center w-full h-12 sm:h-14 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-[#1e3a8a] focus-within:border-transparent transition-all overflow-hidden bg-white">
                <div className="h-full px-3 sm:px-4 flex items-center justify-center bg-[#1e3a8a]/5 border-r border-slate-100">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#1e3a8a]" />
                </div>
                <input 
                  type="text" 
                  value={form.ownerName} 
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })} 
                  required 
                  className="w-full h-full px-3 sm:px-4 text-sm sm:text-base text-slate-800 focus:outline-none bg-transparent placeholder:text-slate-400"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('customer.phone')}</label>
              <div className="relative flex items-center w-full h-12 sm:h-14 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-[#1e3a8a] focus-within:border-transparent transition-all overflow-hidden bg-white">
                <div className="h-full px-3 sm:px-4 flex items-center justify-center bg-[#1e3a8a]/5 border-r border-slate-100">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#1e3a8a]" />
                </div>
                <input 
                  type="tel" 
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                  required 
                  className="w-full h-full px-3 sm:px-4 text-sm sm:text-base text-slate-800 focus:outline-none bg-transparent placeholder:text-slate-400"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('auth.email')} (Optional)</label>
              <div className="relative flex items-center w-full h-12 sm:h-14 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-[#1e3a8a] focus-within:border-transparent transition-all overflow-hidden bg-white">
                <div className="h-full px-3 sm:px-4 flex items-center justify-center bg-[#1e3a8a]/5 border-r border-slate-100">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#1e3a8a]" />
                </div>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  className="w-full h-full px-3 sm:px-4 text-sm sm:text-base text-slate-800 focus:outline-none bg-transparent placeholder:text-slate-400"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('auth.password')}</label>
              <div className="relative flex items-center w-full h-12 sm:h-14 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-[#1e3a8a] focus-within:border-transparent transition-all overflow-hidden bg-white">
                <div className="h-full px-3 sm:px-4 flex items-center justify-center bg-[#1e3a8a]/5 border-r border-slate-100">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#1e3a8a]" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={form.password} 
                  onChange={(e) => setForm({ ...form, password: e.target.value })} 
                  required 
                  className="w-full h-full px-3 sm:px-4 text-sm sm:text-base text-slate-800 focus:outline-none bg-transparent placeholder:text-slate-400"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-full px-3 sm:px-4 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            {/* Register Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 sm:h-14 flex items-center justify-center text-[14px] sm:text-[16px] rounded-xl bg-[#1e3a8a] text-white shadow-lg shadow-[#1e3a8a]/25 hover:shadow-[#1e3a8a]/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 transition-all duration-300 font-bold tracking-wide"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              {t('auth.register')}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative flex py-4 sm:py-5 items-center mt-2">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink-0 mx-3 sm:mx-4 text-slate-400 text-xs sm:text-sm">or</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        {/* Login Link */}
        <p className="text-center text-xs sm:text-[15px] text-slate-500">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="font-bold text-[#1e3a8a] hover:text-[#152a66] transition-all">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
