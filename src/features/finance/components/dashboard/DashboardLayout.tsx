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
        <DashboardSidebar />

        {/* Layout Mobile + Main Content */}
        <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
          {/* Navigation - Mobile */}
          <MobileNav />

          {/* Main Content Area */}
          <main className="min-w-0 flex-1 overflow-x-hidden">
            <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
