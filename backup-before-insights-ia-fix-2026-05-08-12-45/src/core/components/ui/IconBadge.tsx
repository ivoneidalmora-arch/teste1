import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/core/utils/formatters';

type IconVariant = "blue" | "green" | "red" | "orange" | "purple" | "violet" | "teal" | "slate";

interface IconBadgeProps {
  icon: LucideIcon;
  variant?: IconVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
  gradient?: boolean;
}

const VARIANTS: Record<IconVariant, { bg: string; text: string; gradient: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', gradient: 'from-blue-500 to-blue-700' },
  green: { bg: 'bg-emerald-50', text: 'text-emerald-600', gradient: 'from-emerald-500 to-emerald-700' },
  red: { bg: 'bg-rose-50', text: 'text-rose-600', gradient: 'from-rose-500 to-rose-700' },
  orange: { bg: 'bg-amber-50', text: 'text-amber-600', gradient: 'from-amber-500 to-amber-700' },
  purple: { bg: 'bg-violet-50', text: 'text-violet-600', gradient: 'from-violet-500 to-violet-700' },
  violet: { bg: 'bg-purple-50', text: 'text-purple-600', gradient: 'from-purple-500 to-purple-700' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600', gradient: 'from-teal-500 to-teal-700' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-600', gradient: 'from-slate-500 to-slate-700' },
};

const SIZES = {
  sm: "h-7 w-7 rounded-lg",
  md: "h-10 w-10 rounded-xl",
  lg: "h-12 w-12 rounded-2xl",
};

const ICON_SIZES = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function IconBadge({ 
  icon: Icon, 
  variant = "blue", 
  size = "md", 
  className,
  gradient = false
}: IconBadgeProps) {
  const styles = VARIANTS[variant];
  
  return (
    <div className={cn(
      "flex items-center justify-center shrink-0 shadow-sm transition-all duration-300",
      SIZES[size],
      gradient ? `bg-gradient-to-br ${styles.gradient} text-white shadow-lg` : `${styles.bg} ${styles.text}`,
      className
    )}>
      <Icon className={ICON_SIZES[size]} />
    </div>
  );
}
