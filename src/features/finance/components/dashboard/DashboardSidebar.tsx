"use client";

import { SidebarContent } from './SidebarContent';

export function DashboardSidebar() {
  return (
    <aside className="hidden h-full w-64 shrink-0 border-r border-slate-800/80 bg-[#0B1528] lg:flex lg:flex-col">
      <SidebarContent />
    </aside>
  );
}
