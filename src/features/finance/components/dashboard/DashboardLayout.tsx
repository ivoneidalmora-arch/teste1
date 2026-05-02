"use client";

import { DashboardSidebar } from './DashboardSidebar';

interface Props {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop Only for now */}
      <div className="hidden lg:block w-64 shrink-0">
        <DashboardSidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto scroll-smooth">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
