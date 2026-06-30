import React from 'react';
import { cn } from '../utils/cn.js';

const statusColors = {
  received: 'bg-primary-fixed/30 text-primary',
  in_progress: 'bg-secondary-fixed text-on-secondary-fixed',
  ready: 'bg-primary/10 text-primary',
  delivered: 'bg-surface-container-highest text-on-surface-variant',
  trial: 'bg-primary-fixed/30 text-primary',
  active: 'bg-primary/10 text-primary',
  expired: 'bg-error/10 text-error',
  cancelled: 'bg-surface-container-highest text-on-surface-variant',
};

export default function Badge({ children, variant, className }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-xs px-sm py-xs rounded-full text-[10px] font-bold uppercase',
      statusColors[variant] || 'bg-surface-container-highest text-on-surface-variant',
      className
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', variant === 'active' || variant === 'trial' || variant === 'received' || variant === 'ready' ? 'bg-primary' : variant === 'expired' ? 'bg-error' : 'bg-on-surface-variant')} />
      {children}
    </span>
  );
}
