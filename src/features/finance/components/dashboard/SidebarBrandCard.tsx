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
    <div className={cn("px-4 pt-4 pb-2", className)}>
      <div 
        className={cn(
          "group relative flex flex-col items-center justify-center rounded-[2rem] bg-white transition-all duration-500",
          "shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80",
          "hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-0.5",
          collapsed ? "p-3" : "p-6"
        )}
      >
        {/* Detalhe visual de fundo: Profundidade e brilho sutil */}
        <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50/30 rounded-full blur-3xl transition-all duration-1000 group-hover:bg-blue-100/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-slate-50/50" />
        </div>

        {/* Logo Container - Tamanho Maximizado */}
        <div className={cn(
          "relative flex items-center justify-center w-full transition-all duration-500",
          collapsed ? "h-8" : "h-16"
        )}>
          <Image 
            src="/logo.png" 
            alt="Alfa Perícia e Vistoria Veicular" 
            width={collapsed ? 60 : 160} 
            height={collapsed ? 30 : 80} 
            className={cn(
              "h-auto w-auto object-contain transition-all duration-500",
              collapsed ? "max-h-8 max-w-[40px]" : "max-h-16 max-w-[140px] group-hover:scale-105"
            )}
            priority
          />
        </div>

        {/* Linha de Destaque com Gradiente Vibrante */}
        {!collapsed && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-2/3 h-[2px] overflow-hidden rounded-full">
            <div className="h-full w-full bg-gradient-to-r from-[#e11d48] via-[#2563eb] to-[#60a5fa] opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-x-110" />
          </div>
        )}
        
        {/* Refinamento de borda interna sutil */}
        <div className="absolute inset-0 rounded-[2rem] border border-white/40 pointer-events-none" />
      </div>
    </div>
  );
}
