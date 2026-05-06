"use client";

import { DashboardSidebar } from './DashboardSidebar';
import { MobileNav } from './MobileNav';

interface Props {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: Props) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50">
      <div className="flex min-h-screen w-full overflow-x-hidden">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:w-64 lg:shrink-0">
          <DashboardSidebar />
        </aside>

        {/* Navigation - Mobile */}
        <MobileNav />

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 overflow-x-hidden">
          <div className="w-full max-w-full px-4 py-6 sm:px-6 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
