import React from 'react';
import { cn } from '../utils/cn.js';

const Input = React.forwardRef(({ className, label, error, icon: Icon, ...props }, ref) => (
  <div className="space-y-1 w-full">
    {label && <label className="block text-[14px] font-bold text-slate-700 mb-1.5">{label}</label>}
    <div className={cn(
      "relative flex items-center w-full h-12 rounded-xl border transition-all overflow-hidden bg-white",
      error ? "border-red-400 focus-within:ring-red-400" : "border-slate-200 focus-within:ring-[#1e3a8a]",
      "focus-within:ring-2 focus-within:border-transparent shadow-sm"
    )}>
      {Icon && (
        <div className="h-full px-4 flex items-center justify-center bg-[#1e3a8a]/5 border-r border-slate-100">
          <Icon className="w-5 h-5 text-[#1e3a8a]" />
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          "flex-1 min-w-0 h-full px-4 text-[15px] text-slate-800 focus:outline-none bg-transparent placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500 font-medium pt-1">{error}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
