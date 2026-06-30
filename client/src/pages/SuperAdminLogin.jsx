import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/admin/login', form, { withCredentials: true });
      toast.success('Welcome Admin');
      navigate('/superadmin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden font-sans selection:bg-[#1e3a8a]/20 selection:text-[#1e3a8a]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#1e3a8a]/5 to-[#1e3a8a]/10 blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-[#1e3a8a]/10 to-[#1e3a8a]/5 blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>

      <div className="w-full max-w-md p-6 relative z-10">
        <div className="text-center mb-10 transform transition-all duration-700 translate-y-0 opacity-100">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#152a66] text-white shadow-xl shadow-[#1e3a8a]/20 mb-6 rotate-3 hover:rotate-6 transition-transform duration-300">
            <ShieldAlert className="w-10 h-10" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">System Admin</h1>
          <p className="text-slate-500 mt-3 text-lg">Secure access to the control panel</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white transform transition-all duration-700 delay-100 translate-y-0 opacity-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[14px] font-bold text-slate-700 ml-1">Admin Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1e3a8a] transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all text-slate-700 placeholder:text-slate-400 font-medium"
                  placeholder="admin@darzibook.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-[14px] font-bold text-slate-700">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1e3a8a] transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] transition-all text-slate-700 placeholder:text-slate-400 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#1e3a8a] to-[#152a66] hover:from-[#152a66] hover:to-[#17856a] text-white rounded-xl font-bold shadow-lg shadow-[#1e3a8a]/30 hover:shadow-xl hover:shadow-[#1e3a8a]/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span>
              ) : (
                'Authenticate'
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-slate-500 font-medium text-sm">
          Return to <Link to="/login" className="text-[#1e3a8a] hover:text-[#152a66] transition-colors font-bold hover:underline">Tenant Login</Link>
        </p>
      </div>
    </div>
  );
}
