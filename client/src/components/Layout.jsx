import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/authStore.js';
import { logout as logoutApi } from '../api/auth.js';
import { getNotifications, markAsRead, markAllAsRead } from '../api/notifications.js';
import { cn } from '../utils/cn.js';
import logo from '../assets/logo.png';
import LanguageSwitcher from './LanguageSwitcher.jsx';

const navItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'nav.dashboard' },
  { path: '/customers', icon: 'groups', label: 'nav.customers' },
  { path: '/measurements/new', icon: 'straighten', label: 'nav.measurements' },
  { path: '/orders', icon: 'format_list_bulleted', label: 'nav.orders' },
  { path: '/reports', icon: 'analytics', label: 'nav.reports' },
  { path: '/expenses', icon: 'receipt_long', label: 'nav.expenses' },
  { path: '/staff', icon: 'badge', label: 'nav.staff' },
  { path: '/profile', icon: 'person', label: 'nav.profile' },
  { path: '/subscription', icon: 'workspace_premium', label: 'nav.subscription' },
];

const bottomNav = [
  { path: '/dashboard', icon: 'home', label: 'nav.dashboard' },
  { path: '/customers', icon: 'group', label: 'nav.customers' },
  { path: '/orders', icon: 'format_list_bulleted', label: 'nav.orders' },
  { path: '/reports', icon: 'analytics', label: 'nav.reports' },
  { path: '/profile', icon: 'person', label: 'nav.profile' },
];

export default function Layout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { tenant, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [location.pathname]); // re-fetch when navigating

  const fetchNotifications = async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
      fetchNotifications();
    }
    setShowDropdown(false);
    navigate(`/orders/${notif.orderId?._id || notif.orderId}`);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    fetchNotifications();
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-[100dvh] w-full bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] animate-in fade-in duration-200" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-72 bg-[#0f172a] text-white flex-col shadow-2xl z-[70] transition-transform duration-300",
        isMobileMenuOpen ? "fixed inset-y-0 left-0 flex animate-in slide-in-from-left" : "hidden md:flex relative"
      )}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="p-8 pb-4 flex items-center justify-center relative">
          {isMobileMenuOpen && (
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
          <div className="bg-white rounded-xl p-3 w-full flex justify-center shadow-lg border border-white/20 mt-4 md:mt-0">
            <img src={logo} alt="DargiBook Logo" className="h-16 object-contain" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-safe pb-32 md:pb-8">
          <nav className="px-4 py-2 space-y-1 mt-2">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 md:py-3 md:gap-4 rounded-xl transition-all duration-300 relative group overflow-hidden',
                    isActive 
                      ? 'bg-[#1e3a8a] text-white shadow-lg border border-[#2563eb]/20' 
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-full" />}
                  <span className={cn("material-symbols-outlined transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                  <span className="text-[15px] font-medium tracking-wide">{t(item.label)}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 p-4 mx-4 bg-[#1e293b] rounded-xl border border-white/10 backdrop-blur-sm shadow-inner shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ffb869] to-[#fdad4e] flex items-center justify-center text-[#2b1700] font-bold text-lg shadow-md border border-white/20 overflow-hidden shrink-0">
                {tenant?.logo && !logoError ? (
                  <img 
                    src={tenant.logo} 
                    alt={tenant.shopName} 
                    className="w-full h-full object-cover" 
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  tenant?.shopName?.charAt(0) || 'S'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-white truncate">{tenant?.shopName || 'My Shop'}</p>
                <p className="text-[12px] text-white/60 truncate">{tenant?.phone || 'No phone provided'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white/80 bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 border border-transparent hover:border-rose-500/30 transition-all text-[13px] font-bold uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span> 
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto bg-slate-50 relative">
        <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden md:block">{t('nav.overview', 'Overview')}</h1>
            <div className="md:hidden flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <img src={logo} alt="DargiBook Logo" className="h-8 object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <LanguageSwitcher />
            
            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className={cn(
                  "relative p-2.5 rounded-lg transition-colors border hidden sm:block",
                  showDropdown ? "bg-slate-100 border-slate-200 text-slate-700" : "text-slate-500 hover:bg-slate-100 hover:border-slate-200 border-transparent"
                )}
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800">{t('nav.notifications', 'Notifications')}</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider hover:underline">
                        {t('nav.markAllRead', 'Mark all read')}
                      </button>
                    )}
                  </div>
                  <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-sm">{t('nav.noNotifications', 'No notifications.')}</div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {notifications.map(notif => (
                          <div 
                            key={notif._id} 
                            onClick={() => handleNotificationClick(notif)}
                            className={cn(
                              "p-4 cursor-pointer hover:bg-slate-50 transition-colors flex gap-3",
                              notif.isRead ? "opacity-75" : "bg-blue-50/30"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                              notif.type === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              notif.type === 'delayed' ? "bg-rose-50 text-rose-600 border-rose-100" :
                              "bg-amber-50 text-amber-600 border-amber-100"
                            )}>
                              <span className="material-symbols-outlined text-[20px]">
                                {notif.type === 'completed' ? 'check_circle' : 
                                 notif.type === 'delayed' ? 'schedule' : 'inventory_2'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className={cn("text-sm", notif.isRead ? "text-slate-600" : "text-slate-800 font-medium")}>
                                {notif.message}
                              </p>
                              <span className="text-[11px] text-slate-400 font-medium mt-1 block">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {!notif.isRead && <div className="w-2 h-2 bg-[#1e3a8a] rounded-full mt-1.5 shrink-0" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </header>

        <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full pb-40 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
        {bottomNav.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center transition-all duration-300 relative',
                isActive ? 'text-[#1e3a8a] -translate-y-1' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-colors",
                isActive ? "bg-blue-50" : ""
              )}>
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
              </div>
              <span className="text-[10px] font-medium mt-1">{t(item.label)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
