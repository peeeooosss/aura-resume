'use client';

import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  destructive = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-surface-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                destructive ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'
              )}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-2 rounded-xl text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-surface-500 dark:text-slate-400 text-sm leading-relaxed">{message}</p>
        </div>

        <div className="flex justify-end gap-3 p-5 pt-0">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-slate-800 text-surface-700 dark:text-slate-300 font-medium hover:bg-surface-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-2.5 rounded-xl text-white font-medium flex items-center gap-2 transition-colors disabled:opacity-50',
              destructive ? 'bg-rose-600 hover:bg-rose-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90'
            )}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
