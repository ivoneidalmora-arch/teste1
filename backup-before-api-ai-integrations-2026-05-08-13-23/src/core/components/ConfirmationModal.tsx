"use client";

import { BaseModal } from '@/core/components/BaseModal';
import { AlertTriangle, Trash2, X, CheckCircle } from 'lucide-react';
import { cn } from '@/core/utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false,
  children
}: Props) {
  const variantStyles = {
    danger: {
      icon: AlertTriangle,
      iconBg: 'bg-rose-100',
      iconText: 'text-rose-600',
      button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
      headerContext: 'danger' as const
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
      headerContext: 'warning' as const
    },
    info: {
      icon: AlertTriangle,
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
      headerContext: 'info' as const
    },
    success: {
      icon: CheckCircle,
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-600',
      button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
      headerContext: 'success' as const
    }
  };

  const currentVariant = variantStyles[variant];
  const Icon = currentVariant.icon;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} headerColorContext={currentVariant.headerContext}>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-2xl shrink-0", currentVariant.iconBg, currentVariant.iconText)}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
          </div>
        </div>

        {children}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "flex-[2] py-3 px-4 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2",
              currentVariant.button
            )}
          >
            {loading ? (
              <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              variant === 'danger' && <Trash2 className="w-4 h-4" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
