"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { authService } from '@/features/auth/services/auth.service';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Reset error:', err);
      setError(err.message || 'Ocorreu um erro ao tentar enviar o e-mail de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden px-6">
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      
      <div className="relative w-full max-w-md py-12">
        <div className="glass-nav rounded-2xl p-6 sm:p-10 shadow-2xl border border-white/10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-white rounded-xl shadow-xl mb-4 border border-white/20">
              <Image src="/logo.png" alt="Alfa Logo" width={140} height={50} className="h-10 w-auto object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white">Recuperar Senha</h1>
            <p className="text-slate-400 mt-2 text-sm">Insira seu e-mail para receber as instruções</p>
          </div>
          
          {success ? (
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-6 rounded-xl text-center">
              <p className="font-bold mb-4">E-mail Enviado!</p>
              <p className="text-sm mb-6 text-slate-400">Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.</p>
              <Link href="/login" className="text-sm font-bold text-blue-400 hover:underline">Voltar para o Login</Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-lg text-xs text-center font-bold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">E-mail</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="seu@email.com.br"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Enviar Link de Recuperação'
                )}
              </button>

              <div className="text-center">
                <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors">
                  Cancelar e voltar
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
