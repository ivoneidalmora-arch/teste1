"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, FileText } from 'lucide-react';
import { storageService } from '@/services/storage';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    storageService.clearSession();
    router.push('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section with Glow */}
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => router.push('/')}>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center justify-center p-1.5 bg-white rounded-xl shadow-sm border border-slate-100">
                <Image 
                  src="/logo.png" 
                  alt="Alfa Logo" 
                  width={110} 
                  height={40} 
                  className="h-9 w-auto object-contain"
                  priority
                />
              </div>
            </div>
            
            <div className="hidden md:flex ml-8 space-x-1">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  pathname === '/' 
                    ? 'bg-white/10 text-white' 
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/relatorios"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  pathname === '/relatorios' 
                    ? 'bg-white/10 text-white' 
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                Relatórios
              </Link>
            </div>
          </div>

          {/* Action Section */}
          <div className="flex items-center">
             <button 
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors group flex items-center gap-2"
              >
                <span className="hidden md:block text-sm">Sair</span>
                <LogOut className="w-5 h-5 group-hover:text-brand-danger transition-colors" />
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
