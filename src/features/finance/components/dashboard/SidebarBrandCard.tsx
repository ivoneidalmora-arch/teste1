"use client";

import Image from 'next/image';
import { cn } from '@/core/utils/formatters';

interface SidebarBrandCardProps {
  collapsed?: boolean;
  className?: string;
}

export function SidebarBrandCard({ collapsed = false, className }: SidebarBrandCardProps) {
  return (
    <div className={cn("px-5 pt-8 pb-8", className)}>
      <div 
        className={cn(
          "group relative flex flex-col items-center justify-center rounded-[2.5rem] bg-white transition-all duration-700",
          "shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-50",
          "hover:shadow-[0_30px_70px_rgba(0,0,0,0.15)] hover:-translate-y-1",
          collapsed ? "p-4" : "p-10"
        )}
      >
        {/* Detalhe visual de fundo: Profundidade e brilho sutil */}
        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-50/20 rounded-full blur-3xl transition-all duration-1000 group-hover:bg-blue-100/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-slate-50/30" />
        </div>

        {/* Logo Container - Tamanho Maximizado conforme a imagem */}
        <div className={cn(
          "relative flex items-center justify-center w-full transition-all duration-500",
          collapsed ? "h-10" : "h-24"
        )}>
          <Image 
            src="/logo.png" 
            alt="Alfa Perícia e Vistoria Veicular" 
            width={collapsed ? 80 : 180} 
            height={collapsed ? 40 : 90} 
            className={cn(
              "h-auto w-auto object-contain transition-all duration-700",
              collapsed ? "max-h-10 max-w-[45px]" : "max-h-24 max-w-[170px] group-hover:scale-105"
            )}
            priority
          />
        </div>

        {/* Linha de Destaque com Gradiente Vibrante (Exatamente como na imagem) */}
        {!collapsed && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-[3px] overflow-hidden rounded-full">
            <div className="h-full w-full bg-gradient-to-r from-[#e11d48] via-[#2563eb] to-[#60a5fa] opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-x-110" />
          </div>
        )}
        
        {/* Refinamento de borda interna sutil */}
        <div className="absolute inset-0 rounded-[2.5rem] border border-white/50 pointer-events-none" />
      </div>
    </div>
  );
}
