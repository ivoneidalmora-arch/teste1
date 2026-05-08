"use client";

import Image from 'next/image';
import { cn } from '@/core/utils/formatters';

interface SidebarBrandCardProps {
  collapsed?: boolean;
  className?: string;
}

export function SidebarBrandCard({ collapsed = false, className }: SidebarBrandCardProps) {
  return (
    <div className={cn("px-4 pt-8 pb-4", className)}>
      <div 
        className={cn(
          "group relative flex flex-col items-center justify-center rounded-2xl bg-white transition-all duration-500",
          "shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-100/80",
          "hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:border-blue-100/50",
          collapsed ? "p-3" : "p-6"
        )}
      >
        {/* Detalhe visual de fundo: Gradiente sutil e forma abstrata */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50/30 rounded-full blur-2xl transition-all duration-700 group-hover:bg-blue-100/40" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-slate-50/50" />
        </div>

        {/* Logo Container */}
        <div className={cn(
          "relative flex items-center justify-center w-full transition-all duration-500",
          collapsed ? "h-8" : "h-14"
        )}>
          <Image 
            src="/logo.png" 
            alt="Alfa Perícia e Vistoria Veicular" 
            width={collapsed ? 80 : 160} 
            height={collapsed ? 32 : 60} 
            className={cn(
              "h-auto w-auto object-contain transition-all duration-700",
              collapsed ? "max-h-8 max-w-[40px]" : "max-h-14 max-w-[140px] group-hover:scale-110"
            )}
            priority
          />
        </div>

        {/* Linha de Destaque na base (Opção 1) */}
        {!collapsed && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full opacity-40 group-hover:w-20 group-hover:opacity-100 transition-all duration-700" />
        )}
        
        {/* Detalhe de acabamento lateral (sutil) */}
        <div className="absolute right-0 top-1/4 bottom-1/4 w-[1px] bg-gradient-to-b from-transparent via-slate-100 to-transparent" />
      </div>
    </div>
  );
}
