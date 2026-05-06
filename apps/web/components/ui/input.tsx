import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  erro?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, erro, ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        {...props}
        className={cn(
          'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm',
          'text-slate-900 placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50',
          erro && 'border-red-500 focus:ring-red-500',
          className,
        )}
      />
      {erro && <p className="mt-1 text-xs text-red-500">{erro}</p>}
    </div>
  ),
);

Input.displayName = 'Input';
