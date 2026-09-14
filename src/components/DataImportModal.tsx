// ============================================================================
// SI-7KAIH AI - Data Import Modal Component
// Pengelolaan mandiri impor berkas Peserta Didik & Rombel berbasis Template CSV
// ============================================================================

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  Student,
  Rombel,
  downloadStudentTemplateCsv,
  downloadRombelTemplateCsv,
  parseStudentCsv,
  parseRombelCsv,
  generateStudentTemplateCsv,
  generateRombelTemplateCsv,
} from '../lib/studentData';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportStudents: (students: Student[], mode: 'APPEND' | 'REPLACE') => void;
  onImportRombels: (rombels: Rombel[], mode: 'APPEND' | 'REPLACE') => void;
  defaultTab?: 'STUDENTS' | 'ROMBELS';
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  onImportStudents,
  onImportRombels,
  defaultTab = 'STUDENTS',
}) => {
  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'ROMBELS'>(defaultTab);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'APPEND' | 'REPLACE'>('APPEND');

  // Parsed state
  const [parsedStudents, setParsedStudents] = useState<Student[]>([]);
  const [parsedRombels, setParsedRombels] = useState<Rombel[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [totalLinesParsed, setTotalLinesParsed] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setFileName(null);
    setParsedStudents([]);
    setParsedRombels([]);
    setValidationErrors([]);
    setTotalLinesParsed(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFileContent = (content: string, name: string) => {
    setFileName(name);
    if (activeTab === 'STUDENTS') {
      const result = parseStudentCsv(content);
      setParsedStudents(result.valid);
      setValidationErrors(result.errors);
      setTotalLinesParsed(result.totalRows);
    } else {
      const result = parseRombelCsv(content);
      setParsedRombels(result.valid);
      setValidationErrors(result.errors);
      setTotalLinesParsed(result.totalRows);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        processFileContent(text, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        processFileContent(text, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadOfficialTemplate = () => {
    if (activeTab === 'STUDENTS') {
      const content = generateStudentTemplateCsv();
      processFileContent(content, 'FORMAT_RESMI_PESERTA_DIDIK.csv');
    } else {
      const content = generateRombelTemplateCsv();
      processFileContent(content, 'FORMAT_RESMI_ROMBONGAN_BELAJAR.csv');
    }
  };

  const handleExecuteImport = () => {
    if (activeTab === 'STUDENTS') {
      if (parsedStudents.length === 0) return;
      onImportStudents(parsedStudents, importMode);
    } else {
      if (parsedRombels.length === 0) return;
      onImportRombels(parsedRombels, importMode);
    }
    onClose();
  };

  const hasParsedData =
    activeTab === 'STUDENTS' ? parsedStudents.length > 0 : parsedRombels.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0753A5] text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Impor Berkas Mandiri Satuan Pendidikan
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Tanpa Dapodik
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Input data massal menggunakan berkas format CSV resmi yang disediakan aplikasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector: Siswa vs Rombel */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-4 bg-white">
          <button
            onClick={() => {
              setActiveTab('STUDENTS');
              handleReset();
            }}
            className={`pb-3 flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors ${
              activeTab === 'STUDENTS'
                ? 'border-b-2 border-[#0753A5] text-[#0753A5]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Impor Data Peserta Didik</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('ROMBELS');
              handleReset();
            }}
            className={`pb-3 flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors ${
              activeTab === 'ROMBELS'
                ? 'border-b-2 border-[#0753A5] text-[#0753A5]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Impor Data Rombongan Belajar</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Step 1: Download Template */}
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-[#0753A5]" />
                  Langkah 1: Unduh Berkas Template Resmi Aplikasi
                </span>
                <p className="text-[11px] text-blue-900/80 mt-1 leading-relaxed">
                  {activeTab === 'STUDENTS'
                    ? 'Unduh format template CSV peserta didik. File template sudah mencakup header terstandar (NISN, Nama Siswa, JK, Rombel, Tanggal Lahir, Nama Wali, No HP Wali).'
                    : 'Unduh format template CSV rombongan belajar. File template sudah mencakup header terstandar (Kode Rombel, Nama Rombel, Tingkat, Fase, Wali Kelas, NIP, Kapasitas, Tahun Ajaran).'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'STUDENTS') {
                    downloadStudentTemplateCsv();
                  } else {
                    downloadRombelTemplateCsv();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-blue-100/60 text-[#0753A5] font-bold text-xs border border-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template ({activeTab === 'STUDENTS' ? 'Siswa' : 'Rombel'})</span>
              </button>
            </div>
          </div>

          {/* Step 2: Upload File Drag & Drop Zone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#0753A5]" />
                Langkah 2: Pilih atau Unggah Berkas Terisi (.CSV)
              </span>
              <button
                type="button"
                onClick={handleLoadOfficialTemplate}
                className="text-[11px] font-bold text-[#0753A5] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Muat Format Contoh Resmi</span>
              </button>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#0753A5] bg-blue-50/50'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
                <Upload className="w-6 h-6 text-[#0753A5]" />
              </div>
              <p className="font-bold text-slate-800 text-xs">
                {fileName ? (
                  <span className="text-[#0753A5] font-black">{fileName}</span>
                ) : (
                  'Seret berkas ke sini atau klik untuk memilih berkas'
                )}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Mendukung format berkas .CSV (ekspor dari Excel, Google Sheets, atau teks berpemisah koma/titik-koma)
              </p>
            </div>
          </div>

          {/* Step 3: Data Preview & Mode */}
          {hasParsedData && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-xs">
                    Pratinjau Data yang Terdeteksi:
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {activeTab === 'STUDENTS' ? parsedStudents.length : parsedRombels.length} Baris Valid
                  </span>
                  {validationErrors.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                      {validationErrors.length} Peringatan
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="APPEND"
                      checked={importMode === 'APPEND'}
                      onChange={() => setImportMode('APPEND')}
                      className="text-[#0753A5]"
                    />
                    <span className="text-[11px] font-semibold text-slate-700">
                      Gabung Data (Append)
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="REPLACE"
                      checked={importMode === 'REPLACE'}
                      onChange={() => setImportMode('REPLACE')}
                      className="text-[#0753A5]"
                    />
                    <span className="text-[11px] font-semibold text-rose-700">
                      Gantikan Semua (Replace)
                    </span>
                  </label>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                {activeTab === 'STUDENTS' ? (
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2 px-3">NISN</th>
                        <th className="py-2 px-3">Nama Lengkap</th>
                        <th className="py-2 px-2">JK</th>
                        <th className="py-2 px-3">Rombel / Kelas</th>
                        <th className="py-2 px-3">Wali Murid</th>
                        <th className="py-2 px-3">No. HP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedStudents.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 font-mono font-semibold text-slate-800">
                            {s.nisn}
                          </td>
                          <td className="py-1.5 px-3 font-bold text-slate-900">{s.name}</td>
                          <td className="py-1.5 px-2 font-semibold">
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                s.gender === 'L'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {s.gender}
                            </span>
                          </td>
                          <td className="py-1.5 px-3 text-slate-600">{s.className}</td>
                          <td className="py-1.5 px-3 text-slate-600">{s.parentName}</td>
                          <td className="py-1.5 px-3 font-mono text-slate-500">
                            {s.parentPhone || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Kode Rombel</th>
                        <th className="py-2 px-3">Nama Rombel</th>
                        <th className="py-2 px-2">Fase</th>
                        <th className="py-2 px-3">Guru Wali Kelas</th>
                        <th className="py-2 px-2">Kapasitas</th>
                        <th className="py-2 px-3">Tahun Ajaran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRombels.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 font-mono font-semibold text-slate-800">
                            {r.code}
                          </td>
                          <td className="py-1.5 px-3 font-bold text-slate-900">{r.name}</td>
                          <td className="py-1.5 px-2 text-slate-600 font-semibold">{r.phase}</td>
                          <td className="py-1.5 px-3 text-slate-700">{r.teacher}</td>
                          <td className="py-1.5 px-2 font-mono text-slate-700">{r.capacity}</td>
                          <td className="py-1.5 px-3 text-slate-500">{r.academicYear}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {validationErrors.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Catatan Validasi Berkas:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px] text-amber-800">
                    {validationErrors.slice(0, 3).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {validationErrors.length > 3 && (
                      <li>Dan {validationErrors.length - 3} catatan lainnya...</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={!hasParsedData}
            onClick={handleExecuteImport}
            className="px-5 py-2.5 rounded-xl bg-[#0753A5] hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Simpan & Terapkan Impor (
              {activeTab === 'STUDENTS' ? parsedStudents.length : parsedRombels.length} Data)
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
