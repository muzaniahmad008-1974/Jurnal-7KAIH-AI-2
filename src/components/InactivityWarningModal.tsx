// ============================================================================
// SI-7KAIH AI - Inactivity Warning Modal Component
// Peringatan Otomatis Sebelum Sesi Berakhir Akibat Inaktivitas (Khusus Murid & Akun Aktif)
// ============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { Clock, LogOut, CheckCircle2, ShieldAlert } from 'lucide-react';

interface InactivityWarningModalProps {
  isOpen: boolean;
  studentName: string;
  role: string;
  totalTimeoutMinutes?: number;
  warningDurationSeconds?: number;
  onStayLoggedIn: () => void;
  onLogoutNow: () => void;
}

export const InactivityWarningModal: React.FC<InactivityWarningModalProps> = ({
  isOpen,
  studentName,
  role,
  totalTimeoutMinutes = 5,
  warningDurationSeconds = 60,
  onStayLoggedIn,
  onLogoutNow,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(warningDurationSeconds);

  // Reset countdown every time the modal is opened
  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(warningDurationSeconds);
      return;
    }

    setSecondsRemaining(warningDurationSeconds);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogoutNow();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, warningDurationSeconds, onLogoutNow]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        onStayLoggedIn();
      }
    },
    [isOpen, onStayLoggedIn]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const isStudent = role === 'STUDENT';
  const isParent = role === 'PARENT';
  const progressPercent = Math.max(
    0,
    Math.min(100, (secondsRemaining / warningDurationSeconds) * 100)
  );

  return (
    <div
      id="inactivity-warning-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inactivity-warning-title"
    >
      <div
        id="inactivity-warning-card"
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-amber-200 text-center space-y-5 animate-in zoom-in-95 duration-150 relative overflow-hidden"
      >
        {/* Subtle background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-100 rounded-full blur-2xl pointer-events-none" />

        {/* Warning Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-inner relative z-10">
          <Clock className="w-8 h-8 text-amber-600 animate-pulse" />
        </div>

        {/* Header Content */}
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            <span>Peringatan Inaktivitas Sesi ({totalTimeoutMinutes} Menit)</span>
          </div>

          <h3
            id="inactivity-warning-title"
            className="text-xl font-black text-slate-900 tracking-tight"
          >
            {isStudent
              ? 'Sesi Murid Segera Berakhir'
              : isParent
              ? 'Sesi Orang Tua Segera Berakhir'
              : 'Sesi Pengguna Segera Berakhir'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            Halo{' '}
            <strong className="text-slate-900">
              {studentName || (isParent ? 'Bapak/Ibu Orang Tua' : 'Pengguna')}
            </strong>
            , sistem mendeteksi tidak ada aktivitas selama {totalTimeoutMinutes - 1} menit di{' '}
            {isStudent ? 'dashboard murid' : isParent ? 'dashboard orang tua' : 'aplikasi'}. Demi
            perlindungan privasi data keluarga dan kepatuhan UU PDP No. 27/2022, sesi akan keluar
            otomatis dalam:
          </p>
        </div>

        {/* Countdown & Progress Bar */}
        <div className="py-4 px-6 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/60 to-amber-100/50 border border-amber-200 shadow-inner relative z-10">
          <div className="text-4xl font-black text-amber-800 font-mono tracking-wider">
            {secondsRemaining}{' '}
            <span className="text-sm font-bold text-amber-700">detik</span>
          </div>

          {/* Animated Visual Progress */}
          <div className="w-full bg-amber-200/70 h-2.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                secondsRemaining <= 15
                  ? 'bg-rose-500 animate-pulse'
                  : secondsRemaining <= 30
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-amber-800/90 mt-2 font-medium">
            Klik tombol di bawah ini atau tekan tombol <strong>Enter</strong> untuk melanjutkan sesi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1 relative z-10">
          <button
            id="btn-inactivity-stay-active"
            type="button"
            onClick={onStayLoggedIn}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Saya Masih Aktif (Tetap Masuk)</span>
          </button>

          <button
            id="btn-inactivity-logout-now"
            type="button"
            onClick={onLogoutNow}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold transition-colors cursor-pointer border border-transparent hover:border-rose-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
