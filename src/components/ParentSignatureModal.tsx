// ============================================================================
// SI-7KAIH AI - Parent Signature & Validation Modal
// Mendukung Tanda Tangan Digital & Paraf Interaktif dengan Sinkronisasi Realtime
// ============================================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  CheckCircle2,
  RotateCcw,
  PenTool,
  Feather,
  Sparkles,
  Heart,
  ShieldCheck,
  Calendar,
  User,
  Info,
  Sliders,
} from 'lucide-react';
import { DailyJournal, HabitCode } from '../../packages/types/src/index';
import { HABIT_LIST } from '../lib/constants';

interface ParentSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  journal: DailyJournal;
  studentName: string;
  className?: string;
  defaultValidatorName?: string;
  source: 'STUDENT_DASHBOARD' | 'PARENT_DASHBOARD';
  onSaveValidation: (params: {
    journalId: string;
    parentName: string;
    note: string;
    validationType: 'SIGNATURE' | 'INITIALS';
    signatureDataUrl: string;
    source: 'STUDENT_DASHBOARD' | 'PARENT_DASHBOARD';
  }) => void;
}

export const ParentSignatureModal: React.FC<ParentSignatureModalProps> = ({
  isOpen,
  onClose,
  journal,
  studentName,
  className,
  defaultValidatorName = '',
  source,
  onSaveValidation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [validationType, setValidationType] = useState<'SIGNATURE' | 'INITIALS'>(
    journal?.parentValidationType || 'SIGNATURE'
  );
  const [penColor, setPenColor] = useState<string>('#0753A5'); // Official Navy Blue
  const [penWidth, setPenWidth] = useState<number>(2.5);

  const [parentName, setParentName] = useState<string>(() => {
    return (
      journal?.parentValidatorName ||
      defaultValidatorName ||
      localStorage.getItem('si7kaih_parent_name_pref') ||
      'Orang Tua / Wali Siswa'
    );
  });

  const [note, setNote] = useState<string>(() => {
    return journal?.parentValidationNote || '';
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick preset notes
  const presetNotes = [
    'Alhamdulillah, ananda disiplin dan penuh semangat hari ini!',
    'Hebat nak, pertahankan ibadah dan kebiasaan baikmu.',
    'Terima kasih sudah jujur dan tertib mengisi 7 kebiasaan.',
    'Ibu/Ayah sangat bangga dengan kemandirianmu hari ini.',
  ];

  // Set up canvas when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg(null);
    setValidationType(journal?.parentValidationType || 'SIGNATURE');
    setParentName(
      journal?.parentValidatorName ||
        defaultValidatorName ||
        localStorage.getItem('si7kaih_parent_name_pref') ||
        'Orang Tua / Wali Siswa'
    );
    setNote(journal?.parentValidationNote || '');

    const timer = setTimeout(() => {
      initCanvas();
    }, 60);

    return () => clearTimeout(timer);
  }, [isOpen, journal, defaultValidatorName]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set high DPI resolution
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;

    // If already has an existing signature, draw it on canvas
    if (journal?.parentSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = journal.parentSignature;
    } else {
      ctx.clearRect(0, 0, rect.width, rect.height);
      setHasDrawn(false);
    }
  }, [journal, penColor, penWidth]);

  // Handle stroke start
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = validationType === 'INITIALS' ? 2 : penWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
    setErrorMsg(null);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    setErrorMsg(null);
  };

  // Generate calligraphic quick initials paraf based on parent's name
  const handleGenerateAutoInitials = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Extract initials
    const words = parentName.trim().split(/\s+/).filter(Boolean);
    let initials = 'OT';
    if (words.length >= 2) {
      initials = `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
      initials = words[0].substring(0, 2).toUpperCase();
    }

    const cx = rect.width / 2;
    const cy = rect.height / 2;

    // Draw stylized initials stamp
    ctx.save();
    ctx.strokeStyle = penColor;
    ctx.fillStyle = penColor;

    // Elegant circle or oval border
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 38, 28, -0.1, 0, Math.PI * 2);
    ctx.stroke();

    // Initials text
    ctx.font = 'italic bold 28px "Playfair Display", "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, cx, cy - 2);

    // Subtle flourish stroke under initials
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy + 18);
    ctx.quadraticCurveTo(cx, cy + 24, cx + 32, cy + 14);
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.restore();

    setHasDrawn(true);
    setValidationType('INITIALS');
    setErrorMsg(null);
  };

  const handleSave = () => {
    if (!parentName.trim()) {
      setErrorMsg('Mohon cantumkan nama orang tua / wali yang memvalidasi.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      setErrorMsg('Mohon bubuhkan tanda tangan atau paraf pada kotak yang disediakan.');
      return;
    }

    const signatureDataUrl = canvas.toDataURL('image/png');

    // Save parent name preference
    try {
      localStorage.setItem('si7kaih_parent_name_pref', parentName.trim());
    } catch (_e) {}

    onSaveValidation({
      journalId: journal.id,
      parentName: parentName.trim(),
      note: note.trim(),
      validationType,
      signatureDataUrl,
      source,
    });

    onClose();
  };

  if (!isOpen) return null;

  const dateFormatted = journal?.journalDate
    ? new Date(journal.journalDate + 'T00:00:00').toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Hari Ini';

  const completedCount = journal?.completedCount || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0753A5] to-[#20A5D5] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight leading-tight">
                Validasi & Pendampingan Orang Tua
              </h3>
              <p className="text-xs text-blue-100 flex items-center gap-2 mt-0.5">
                <span>{studentName}</span>
                {className && <span>• {className}</span>}
                <span>• {source === 'STUDENT_DASHBOARD' ? 'Dashboard Murid' : 'Dashboard Orang Tua'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Tutup Formulir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner: Multi-Dashboard Sync */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-900 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-[11px] sm:text-xs">
              <strong>Sinkronisasi Otomatis:</strong> Validasi ini langsung tercatat di <strong>Dashboard Murid</strong> &amp; <strong>Dashboard Orang Tua</strong>.
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
            Realtime
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
          {/* Summary of Student Habits */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Calendar className="w-4 h-4 text-[#0753A5]" />
                <span>{dateFormatted}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0753A5] font-extrabold text-xs">
                {completedCount} dari 7 Kebiasaan Terlaksana
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
              {HABIT_LIST.map((h, i) => {
                const isDone = !!journal?.entries?.[h.code]?.completed;
                return (
                  <div
                    key={h.code}
                    className={`px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1.5 ${
                      isDone
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0">
                      {isDone ? '✓' : '○'}
                    </span>
                    <span className="truncate">{i + 1}. {h.name.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Field: Parent Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#0753A5]" />
              <span>Nama Lengkap Orang Tua / Wali Siswa:</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => {
                setParentName(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Contoh: Bpk. H. Ahmad Dahlan / Ibu Siti Aminah"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0753A5]/40"
            />
          </div>

          {/* Signature / Paraf Pad Section */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-[#0753A5]" />
                <span>Bubuhi Tanda Tangan atau Paraf:</span>
                <span className="text-rose-500">*</span>
              </label>

              {/* Toggle Tanda Tangan vs Paraf */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setValidationType('SIGNATURE')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    validationType === 'SIGNATURE'
                      ? 'bg-white text-[#0753A5] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PenTool className="w-3 h-3" />
                  <span>Tanda Tangan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setValidationType('INITIALS')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    validationType === 'INITIALS'
                      ? 'bg-white text-[#0753A5] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Feather className="w-3 h-3" />
                  <span>Paraf</span>
                </button>
              </div>
            </div>

            {/* Canvas Drawing Box */}
            <div className="relative border-2 border-dashed border-blue-200 bg-blue-50/20 rounded-2xl overflow-hidden group">
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="w-full h-36 sm:h-40 block cursor-crosshair touch-none bg-white"
                style={{ touchAction: 'none' }}
              />

              {/* Guide Line for Signature / Paraf */}
              <div className="absolute left-6 right-6 bottom-7 border-b border-slate-200 pointer-events-none flex items-center justify-between text-[10px] text-slate-300">
                <span>garis tanda tangan / paraf</span>
                <span>{validationType === 'SIGNATURE' ? 'Tanda Tangan Digital' : 'Paraf Singkat'}</span>
              </div>

              {/* Helper text overlay when canvas is empty */}
              {!hasDrawn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 gap-1 p-4 text-center">
                  <PenTool className="w-6 h-6 text-blue-300 stroke-[1.5]" />
                  <p className="text-xs font-semibold text-slate-500">
                    Gunakan jari, stylus, atau kursor mouse untuk membubuhkan {validationType === 'SIGNATURE' ? 'tanda tangan' : 'paraf'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Atau klik tombol "Paraf Otomatis" untuk inisial instan
                  </p>
                </div>
              )}
            </div>

            {/* Canvas Tools Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearCanvas}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Bersihkan area tanda tangan"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Hapus / Ulangi</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateAutoInitials}
                  className="px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Gunakan inisial nama orang tua secara otomatis"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Paraf Otomatis</span>
                </button>
              </div>

              {/* Ink Color Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">Warna Tinta:</span>
                <button
                  type="button"
                  onClick={() => setPenColor('#0753A5')}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    penColor === '#0753A5' ? 'border-slate-800 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: '#0753A5' }}
                  title="Tinta Biru Resmi"
                />
                <button
                  type="button"
                  onClick={() => setPenColor('#1e293b')}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    penColor === '#1e293b' ? 'border-slate-800 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: '#1e293b' }}
                  title="Tinta Hitam Pekat"
                />
              </div>
            </div>
          </div>

          {/* Form Field: Note / Appreciation */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Pesan Kasih Sayang &amp; Apresiasi untuk Ananda (Opsional):</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Tuliskan kata-kata penyemangat untuk usaha ananda hari ini..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0753A5]/40"
            />

            {/* Quick Note Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {presetNotes.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNote(preset)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#0753A5] border border-slate-200 text-[10px] text-slate-600 transition-colors text-left truncate max-w-full cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Format Resmi Dokumen Karakter SI-7KAIH</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batalkan
            </button>
            <button
              type="button"
              id="submit-parent-validation-btn"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#41A85F] hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan &amp; Validasi Jurnal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
