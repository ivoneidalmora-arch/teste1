"use client";

import { DashboardSidebar } from './DashboardSidebar';
import { MobileNav } from './MobileNav';

interface Props {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-64 shrink-0">
        <DashboardSidebar />
      </div>

      {/* Navigation - Mobile */}
      <MobileNav />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 lg:h-screen lg:overflow-y-auto scroll-smooth">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
