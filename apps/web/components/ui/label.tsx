import * as React from 'react';
import { cn } from '@/lib/utils';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  obrigatorio?: boolean;
}

export function Label({ className, obrigatorio, children, ...props }: LabelProps) {
  return (
    <label
      {...props}
      className={cn('block text-sm font-medium text-slate-700 mb-1', className)}
    >
      {children}
      {obrigatorio && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}
