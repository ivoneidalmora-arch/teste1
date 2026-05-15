"use client";
// Build: 2026-05-08 17:05

import Image from 'next/image';
import { cn } from '@/core/utils/formatters';

interface SidebarBrandCardProps {
  collapsed?: boolean;
  className?: string;
}

export function SidebarBrandCard({ collapsed = false, className }: SidebarBrandCardProps) {
  return (
    <div className={cn("px-2 pt-1 pb-1", className)}>
      <div 
        className={cn(
          "group relative flex flex-col items-center justify-center rounded-xl bg-white transition-all duration-300",
          "shadow-sm border border-slate-100",
          collapsed ? "p-1.5" : "p-2"
        )}
      >
        {/* Logo Container - Ultra compacto */}
        <div className={cn(
          "relative flex items-center justify-center w-full",
          collapsed ? "h-5" : "h-8"
        )}>
          <Image 
            src="/logo.png" 
            alt="Alfa Perícia" 
            width={collapsed ? 32 : 80} 
            height={collapsed ? 16 : 40} 
            className={cn(
              "h-auto w-auto object-contain",
              collapsed ? "max-h-5 max-w-[28px]" : "max-h-8 max-w-[80px]"
            )}
            priority
          />
        </div>

        {/* Linha de Destaque sutil */}
        {!collapsed && (
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-blue-500/20" />
        )}
      </div>
    </div>
  );
}
