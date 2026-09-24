import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

const variants: Record<Variant, string> = {
  default: 'bg-white/[0.04] border-white/[0.08] text-slate-300',
  success: 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400',
  warning: 'bg-amber-400/10 border-amber-400/30 text-amber-400',
  danger: 'bg-red-400/10 border-red-400/30 text-red-400',
  info: 'bg-sky-400/10 border-sky-400/30 text-sky-400',
  neutral: 'bg-slate-400/10 border-slate-400/30 text-slate-400',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md',
        'font-mono text-[10px] uppercase tracking-wider font-semibold',
        'border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}