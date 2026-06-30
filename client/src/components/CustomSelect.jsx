import React, { useState, useRef, useEffect } from 'react';


// Helper to format garment types like "apple_cut_shirt" -> "Apple Cut Shirt"
export const formatLabel = (str) => {
  if (!str) return '';
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function CustomSelect({ value, onChange, options = [], placeholder = "Select...", className }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => 
    typeof opt === 'object' ? opt.value === value : opt === value
  );
  const displayLabel = selectedOption 
    ? (typeof selectedOption === 'object' ? selectedOption.label : formatLabel(selectedOption)) 
    : placeholder;

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 px-3.5 flex items-center justify-between rounded-lg text-[13px] border transition-all duration-200 outline-none font-semibold ${
          isOpen 
            ? 'border-[#1e3a8a] bg-blue-50/30 ring-4 ring-[#1e3a8a]/10' 
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
        }`}
      >
        <span className={!value ? "text-slate-400 font-medium" : "text-slate-800"}>{displayLabel}</span>
        <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${
          isOpen ? 'rotate-180 text-[#1e3a8a]' : 'text-slate-400'
        }`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-[100] top-full left-0 right-0 mt-2 max-h-[280px] overflow-y-auto custom-scrollbar flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200 origin-top pb-2">
          {options.map((opt, i) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const label = typeof opt === 'object' ? opt.label : formatLabel(opt);
            const isSelected = val === value;

            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onChange(val);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3.5 text-[14px] font-bold transition-all rounded-xl border flex items-center justify-between group shadow-sm hover:shadow-md ${
                  isSelected 
                    ? 'bg-[#1e3a8a]/5 border-[#1e3a8a]/30 text-[#1e3a8a]' 
                    : 'bg-white border-slate-200 text-slate-700 hover:border-[#1e3a8a]/30 hover:text-[#1e3a8a]'
                }`}
              >
                <span>{label}</span>
                {isSelected && (
                  <span className="material-symbols-outlined text-[18px] text-[#1e3a8a]">check</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
