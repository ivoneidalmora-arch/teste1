import React from 'react';
import { cn } from '@/core/utils/formatters';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).substr(2, 9);
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:border-slate-900",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-slate-400",
            error && "border-rose-500 focus-visible:ring-rose-500 focus-visible:border-rose-500",
            className
          )}
          {...props}
        />
        {error && <span className="text-[11px] font-bold text-rose-500 pl-1 mt-0.5">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
