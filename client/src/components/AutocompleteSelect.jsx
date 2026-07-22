import React, { useState, useRef, useEffect } from 'react';
import { formatLabel } from './CustomSelect.jsx';

export default function AutocompleteSelect({ value, onChange, options = [], placeholder = "Search...", className, emptyState }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync searchTerm with selected value when closed
  useEffect(() => {
    if (!isOpen) {
      const selectedOption = options.find(opt => 
        typeof opt === 'object' ? opt.value === value : opt === value
      );
      if (selectedOption) {
        setSearchTerm(typeof selectedOption === 'object' ? selectedOption.label : formatLabel(selectedOption));
      } else {
        setSearchTerm('');
      }
    }
  }, [value, options, isOpen]);

  const filteredOptions = options.filter(opt => {
    const label = typeof opt === 'object' ? opt.label : formatLabel(opt);
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <div
        className={`w-full h-12 px-4 flex items-center justify-between rounded-xl text-[14px] border transition-all duration-200 outline-none font-semibold ${
          isOpen 
            ? 'border-[#2596be] bg-[#2596be]/5 ring-4 ring-[#2596be]/10' 
            : 'border-slate-200 bg-white hover:border-[#2596be]/40'
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            // clear selection if typing changes
            if (value && e.target.value !== searchTerm) {
              onChange('');
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full h-full bg-transparent outline-none text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-medium"
        />
        <span className={`material-symbols-outlined text-[18px] shrink-0 transition-transform duration-300 ${
          isOpen ? 'rotate-180 text-[#1e3a8a]' : 'text-slate-400'
        }`}>
          search
        </span>
      </div>

      {isOpen && searchTerm.trim() !== '' && (
        <div className="absolute z-[100] top-full left-0 right-0 mt-2 max-h-[320px] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 origin-top">
          <div className="overflow-y-auto custom-scrollbar flex flex-col gap-1 p-2">
            {filteredOptions.length === 0 ? (
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
                      setSearchTerm(label);
                      setIsOpen(false);
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
