"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden px-6">
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      
      <div className="relative w-full max-w-md py-12">
        <div className="glass-nav rounded-2xl p-6 sm:p-10 shadow-2xl border border-white/10 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-white rounded-xl shadow-xl mb-6 border border-white/20">
            <Image src="/logo.png" alt="Alfa Logo" width={140} height={50} className="h-10 w-auto object-contain" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">Esqueceu a Senha?</h1>
          <p className="text-slate-400 text-sm mb-8">
            Como utilizamos um sistema de acesso operacional simplificado, a recuperação de senha deve ser solicitada diretamente ao administrador do sistema.
          </p>
          
          <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-2xl mb-8">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-2">Procedimento</span>
            <p className="text-white font-medium text-sm">
              Entre em contato com o suporte ou gerência para resetar suas credenciais.
            </p>
          </div>
          
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
            ← Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}
