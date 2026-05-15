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
    <div className={cn("px-3 pt-2 pb-1", className)}>
      <div 
        className={cn(
          "group relative flex flex-col items-center justify-center rounded-2xl bg-white transition-all duration-500",
          "shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100/80",
          "hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5",
          collapsed ? "p-2" : "p-3"
        )}
      >
        {/* Detalhe visual de fundo */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50/20 rounded-full blur-2xl transition-all duration-1000 group-hover:bg-blue-100/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-slate-50/30" />
        </div>

        {/* Logo Container - Mais compacto */}
        <div className={cn(
          "relative flex items-center justify-center w-full transition-all duration-500",
          collapsed ? "h-6" : "h-10"
        )}>
          <Image 
            src="/logo.png" 
            alt="Alfa Perícia" 
            width={collapsed ? 40 : 100} 
            height={collapsed ? 20 : 50} 
            className={cn(
              "h-auto w-auto object-contain transition-all duration-500",
              collapsed ? "max-h-6 max-w-[32px]" : "max-h-10 max-w-[90px] group-hover:scale-105"
            )}
            priority
          />
        </div>

        {/* Linha de Destaque mais discreta */}
        {!collapsed && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1/2 h-[1.5px] overflow-hidden rounded-full">
            <div className="h-full w-full bg-gradient-to-r from-[#e11d48] via-[#2563eb] to-[#60a5fa] opacity-40 group-hover:opacity-100 transition-all duration-700 group-hover:scale-x-110" />
          </div>
        )}
        
        <div className="absolute inset-0 rounded-2xl border border-white/40 pointer-events-none" />
      </div>
    </div>
  );
}
