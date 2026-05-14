"use client";

import { LucideIcon } from 'lucide-react';
import { cn } from '@/core/utils/formatters';

interface Icon3DProps {
  icon: LucideIcon;
  variant?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'cyan' | 'indigo' | 'slate' | 'ai';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  glow?: boolean;
}

const variants = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
    shadow: 'shadow-[0_4px_12px_rgba(37,99,235,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.3)]',
    icon: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    shadow: 'shadow-[0_4px_12px_rgba(16,185,129,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.3)]',
    icon: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
  },
  red: {
    bg: 'bg-gradient-to-br from-rose-400 to-rose-600',
    shadow: 'shadow-[0_4px_12px_rgba(225,29,72,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.3)]',
    icon: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-400 to-orange-600',
    shadow: 'shadow-[0_4px_12px_rgba(249,115,22,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.3)]',
    icon: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
    shadow: 'shadow-[0_4px_12px_rgba(147,51,234,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.3)]',
    icon: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
  },
  cyan: {
    bg: 'bg-gradient-to-br from-cyan-400 to-cyan-600',
    shadow: 'shadow-[0_4px_12px_rgba(8,145,178,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.3)]',
    icon: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
  },
  indigo: {
    bg: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
    shadow: 'shadow-[0_4px_12px_rgba(79,70,229,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4_rgba(255,255,255,0.3)]',
    icon: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
  },
  slate: {
    bg: 'bg-gradient-to-br from-slate-400 to-slate-600',
    shadow: 'shadow-[0_4px_12px_rgba(71,85,105,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.3)]',
    icon: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
  },
  ai: {
    bg: 'bg-gradient-to-br from-orange-400 via-purple-500 to-blue-600',
    shadow: 'shadow-[0_4px_15px_rgba(147,51,234,0.5),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.4)]',
    icon: 'text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]'
  }
};

const sizes = {
  xs: 'w-6 h-6 p-1 rounded-lg',
  sm: 'w-8 h-8 p-1.5 rounded-xl',
  md: 'w-10 h-10 p-2 rounded-2xl',
  lg: 'w-14 h-14 p-3 rounded-[1.25rem]',
  xl: 'w-20 h-20 p-4 rounded-[1.5rem]',
  '2xl': 'w-24 h-24 p-5 rounded-[2rem]'
};

export function Icon3D({ 
  icon: Icon, 
  variant = 'blue', 
  size = 'md', 
  className,
  glow = true
}: Icon3DProps) {
  const currentVariant = variants[variant] || variants.blue;
  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={cn(
      "relative flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95",
      currentSize,
      currentVariant.bg,
      currentVariant.shadow,
      className
    )}>
      {/* Shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/40 rounded-[inherit] pointer-events-none" />
      
      {/* Icon */}
      <Icon className={cn(
        "w-full h-full relative z-10",
        currentVariant.icon
      )} />
      
      {/* Optional Glow Effect */}
      {glow && (
        <div className={cn(
          "absolute -inset-1 blur-lg opacity-20 -z-10 rounded-full",
          currentVariant.bg
        )} />
      )}
    </div>
  );
}
