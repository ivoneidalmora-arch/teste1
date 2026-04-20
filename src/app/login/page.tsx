"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { storageService } from '@/services/storage';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth logic
    setTimeout(() => {
      storageService.setSession('active_session_token');
      router.push('/');
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-brand-success rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
      
      <div className="relative w-full max-w-md px-6 py-12">
        <div className="glass-nav rounded-2xl p-8 shadow-2xl border border-white/10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl mb-6 border border-white/20">
              <Image 
                src="/logo.png" 
                alt="Alfa Logo" 
                width={160} 
                height={60} 
                className="h-12 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
              Dashboard Alfa
            </h1>
            <p className="text-slate-400 mt-2 text-sm">Autentique-se para acessar o sistema corporativo</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Usário de Acesso</label>
              <input 
                type="text" 
                defaultValue="admin"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ex: joao.silva"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Senha Operacional</label>
              <input 
                type="password" 
                defaultValue="alfa2026"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-500 hover:to-green-400 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Acessar Sistema'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
