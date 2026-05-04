"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { loginUser } from '@/features/auth/actions/auth.actions';
import { useAuthContext } from '@/features/auth/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const result = await loginUser(formData);
      if (result.error) {
        setError(result.error);
      } else {
        await refresh();
        router.push('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Ocorreu um erro ao tentar acessar o sistema. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-brand-success rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
      
      <div className="relative w-full max-w-md px-6 py-12">
        <div className="glass-nav rounded-2xl p-6 sm:p-10 shadow-2xl border border-white/10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-white rounded-xl shadow-xl mb-4 border border-white/20">
              <Image 
                src="/logo.png" 
                alt="Alfa Logo" 
                width={160} 
                height={60} 
                className="h-12 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
              Dashboard Alfa
            </h1>
            <p className="text-slate-400 mt-1.5 text-xs sm:text-sm">Autentique-se para acessar o sistema corporativo</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-xl text-xs text-center font-bold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nome de Usuário</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                placeholder="Ex: joao_alfa"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Senha Operacional</label>
                <Link href="/forgot-password" title="Recuperar senha" className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider">
                  Esqueci a senha
                </Link>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 hover:scale-[1.02] active:scale-[0.98] text-white font-black py-4 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Entrar no Sistema'
              )}
            </button>
          </form>

          <div className="mt-10 text-center border-t border-white/5 pt-6">
            <p className="text-slate-500 text-sm">
              Novo por aqui?{' '}
              <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                Criar uma conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
