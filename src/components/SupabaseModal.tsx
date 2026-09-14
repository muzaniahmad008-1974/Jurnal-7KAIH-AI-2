// ============================================================================
// SI-7KAIH AI - Supabase Connection & SQL Schema Modal
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  X,
  Server,
  Zap,
} from 'lucide-react';
import {
  refreshSupabaseStatus,
  subscribeToSyncStatus,
  SupabaseSyncStatus,
  syncAllToSupabase,
} from '../lib/supabaseService';
import { SUPABASE_CONFIG } from '../lib/supabase';
import { DailyJournal, StudentMonthlyReflection, ParentMonthlyReflection } from '../../packages/types/src/index';
import { UserPersona } from '../lib/constants';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  journals: DailyJournal[];
  studentReflection: StudentMonthlyReflection;
  parentReflection: ParentMonthlyReflection;
  users: UserPersona[];
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  journals,
  studentReflection,
  parentReflection,
  users,
}) => {
  const [syncStatus, setSyncStatus] = useState<SupabaseSyncStatus>({
    isConfigured: true,
    isConnected: false,
    tablesReady: false,
    lastSyncedAt: null,
    statusMessage: 'Memeriksa...',
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    const unsub = subscribeToSyncStatus(setSyncStatus);
    refreshSupabaseStatus();
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const sqlCode = `-- ============================================================================
-- SI-7KAIH AI - Skema Basis Data Supabase
-- Jalankan di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabel Jurnal Harian Siswa
CREATE TABLE IF NOT EXISTS public.si7kaih_journals (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'SUBMITTED',
    parent_validated BOOLEAN DEFAULT FALSE,
    teacher_validated BOOLEAN DEFAULT FALSE,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT si7kaih_journals_student_date_unique UNIQUE (student_id, date)
);

-- 2. Tabel Refleksi Bulanan Siswa & Orang Tua
CREATE TABLE IF NOT EXISTS public.si7kaih_reflections (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel Master Akun Pengguna
CREATE TABLE IF NOT EXISTS public.si7kaih_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    name TEXT,
    role TEXT NOT NULL,
    school_id TEXT,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabel Lencana & Gamifikasi
CREATE TABLE IF NOT EXISTS public.si7kaih_badges (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE,
    title TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabel Program Sekolah
CREATE TABLE IF NOT EXISTS public.si7kaih_programs (
    id TEXT PRIMARY KEY,
    school_id TEXT,
    title TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Tabel Rencana Tindak Lanjut (RTL)
CREATE TABLE IF NOT EXISTS public.si7kaih_followups (
    id TEXT PRIMARY KEY,
    school_id TEXT,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Tabel Jejak Rekam / Audit Log
CREATE TABLE IF NOT EXISTS public.si7kaih_audit_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    actor_name TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,
    details TEXT,
    school_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.si7kaih_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.si7kaih_audit_logs ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Penuh Klien
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read/write on journals" ON public.si7kaih_journals;
    CREATE POLICY "Allow public read/write on journals" ON public.si7kaih_journals FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public read/write on reflections" ON public.si7kaih_reflections;
    CREATE POLICY "Allow public read/write on reflections" ON public.si7kaih_reflections FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public read/write on users" ON public.si7kaih_users;
    CREATE POLICY "Allow public read/write on users" ON public.si7kaih_users FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public read/write on badges" ON public.si7kaih_badges;
    CREATE POLICY "Allow public read/write on badges" ON public.si7kaih_badges FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public read/write on programs" ON public.si7kaih_programs;
    CREATE POLICY "Allow public read/write on programs" ON public.si7kaih_programs FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public read/write on followups" ON public.si7kaih_followups;
    CREATE POLICY "Allow public read/write on followups" ON public.si7kaih_followups FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public read/write on audit_logs" ON public.si7kaih_audit_logs;
    CREATE POLICY "Allow public read/write on audit_logs" ON public.si7kaih_audit_logs FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 8. Publikasi Realtime untuk Sinkronisasi Otomatis Antar Pengguna
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.si7kaih_journals;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.si7kaih_reflections;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.si7kaih_users;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.si7kaih_audit_logs;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
END $$;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncAllToSupabase({
        journals,
        studentReflection,
        parentReflection,
        users,
      });
      setSyncFeedback(res.message);
      await refreshSupabaseStatus();
    } catch (err: any) {
      setSyncFeedback(`Gagal: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      id="supabase-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div
        id="supabase-modal-card"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Koneksi Basis Data Supabase</h2>
              <p className="text-xs text-emerald-100">
                Penyimpanan Permanen Jurnal 7 Kebiasaan & Master SIM Sekolah
              </p>
            </div>
          </div>
          <button
            id="close-supabase-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-4">
            <div
              className={`w-4 h-4 rounded-full mt-1 shrink-0 ${
                syncStatus.tablesReady
                  ? 'bg-emerald-500 animate-pulse'
                  : syncStatus.isConnected
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <div className="flex-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">
                  {syncStatus.tablesReady
                    ? '🟢 Supabase Aktif & Sinkronisasi Permanen'
                    : syncStatus.isConnected
                    ? '🟡 Terhubung ke Supabase (Menunggu Skema Tabel)'
                    : '🔴 Menghubungkan ke Supabase...'}
                </span>
                <button
                  onClick={() => refreshSupabaseStatus()}
                  className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Periksa Ulang
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-1">{syncStatus.statusMessage}</p>
              <div className="mt-2 text-xs font-mono text-slate-500 truncate">
                Target URL: <span className="text-emerald-700 font-semibold">{SUPABASE_CONFIG.url}</span>
              </div>
              {syncStatus.lastSyncedAt && (
                <div className="mt-1 text-xs text-slate-500">
                  Terakhir sinkron: {new Date(syncStatus.lastSyncedAt).toLocaleTimeString('id-ID')}
                </div>
              )}
            </div>
          </div>

          {/* Real-time Multi-User Auto-Sync Banner */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm">
                <Zap className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Sinkronisasi Otomatis Antar Pengguna: AKTIF</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Real-Time Live
              </span>
            </div>
            <p className="text-xs text-emerald-800/90 leading-relaxed">
              Setiap kali siswa mengisi jurnal di perangkatnya, atau orang tua/guru melakukan validasi kebiasaan, data akan disinkronkan secara otomatis tanpa perlu memuat ulang halaman.
            </p>
            <div className="pt-2 border-t border-emerald-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-700">
              <span className="font-mono">
                Transaksi Otomatis: <strong className="text-emerald-900">{syncStatus.syncCount} pembaruan</strong>
              </span>
              <span className="text-emerald-600 italic">
                {syncStatus.lastSyncEvent || 'Mendengarkan event realtime...'}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              id="sync-now-supabase-btn"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Data Sekarang'}
            </button>

            <button
              id="copy-sql-schema-btn"
              onClick={handleCopySql}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedSql ? 'Skema SQL Berhasil Disalin!' : 'Salin Skema SQL Supabase'}
            </button>
          </div>

          {syncFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{syncFeedback}</span>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Panduan 3 Langkah Cepat Mengaktifkan Tabel di Supabase:
            </h3>
            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside pl-1 leading-relaxed">
              <li>
                Klik tombol <strong>"Salin Skema SQL Supabase"</strong> di atas.
              </li>
              <li>
                Buka tab <strong>Supabase Dashboard</strong> proyek Anda, masuk ke menu{' '}
                <span className="font-semibold text-slate-800">SQL Editor</span>, dan buat query baru.
              </li>
              <li>
                Tempel (Paste) kode SQL tersebut lalu klik <strong>"Run"</strong>. Seluruh tabel akan otomatis
                dibuat dan data aplikasi akan langsung tersimpan permanen!
              </li>
            </ol>
          </div>

          {/* Code Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700">
                Pratinjau Skema SQL (supabase/schema.sql):
              </span>
              <span className="text-[11px] text-slate-500">7 Tabel + RLS Terbuka</span>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-44 leading-relaxed border border-slate-800">
              {sqlCode}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Kredensial URL & Key dikonfigurasi melalui Secrets
          </span>
          <button
            id="close-supabase-modal-footer-btn"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
