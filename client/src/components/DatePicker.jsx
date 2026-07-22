import React, { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { cn } from '../utils/cn';

const CustomInput = forwardRef(({ value, onClick, onChange, placeholder, className, disabled, label }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-[13px] font-bold text-[#001f3f] uppercase tracking-wider mb-2">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        ref={ref}
        value={value}
        onClick={onClick}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "w-full h-12 px-4 rounded-xl border border-[#001f3f]/10 bg-white text-[15px] font-semibold text-[#001f3f] placeholder:text-slate-400 outline-none transition-all duration-200 cursor-pointer shadow-sm hover:border-[#2596be]/40 focus:border-[#2596be] focus:ring-4 focus:ring-[#2596be]/10",
          disabled && "bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200",
          className
        )}
        readOnly
      />
      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        calendar_month
      </span>
    </div>
  </div>
));

export default function DatePicker({
  selected,
  onChange,
  label,
  placeholder = "Select date",
  className,
  disabled = false,
  minDate,
  maxDate,
  ...props
}) {
  return (
    <div className="custom-datepicker-wrapper w-full">
      <ReactDatePicker
        wrapperClassName="w-full"
        selected={selected ? new Date(selected) : null}
        onChange={(date) => onChange && onChange(date)}
        customInput={<CustomInput label={label} className={className} placeholder={placeholder} disabled={disabled} />}
        disabled={disabled}
        minDate={minDate ? new Date(minDate) : undefined}
        maxDate={maxDate ? new Date(maxDate) : undefined}
        dateFormat="dd-MM-yyyy"
        showPopperArrow={false}
        calendarClassName="!border-0 !shadow-2xl !rounded-2xl overflow-hidden !font-sans"
        dayClassName={date => "!rounded-lg !font-semibold hover:!bg-[#2596be]/10"}
        {...props}
      />
    </div>
  );
}
