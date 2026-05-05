"use client";

import { Upload, Info, FileSpreadsheet, FileText } from 'lucide-react';
import { ImportButton } from '@/features/ai-ocr/components/ImportButton';
import { useRouter } from 'next/navigation';

export default function ImportacoesPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/relatorios');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-2xl mb-2">
          <Upload className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Central de Importações</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          Utilize nossa tecnologia de processamento automático para carregar vistorias via planilhas Excel ou relatórios PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Planilhas Excel / CSV</h3>
            <p className="text-sm text-slate-500 mt-2">Suporta formatos .xlsx e .csv com mapeamento automático de colunas.</p>
          </div>
          <ul className="text-left text-sm text-slate-600 space-y-2 w-full">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Identificação de Placa e Data
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Cálculo automático de Lucro Líquido
            </li>
          </ul>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Relatórios em PDF</h3>
            <p className="text-sm text-slate-500 mt-2">Extração inteligente de dados usando IA para converter PDFs em lançamentos.</p>
          </div>
          <ul className="text-left text-sm text-slate-600 space-y-2 w-full">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              OCR de Alta Precisão
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Detecção automática de Clientes
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-10 text-white flex flex-col items-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center space-y-4 max-w-md text-center">
          <h2 className="text-2xl font-bold">Pronto para começar?</h2>
          <p className="text-slate-400">Selecione seu arquivo e nossa inteligência fará o resto do trabalho para você.</p>
          <div className="pt-4 w-full">
            <ImportButton onSuccess={handleSuccess} />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
        <Info className="w-6 h-6 text-blue-500 shrink-0" />
        <div>
          <h4 className="text-blue-900 font-bold mb-1">Dica de Importação</h4>
          <p className="text-blue-700 text-sm leading-relaxed">
            Para melhores resultados com planilhas, certifique-se de que as colunas de 'Placa' e 'Valor' estejam visíveis. 
            Em PDFs, garanta que o texto esteja legível e não seja apenas uma imagem escaneada de baixa qualidade.
          </p>
        </div>
      </div>
    </div>
  );
}
