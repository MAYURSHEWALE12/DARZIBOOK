import React from 'react';
import { cn } from '../utils/cn.js';

export default function Card({ children, className, ...props }) {
  return (
    <div className={cn('bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={cn('px-4 py-3 border-b border-slate-200 bg-slate-50/50', className)}>{children}</div>;
}

export function CardContent({ children, className }) {
  return <div className={cn('p-6', className)}>{children}</div>;
}
