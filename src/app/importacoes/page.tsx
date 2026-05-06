"use client";

import { Upload, Info, FileSpreadsheet, FileText, Database } from 'lucide-react';
import { ImportButton } from '@/features/ai-ocr/components/ImportButton';
import { DatabaseImportButton } from '@/features/finance/components/DatabaseImportButton';
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Planilhas Excel</h3>
            <p className="text-sm text-slate-500 mt-2">Suporta formatos .xlsx e .csv com mapeamento de colunas.</p>
          </div>
          <ul className="text-left text-sm text-slate-600 space-y-2 w-full flex-1">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Processamento em lote
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Identificação de Placas
            </li>
          </ul>
          <div className="w-full pt-4">
            <ImportButton 
              onSuccess={handleSuccess} 
              label="Importar Excel" 
              accept=".xlsx,.xls,.csv"
              variant="emerald"
              className="w-full px-4" 
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Relatórios PDF</h3>
            <p className="text-sm text-slate-500 mt-2">Extração inteligente de dados usando IA para converter PDFs.</p>
          </div>
          <ul className="text-left text-sm text-slate-600 space-y-2 w-full flex-1">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              OCR de Alta Precisão
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Detecção de Clientes
            </li>
          </ul>
          <div className="w-full pt-4">
            <ImportButton 
              onSuccess={handleSuccess} 
              label="Importar PDF" 
              accept=".pdf"
              variant="secondary"
              className="w-full px-4" 
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Banco de Dados</h3>
            <p className="text-sm text-slate-500 mt-2">Importação direta de backups (.json) ou migrações estruturadas.</p>
          </div>
          <ul className="text-left text-sm text-slate-600 space-y-2 w-full flex-1">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Restauração de Backup
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Importação Legada
            </li>
          </ul>
          <div className="w-full pt-4">
            <DatabaseImportButton onSuccess={handleSuccess} className="w-full px-4" />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-4 bg-purple-50/50 p-8 rounded-3xl border border-purple-100 shadow-sm">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-purple-900 font-bold mb-1">Migração de Dados Estruturados</h4>
          <p className="text-purple-700 text-sm leading-relaxed mb-4">
            Se você possui um arquivo de backup (.json) exportado anteriormente ou uma planilha de migração estruturada, 
            utilize a opção de <b>Banco de Dados</b> acima para restaurar todo o seu histórico de uma só vez.
          </p>
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
