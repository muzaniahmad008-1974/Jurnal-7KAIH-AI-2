import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export interface DeleteModalState {
  isOpen: boolean;
  type: 'SCHOOL' | 'ROMBEL' | 'STUDENT' | 'USER' | 'PROGRAM' | 'AUDIT_LOGS' | 'RESET' | 'BULK_STUDENT' | 'BULK_USER';
  title: string;
  itemName: string;
  itemIdentifier?: string;
  warningMessage?: string;
  data?: any;
}

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  itemIdentifier?: string;
  warningMessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemIdentifier,
  warningMessage,
  confirmLabel = 'Ya, Hapus Data',
  cancelLabel = 'Batal',
  isDanger = true,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="confirm-delete-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="confirm-delete-modal-container"
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDanger
                  ? 'bg-rose-100 text-rose-600 border border-rose-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}
            >
              {isDanger ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">Konfirmasi tindakan penghapusan</p>
            </div>
          </div>
          <button
            id="close-confirm-delete-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus data berikut dari sistem?
            </p>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-900 block break-words">
                {itemName}
              </span>
              {itemIdentifier && (
                <span className="text-[11px] font-mono text-slate-500 block break-words">
                  {itemIdentifier}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50/80 border border-rose-200/80 text-rose-800 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>
              {warningMessage ||
                'Tindakan ini permanen pada penyimpanan lokal dan master data. Pastikan data tidak sedang aktif digunakan.'}
            </span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            id="cancel-delete-modal-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            id="confirm-delete-action-btn"
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                : 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
