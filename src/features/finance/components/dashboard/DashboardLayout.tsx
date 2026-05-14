"use client";

import { DashboardSidebar } from './DashboardSidebar';
import { MobileNav } from './MobileNav';

interface Props {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: Props) {
  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC]">
      <div className="flex h-full w-full">
        {/* Sidebar - Desktop */}
        <DashboardSidebar />

        {/* Layout Mobile + Main Content */}
        <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
          {/* Navigation - Mobile */}
          <MobileNav />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-2.5 lg:px-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
