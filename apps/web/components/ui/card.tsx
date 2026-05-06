import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn('flex flex-col gap-1 p-6', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 {...props} className={cn('text-lg font-semibold text-slate-900', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  );
}
