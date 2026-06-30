import React from 'react';
import { cn } from '../utils/cn.js';
import { useTranslation } from 'react-i18next';

export default function Pagination({ pagination, onPageChange }) {
  const { t } = useTranslation();
  if (!pagination || pagination.totalPages <= 1) return null;

  const { currentPage, totalPages, totalItems, limit } = pagination;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <div className="text-sm text-slate-500 font-medium">
        Showing <span className="text-slate-800 font-bold">{startIndex}</span> to <span className="text-slate-800 font-bold">{endIndex}</span> of <span className="text-slate-800 font-bold">{totalItems}</span> results
      </div>
      <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={cn(
            "flex items-center justify-center h-8 px-3 rounded-md text-sm font-semibold transition-colors",
            currentPage === 1 
              ? "text-slate-300 cursor-not-allowed" 
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
          )}
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          <span className="hidden sm:inline-block ml-1">Prev</span>
        </button>
        
        <div className="h-4 w-px bg-slate-200 mx-1"></div>

        <span className="px-4 text-sm font-bold text-[#1e3a8a]">
          Page {currentPage} of {totalPages}
        </span>

        <div className="h-4 w-px bg-slate-200 mx-1"></div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={cn(
            "flex items-center justify-center h-8 px-3 rounded-md text-sm font-semibold transition-colors",
            currentPage === totalPages 
              ? "text-slate-300 cursor-not-allowed" 
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
          )}
        >
          <span className="hidden sm:inline-block mr-1">Next</span>
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
