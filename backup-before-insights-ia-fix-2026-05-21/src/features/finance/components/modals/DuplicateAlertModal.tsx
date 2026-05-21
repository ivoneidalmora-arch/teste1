"use client";

import { BaseModal } from '@/core/components/BaseModal';
import { Transaction } from '@/core/types/finance';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, Calendar, Car, Tag, User, DollarSign } from 'lucide-react';
import { formatBRL } from '@/core/utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  duplicate: Transaction | null;
}

export function DuplicateAlertModal({ isOpen, onClose, onConfirm, duplicate }: Props) {
  if (!duplicate) return null;

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Possível Lançamento Duplicado" 
      headerColorContext="warning"
    >
      <div className="space-y-6 py-2">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4">
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-amber-900 leading-tight">
              Atenção: Duplicidade Detectada
            </h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              Já existe um lançamento com esta mesma placa e este mesmo serviço nos últimos 30 dias. Verifique se não se trata de um erro operacional.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lançamento Anterior Encontrado</span>
            <span className="text-[10px] font-mono text-slate-400">ID #{duplicate.id}</span>
          </div>
          
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                <Car className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Placa</span>
                <span className="text-sm font-bold text-slate-700">{String(duplicate.metadata?.placa || 'N/A')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                <Tag className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Serviço</span>
                <span className="text-sm font-bold text-slate-700">{duplicate.category}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Data Anterior</span>
                <span className="text-sm font-bold text-slate-700">
                  {format(new Date(duplicate.date + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cliente</span>
                <span className="text-sm font-bold text-slate-700 truncate max-w-[140px]">{(('customer' in duplicate ? duplicate.customer : '') || 'Particular')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Valor Bruto</span>
                <span className="text-sm font-bold text-emerald-600">
                  {formatBRL(duplicate.grossAmount || duplicate.amount)}
                </span>
              </div>
            </div>

            {duplicate.netAmount && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Valor Líquido</span>
                  <span className="text-sm font-bold text-blue-600">
                    {formatBRL(duplicate.netAmount)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
          >
            Cancelar Lançamento
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
          >
            Continuar mesmo assim
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
