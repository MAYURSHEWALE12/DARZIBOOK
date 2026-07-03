import React, { useState, useRef, useEffect } from 'react';


// Helper to format garment types like "apple_cut_shirt" -> "Apple Cut Shirt"
export const formatLabel = (str) => {
  if (!str) return '';
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function CustomSelect({ value, onChange, options = [], placeholder = "Select...", className, buttonClassName, searchable = true, emptyState }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const selectedOption = options.find(opt => 
    typeof opt === 'object' ? opt.value === value : opt === value
  );
  const displayLabel = selectedOption 
    ? (typeof selectedOption === 'object' ? selectedOption.label : formatLabel(selectedOption)) 
    : placeholder;

  const filteredOptions = options.filter(opt => {
    const label = typeof opt === 'object' ? opt.label : formatLabel(opt);
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const showOptions = !(searchable && options.length > 5 && searchTerm.trim() === '');

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 px-3.5 flex items-center justify-between rounded-lg text-[13px] border transition-all duration-200 outline-none font-semibold ${
          isOpen 
            ? 'border-[#1e3a8a] bg-blue-50/30 ring-4 ring-[#1e3a8a]/10' 
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
        } ${buttonClassName || ''}`}
      >
        <span className={!value ? "text-slate-400 font-medium truncate pr-2" : "text-slate-800 truncate pr-2"}>{displayLabel}</span>
        <span className={`material-symbols-outlined text-[18px] shrink-0 transition-transform duration-300 ${
          isOpen ? 'rotate-180 text-[#1e3a8a]' : 'text-slate-400'
        }`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-[100] top-full left-0 right-0 mt-2 max-h-[320px] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 origin-top">
          
          {searchable && options.length > 5 && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 shrink-0">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px]">search</span>
                <input 
                  ref={inputRef}
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..." 
                  className="w-full h-9 pl-9 pr-3 rounded-lg text-[13px] border border-slate-200 bg-white focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10 outline-none font-medium transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          <div className="overflow-y-auto custom-scrollbar flex flex-col gap-1 p-2">
            {!showOptions ? (
              <div className="py-6 text-center text-slate-400 text-[13px] font-medium flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-[24px] opacity-50">search</span>
                Type to search...
              </div>
            ) : filteredOptions.length === 0 ? (
              emptyState ? (
                emptyState
              ) : (
                <div className="py-6 text-center text-slate-400 text-[13px] font-medium flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-[24px] opacity-50">search_off</span>
                  No matches found
                </div>
              )
            ) : (
              filteredOptions.slice(0, 50).map((opt, i) => {
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
                      setSearchTerm('');
                    }}
                    className={`w-full text-left px-3 py-2.5 text-[14px] font-semibold transition-all rounded-lg flex items-center justify-between group ${
                      isSelected 
                        ? 'bg-blue-50/60 text-[#1e3a8a]' 
                        : 'bg-transparent text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate pr-4">{label}</span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[18px] text-[#1e3a8a] shrink-0">check</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
