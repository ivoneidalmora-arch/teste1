"use client";

import { SidebarContent } from './SidebarContent';

export function DashboardSidebar() {
  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <SidebarContent />
    </aside>
  );
}
