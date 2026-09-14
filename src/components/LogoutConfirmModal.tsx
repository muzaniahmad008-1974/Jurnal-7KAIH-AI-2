// ============================================================================
// SI-7KAIH AI - Modal Konfirmasi Selesai Sesi Pengguna (Logout)
// Menjamin keamanan data, pencatatan log audit, dan konfirmasi pengguna
// ============================================================================

import React, { useState } from 'react';
import {
  LogOut,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Settings,
  X,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { UserPersona, LogoutSettings } from '../lib/constants';
import { UserAvatar } from './UserAvatar';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: (clearDraft: boolean) => void;
  currentPersona: UserPersona;
  sessionDurationFormatted: string;
  logoutSettings: LogoutSettings;
  onOpenSettingsTab?: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
  currentPersona,
  sessionDurationFormatted,
  logoutSettings,
  onOpenSettingsTab,
}) => {
  const [clearDraft, setClearDraft] = useState(logoutSettings.clearDraftOnLogout);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-rose-50 via-white to-amber-50 px-6 py-4 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-700 font-black text-sm tracking-wide">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <span id="logout-dialog-title">Konfirmasi Selesai Sesi Pengguna</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-rose-100 text-slate-400 hover:text-rose-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Batal dan Kembali"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* User Profile Summary Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <UserAvatar
              avatar={currentPersona.avatar}
              role={currentPersona.role}
              name={currentPersona.name}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {currentPersona.name}
                </p>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-[#0753A5]">
                  {currentPersona.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {currentPersona.title} • {currentPersona.schoolName || 'Nasional'}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600 font-mono">
                <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  <Clock className="w-3 h-3 text-[#0753A5]" />
                  <span>Durasi Sesi: {sessionDurationFormatted}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Security & Data Integrity Notice */}
          <div className="space-y-2 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">
              Apakah Anda yakin ingin menyelesaikan sesi aktif ini?
            </p>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1 text-[11px]">
              <div className="flex items-start gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Seluruh data jurnal, pembiasaan, atau validasi yang sudah Anda simpan telah tersimpan dengan aman pada peramban ini.
                </span>
              </div>
            </div>
          </div>

          {/* Optional Checkbox: Clear Drafts */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors text-xs text-slate-700">
            <input
              type="checkbox"
              checked={clearDraft}
              onChange={(e) => setClearDraft(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
            <span className="leading-snug">
              Bersihkan draf isian sementara yang belum disimpan saat keluar
            </span>
          </label>

          {/* Destination Notification */}
          <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
            <span>
              Tujuan pengalihan:{' '}
              <strong className="text-slate-700">
                {logoutSettings.redirectDestination === 'LOGIN_DASHBOARD'
                  ? 'Dashboard Login Aplikasi'
                  : logoutSettings.redirectDestination === 'SSO_MODAL'
                  ? 'Pemilihan Akun Cepat'
                  : 'Beranda Siswa'}
              </strong>
            </span>
            {onOpenSettingsTab && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettingsTab();
                }}
                className="text-[#0753A5] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Settings className="w-3 h-3" />
                <span>Ubah Pengaturan</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Lanjutkan Sesi Kerja
          </button>
          <button
            id="btn-confirm-logout-action"
            type="button"
            onClick={() => onConfirmLogout(clearDraft)}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Ya, Selesaikan Sesi (Logout)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
