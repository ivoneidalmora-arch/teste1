import React from 'react';
import { cn } from '@/core/utils/formatters';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-900/10 active:scale-[0.98]',
      secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.98]',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/10 active:scale-[0.98]',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900',
      outline: 'bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50'
    };

    const sizes = {
      sm: 'px-3 h-8 text-[11px]',
      md: 'px-6 h-12 text-sm',
      lg: 'px-8 h-14 text-base'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-bold uppercase tracking-widest rounded-2xl transition-all',
          'focus:outline-none focus:ring-2 focus:ring-slate-900/50 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
