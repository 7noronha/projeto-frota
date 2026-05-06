import * as React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  erro?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, erro, children, ...props }, ref) => (
    <div className="w-full">
      <select
        ref={ref}
        {...props}
        className={cn(
          'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm',
          'text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50',
          erro && 'border-red-500 focus:ring-red-500',
          className,
        )}
      >
        {children}
      </select>
      {erro && <p className="mt-1 text-xs text-red-500">{erro}</p>}
    </div>
  ),
);

Select.displayName = 'Select';
