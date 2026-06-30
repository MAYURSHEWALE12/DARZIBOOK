import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn.js';
import { ChevronDown, Check } from 'lucide-react';

export default function Select({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select...", 
  label, 
  error, 
  icon: Icon,
  className,
  ...props 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options?.find(opt => opt.value === value);

  return (
    <div className="space-y-1 w-full" ref={dropdownRef}>
      {label && <label className="block text-[14px] font-bold text-slate-700 mb-1.5">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative flex items-center w-full h-12 rounded-xl border transition-all bg-white shadow-sm outline-none",
            error ? "border-red-400 ring-2 ring-red-400/20" : "border-slate-200",
            isOpen && !error ? "border-[#1e3a8a] ring-2 ring-[#1e3a8a]/20" : "hover:border-slate-300",
            className
          )}
          {...props}
        >
          {Icon && (
            <div className="h-full px-4 flex items-center justify-center bg-[#1e3a8a]/5 border-r border-slate-100 rounded-l-xl">
              <Icon className="w-5 h-5 text-[#1e3a8a]" />
            </div>
          )}
          <span className={cn(
            "flex-1 text-left px-4 text-[15px] truncate",
            !selectedOption && !value ? "text-slate-400" : "text-slate-800 font-medium",
            Icon && "pl-0"
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="px-3 flex items-center text-slate-400">
            <ChevronDown className={cn("w-5 h-5 transition-transform duration-200", isOpen && "rotate-180")} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 py-2 max-h-60 overflow-auto">
            {options?.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange({ target: { value: opt.value } });
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 text-[15px] hover:bg-slate-50 transition-colors",
                  value === opt.value ? "bg-[#1e3a8a]/5 text-[#1e3a8a] font-bold" : "text-slate-700 font-medium"
                )}
              >
                {opt.label}
                {value === opt.value && <Check className="w-4 h-4 text-[#1e3a8a]" />}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium pt-1">{error}</p>}
    </div>
  );
}
