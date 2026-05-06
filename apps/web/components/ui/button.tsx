'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type Variante = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
type Tamanho = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamanho?: Tamanho;
  carregando?: boolean;
}

const varianteClasses: Record<Variante, string> = {
  primary:
    'bg-[#0066FF] text-white hover:bg-[#0047B3] focus-visible:ring-[#0066FF]',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400',
  destructive:
    'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
  ghost: 'hover:bg-slate-100 text-slate-700 focus-visible:ring-slate-400',
  outline:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400',
};

const tamanhoClasses: Record<Tamanho, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
};

export function Button({
  variante = 'primary',
  tamanho = 'md',
  carregando = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled ?? carregando}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        varianteClasses[variante],
        tamanhoClasses[tamanho],
        className,
      )}
    >
      {carregando && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
