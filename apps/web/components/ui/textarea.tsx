import * as React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  erro?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, erro, ...props }, ref) => (
    <div className="w-full">
      <textarea
        ref={ref}
        {...props}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm',
          'text-slate-900 placeholder:text-slate-400 resize-none',
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

Textarea.displayName = 'Textarea';
