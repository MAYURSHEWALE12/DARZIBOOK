import React from 'react';
import { cn } from '../utils/cn.js';

export default function Button({ children, variant = 'primary', size = 'md', className, disabled, loading, ...props }) {
  const variants = {
    primary: 'bg-[#1e3a8a] text-white hover:bg-[#152a66] shadow-lg shadow-[#1e3a8a]/25 hover:shadow-[#1e3a8a]/40 hover:-translate-y-0.5',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 shadow-sm hover:-translate-y-0.5',
    destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/20 hover:shadow-rose-600/30 hover:-translate-y-0.5',
    outline: 'border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm hover:-translate-y-0.5 font-bold',
    ghost: 'hover:bg-slate-100 text-slate-600 font-bold',
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-12 px-6 text-[15px]',
    lg: 'h-14 px-8 text-base',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a] disabled:opacity-60 disabled:pointer-events-none active:scale-95 active:translate-y-0',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 opacity-80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
