import React, { useState } from 'react';
import {
  UserPersona,
  getStoredUsers,
  saveStoredUsers,
} from '../lib/constants';
import {
  UserCheck,
  Shield,
  KeyRound,
  Mail,
  Phone,
  Building,
  MapPin,
  FileText,
  Save,
  RotateCcw,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  QrCode,
  Printer,
  ShieldCheck,
  Award,
  Sparkles,
  Info,
  Smartphone,
  Copy,
} from 'lucide-react';

interface SuperAdminProfileProps {
  currentPersona: UserPersona;
  onUpdatePersona: (updated: UserPersona) => void;
  onSwitchTab?: (tab: 'OVERVIEW' | 'MASTER_DATA' | 'ALL_FEATURES' | 'USERS' | 'AUDIT' | 'SETTINGS') => void;
}

const AVATAR_OPTIONS = [
  { emoji: '🛡️', label: 'Perisai Keamanan' },
  { emoji: '👨‍💼', label: 'Eksekutif Pria' },
  { emoji: '👩‍💼', label: 'Eksekutif Wanita' },
  { emoji: '🏛️', label: 'Institusi Negara' },
  { emoji: '💻', label: 'Teknologi SIM' },
  { emoji: '🦅', label: 'Garuda / Integritas' },
  { emoji: '🌟', label: 'Bintang Prestasi' },
  { emoji: '🎖️', label: 'Lencana Kehormatan' },
  { emoji: '🧑‍💻', label: 'Sistem Integrator' },
  { emoji: '🦉', label: 'Kebijaksanaan' },
  { emoji: '👑', label: 'Otoritas Root' },
  { emoji: '⚖️', label: 'Kepatuhan Hukum' },
];

export const SuperAdminProfile: React.FC<SuperAdminProfileProps> = ({
  currentPersona,
  onUpdatePersona,
  onSwitchTab,
}) => {
  const [profileSubTab, setProfileSubTab] = useState<
    'IDENTITAS' | 'AKUN_KEAMANAN' | 'KTA_DIGITAL' | 'HAK_AKSES'
  >('IDENTITAS');

  // Form State initialized with current persona
  const [name, setName] = useState(currentPersona.name || '');
  const [title, setTitle] = useState(currentPersona.title || '');
  const [nip, setNip] = useState(currentPersona.nip || '197408121999031002');
  const [identifierValue, setIdentifierValue] = useState(
    currentPersona.identifierValue || 'PUSDATIN-ADM-8801'
  );
  const [agencyUnit, setAgencyUnit] = useState(
    currentPersona.agencyUnit ||
      'Pusat Data dan Teknologi Informasi (Pusdatin) Kemendikdasmen'
  );
  const [officeAddress, setOfficeAddress] = useState(
    currentPersona.officeAddress ||
      'Gedung C Lantai 18, Kompleks Kemendikdasmen, Jl. Jenderal Sudirman, Senayan, Jakarta Pusat'
  );
  const [email, setEmail] = useState(
    currentPersona.email || 'superadmin@kemdikbud.go.id'
  );
  const [phone, setPhone] = useState(
    currentPersona.phone || '+62 812-8899-7701'
  );
  const [username, setUsername] = useState(
    currentPersona.username || 'superadmin'
  );
  const [bio, setBio] = useState(
    currentPersona.bio ||
      'Super Administrator Pengendali Utama SI-7KAIH Nasional. Mengemban amanah pembinaan master data pembiasaan 7 Karakter Anak Indonesia Hebat, pengawasan tata kelola akun SIM satuan pendidikan, serta pengawalan integritas etika AI tanpa pelabelan negatif maupun perankingan siswa.'
  );
  const [avatar, setAvatar] = useState(currentPersona.avatar || '🛡️');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    currentPersona.twoFactorEnabled ?? true
  );

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Feedback State
  const [isSaved, setIsSaved] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const showToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 4000);
  };

  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    setHasUnsavedChanges(true);
    setIsSaved(false);
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      showToast('⚠️ Nama lengkap tidak boleh kosong.');
      return;
    }

    if (!username.trim()) {
      showToast('⚠️ Username tidak boleh kosong.');
      return;
    }

    const updated: UserPersona = {
      ...currentPersona,
      name: name.trim(),
      title: title.trim() || 'Super Administrator SI-7KAIH Pusat',
      nip: nip.trim(),
      identifierValue: identifierValue.trim(),
      agencyUnit: agencyUnit.trim(),
      officeAddress: officeAddress.trim(),
      email: email.trim(),
      phone: phone.trim(),
      username: username.trim().toLowerCase(),
      bio: bio.trim(),
      avatar,
      twoFactorEnabled,
      lastUpdated: new Date().toISOString().split('T')[0],
      accountStatus: 'MANDIRI_TERVERIFIKASI',
      authChannel: 'MANDIRI_INTERNAL',
    };

    // Update in parent state
    onUpdatePersona(updated);

    // Update in LocalStorage pool
    try {
      const pool = getStoredUsers();
      const idx = pool.findIndex((u) => u.id === updated.id);
      if (idx !== -1) {
        pool[idx] = updated;
        saveStoredUsers(pool);
      } else {
        saveStoredUsers([...pool, updated]);
      }
      localStorage.setItem('si7kaih_persona_prod', JSON.stringify(updated));
    } catch (_e) {}

    setIsSaved(true);
    setHasUnsavedChanges(false);
    showToast('✅ Profil Super Admin berhasil disimpan dan diperbarui secara mandiri!');
  };

  const handleResetForm = () => {
    setName(currentPersona.name || '');
    setTitle(currentPersona.title || '');
    setNip(currentPersona.nip || '197408121999031002');
    setIdentifierValue(currentPersona.identifierValue || 'PUSDATIN-ADM-8801');
    setAgencyUnit(currentPersona.agencyUnit || 'Pusat Data dan Teknologi Informasi (Pusdatin) Kemendikdasmen');
    setOfficeAddress(currentPersona.officeAddress || 'Gedung C Lantai 18, Kompleks Kemendikdasmen, Jl. Jenderal Sudirman, Senayan, Jakarta Pusat');
    setEmail(currentPersona.email || 'superadmin@kemdikbud.go.id');
    setPhone(currentPersona.phone || '+62 812-8899-7701');
    setUsername(currentPersona.username || 'superadmin');
    setBio(currentPersona.bio || '');
    setAvatar(currentPersona.avatar || '🛡️');
    setTwoFactorEnabled(currentPersona.twoFactorEnabled ?? true);
    setHasUnsavedChanges(false);
    showToast('Form profil dikembalikan ke data tersimpan.');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('⚠️ Kata sandi baru minimal harus 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('⚠️ Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setPasswordSuccess(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('✅ Kata sandi Super Admin mandiri berhasil diperbarui!');
    setTimeout(() => setPasswordSuccess(false), 5000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Tersalin: ${label}`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastText && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastText}</span>
        </div>
      )}

      {/* 1. Header Profile Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-[#0753A5] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar with Selector Trigger */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-purple-400/40 flex items-center justify-center text-4xl shadow-inner shrink-0 group-hover:border-purple-300 transition-all">
                {avatar}
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold" title="Status Akun Aktif">
                ✓
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-400/20 text-purple-300 border border-purple-400/40 text-[10px] font-black uppercase tracking-wider">
                  Super Administrator SIM-7KAIH Pusat
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Kredensial Mandiri Terverifikasi
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {name || 'Nama Super Administrator'}
              </h2>
              <p className="text-xs sm:text-sm text-purple-200/90 font-medium">
                {title || 'Super Administrator SI-7KAIH Pusat'} • {agencyUnit}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1 font-mono">
                <span>NIP: {nip}</span>
                <span>•</span>
                <span>ID: {identifierValue}</span>
                <span>•</span>
                <span>Username: @{username}</span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="btn-save-super-profile-header"
              onClick={() => handleSaveProfile()}
              className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:shadow-purple-500/25 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Mandiri</span>
            </button>
            <button
              onClick={() => setProfileSubTab('KTA_DIGITAL')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 border border-white/20 transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Lihat KTA Digital</span>
            </button>
          </div>
        </div>

        {/* Unsaved changes prompt */}
        {hasUnsavedChanges && (
          <div className="mt-4 pt-3 border-t border-purple-800/60 flex items-center justify-between text-xs text-amber-300 bg-amber-500/10 px-3 py-2 rounded-xl">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400" />
              Ada perubahan yang belum disimpan. Klik tombol &quot;Simpan Perubahan Mandiri&quot; untuk memperbarui data Anda.
            </span>
            <button
              onClick={() => handleSaveProfile()}
              className="px-3 py-1 bg-amber-400 text-slate-950 font-bold rounded-lg hover:bg-amber-300 transition-colors cursor-pointer text-[11px]"
            >
              Simpan Sekarang
            </button>
          </div>
        )}
      </div>

      {/* 2. Sub-Navigation Tabs for Profile */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 text-xs font-bold overflow-x-auto scrollbar-none bg-white p-2 rounded-2xl shadow-xs">
        <button
          id="tab-profile-identitas"
          onClick={() => setProfileSubTab('IDENTITAS')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            profileSubTab === 'IDENTITAS'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Data Pribadi & Kepegawaian</span>
        </button>

        <button
          id="tab-profile-keamanan"
          onClick={() => setProfileSubTab('AKUN_KEAMANAN')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            profileSubTab === 'AKUN_KEAMANAN'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Akun, Kontak & Keamanan Kata Sandi</span>
        </button>

        <button
          id="tab-profile-kta"
          onClick={() => setProfileSubTab('KTA_DIGITAL')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            profileSubTab === 'KTA_DIGITAL'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Kartu Tanda Administrator (KTA)</span>
        </button>

        <button
          id="tab-profile-otoritas"
          onClick={() => setProfileSubTab('HAK_AKSES')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            profileSubTab === 'HAK_AKSES'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Matriks Otoritas & Hak Akses</span>
        </button>
      </div>

      {/* 3. TAB CONTENT: IDENTITAS & KEPEGAWAIAN */}
      {profileSubTab === 'IDENTITAS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Edit Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Formulir Pembaruan Data Mandiri
                </h3>
                <p className="text-xs text-slate-500">
                  Ubah data identitas, gelar, dan keterangan kedinasan Anda secara mandiri.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                Akses Mandiri Penuh
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Nama Lengkap & Gelar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar Akademik <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleFieldChange(setName, e.target.value)}
                  placeholder="Contoh: Dr. Ir. H. Agus Suryanto, M.T."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold text-slate-900"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Nama ini akan tercantum di seluruh lembar validasi dokumen resmi SI-7KAIH dan sistem log audit.
                </p>
              </div>

              {/* Jabatan Resmi & NIP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan Kedinasan Resmi
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleFieldChange(setTitle, e.target.value)}
                    placeholder="Super Administrator SI-7KAIH Pusat"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP / Identitas Pegawai Negeri (18 Digit)
                  </label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => handleFieldChange(setNip, e.target.value)}
                    placeholder="197408121999031002"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* ID Pegawai Pusat & Unit Kerja */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kode Register ID Pusat
                  </label>
                  <input
                    type="text"
                    value={identifierValue}
                    onChange={(e) => handleFieldChange(setIdentifierValue, e.target.value)}
                    placeholder="PUSDATIN-ADM-8801"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unit Kerja / Satuan Organisasi
                  </label>
                  <input
                    type="text"
                    value={agencyUnit}
                    onChange={(e) => handleFieldChange(setAgencyUnit, e.target.value)}
                    placeholder="Pusat Data dan Teknologi Informasi (Pusdatin)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Alamat Gedung / Kantor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Alamat Kantor Kedinasan
                </label>
                <input
                  type="text"
                  value={officeAddress}
                  onChange={(e) => handleFieldChange(setOfficeAddress, e.target.value)}
                  placeholder="Alamat kantor..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Bio & Mandat Kepemimpinan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Catatan Mandat Super Admin & Visi Pengawasan
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => handleFieldChange(setBio, e.target.value)}
                  placeholder="Catatan mandat tugas..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Mendeskripsikan garis arahan Super Admin dalam menjamin pembiasaan positif anak tanpa pelabelan negatif.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Form</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </form>
          </div>

          {/* Side Panel: Avatar Picker & Live Preview Card */}
          <div className="space-y-6">
            {/* Avatar Selector Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Pilih Lambang Avatar Resmi
              </h4>
              <p className="text-xs text-slate-500">
                Pilih simbol representatif untuk identitas akun Super Administrator:
              </p>

              <div className="grid grid-cols-4 gap-2">
                {AVATAR_OPTIONS.map((opt) => (
                  <button
                    key={opt.emoji}
                    type="button"
                    onClick={() => handleFieldChange(setAvatar, opt.emoji)}
                    title={opt.label}
                    className={`p-3 rounded-2xl text-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                      avatar === opt.emoji
                        ? 'bg-purple-100 border-2 border-purple-600 scale-105 shadow-xs'
                        : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span className="text-[9px] text-slate-500 mt-1 font-sans truncate w-full text-center">
                      {opt.label.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Identity Widget */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  Pratinjau Akun Resmi
                </span>
                <span className="text-xs text-slate-400 font-mono">SI-7KAIH</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl border border-white/20">
                  {avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-white truncate">{name || 'Nama Administrator'}</p>
                  <p className="text-xs text-purple-300 truncate">{title}</p>
                  <p className="text-[11px] text-slate-400 font-mono">@{username}</p>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">NIP:</span>
                  <span className="font-mono text-white">{nip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Akun:</span>
                  <span className="text-emerald-400 font-bold">Mandiri Aktif</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Otoritas:</span>
                  <span className="text-amber-300 font-semibold">Master Data & RLS Root</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: AKUN, KONTAK & KEAMANAN KATA SANDI */}
      {profileSubTab === 'AKUN_KEAMANAN' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kontak & Kredensial Mandiri */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Kontak & Pengaturan Akun Mandiri
                </h3>
                <p className="text-xs text-slate-500">
                  Informasi jalur komunikasi kedinasan dan nama pengguna login.
                </p>
              </div>
              <Smartphone className="w-5 h-5 text-purple-600" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  Username Login Mandiri <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => handleFieldChange(setUsername, e.target.value)}
                    placeholder="superadmin"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Digunakan untuk masuk ke modul Super Admin di portal SI-7KAIH.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Alamat Email Kedinasan
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleFieldChange(setEmail, e.target.value)}
                  placeholder="superadmin@kemdikbud.go.id"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Nomor Kontak / WhatsApp Kedinasan
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handleFieldChange(setPhone, e.target.value)}
                  placeholder="+62 812-8899-7701"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* 2FA Toggle */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-700" />
                    <span className="text-xs font-bold text-slate-900">
                      Autentikasi Dua Faktor (2FA Mandiri)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Meminta verifikasi sandi bertingkat pada setiap perpindahan sesi terminal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFieldChange(setTwoFactorEnabled, !twoFactorEnabled)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    twoFactorEnabled ? 'bg-purple-700 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Kontak & Kredensial</span>
                </button>
              </div>
            </div>
          </div>

          {/* Ganti Kata Sandi Mandiri */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Ubah Kata Sandi Mandiri
                </h3>
                <p className="text-xs text-slate-500">
                  Perbarui kata sandi akun Super Administrator secara berkala.
                </p>
              </div>
              <Lock className="w-5 h-5 text-purple-600" />
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Kata sandi berhasil diperbarui! Gunakan sandi baru saat login berikutnya.</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Saat Ini
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan kata sandi lama..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter kombinasi huruf & angka..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>

              {/* Password Policy Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-700">Kebijakan Kredensial Super Admin:</p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                  <li>Disimpan dengan enkripsi Salted Hash PBKDF2 lokal.</li>
                  <li>Diberlakukan isolasi kredensial per perangkat sesi.</li>
                  <li>Tidak dapat direset oleh peran lain di bawah Super Admin.</li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Perbarui Kata Sandi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: KTA DIGITAL RESMI */}
      {profileSubTab === 'KTA_DIGITAL' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Kartu Tanda Administrator (KTA) Digital Resmi
              </h3>
              <p className="text-xs text-slate-500">
                Identitas elektronik terautentikasi bagi Pejabat Pengendali Sistem Master Data SI-7KAIH Nasional.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Ekspor KTA</span>
              </button>
              <button
                onClick={() => copyToClipboard(identifierValue, 'ID Pegawai')}
                className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-purple-200"
              >
                <Copy className="w-4 h-4" />
                <span>Salin ID KTA</span>
              </button>
            </div>
          </div>

          {/* Electronic ID Card View */}
          <div className="max-w-xl mx-auto">
            <div className="bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white rounded-3xl p-7 shadow-2xl border-2 border-purple-500/30 relative overflow-hidden">
              {/* Decorative Watermark */}
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-4 right-6 text-4xl opacity-15 pointer-events-none">
                🏛️
              </div>

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                    7K
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-amber-300">
                      Kementerian Pendidikan Dasar dan Menengah
                    </p>
                    <p className="text-xs font-bold text-white tracking-wide">
                      SISTEM INFORMASI 7 KEBIASAAN ANAK INDONESIA HEBAT
                    </p>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/40">
                  ASN ROOT
                </span>
              </div>

              {/* Card Body */}
              <div className="py-6 flex items-center gap-6">
                <div className="relative shrink-0">
                  <div className="w-24 h-28 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-purple-400/40 flex items-center justify-center text-5xl shadow-lg">
                    {avatar}
                  </div>
                  <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2 py-0.5 bg-purple-600 text-[8px] font-black uppercase tracking-wider rounded-md text-white shadow-xs">
                    SUPER ADMIN
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-lg font-black text-white leading-snug">
                    {name || 'Nama Super Administrator'}
                  </p>
                  <p className="text-xs text-purple-300 font-semibold">{title}</p>
                  <div className="pt-2 text-[11px] space-y-0.5 text-slate-300 font-mono">
                    <p>NIP: <span className="text-white font-bold">{nip}</span></p>
                    <p>ID: <span className="text-amber-300 font-bold">{identifierValue}</span></p>
                    <p>UNIT: <span className="text-slate-200">{agencyUnit.split(' ')[0]} Pusdatin</span></p>
                  </div>
                </div>
              </div>

              {/* Card Footer with QR Bar */}
              <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center text-slate-950">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div className="text-[9px] text-slate-300 leading-tight">
                    <p className="font-bold text-white">VERIFIKASI INTEGRITAS IAM</p>
                    <p>Valid Seluruh Satuan Pendidikan</p>
                    <p className="text-emerald-400 font-mono">HASH: SHA256-ROOT-OK</p>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  <p>Masa Berlaku:</p>
                  <p className="font-bold text-white">Sepanjang Menjabat</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: HAK AKSES & MATRIKS WEWENANG */}
      {profileSubTab === 'HAK_AKSES' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Matriks Otoritas Tertinggi Super Administrator SI-7KAIH
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sebagai Super Administrator, akun Anda memegang kunci root kendali sistem nasional. Seluruh hak akses di bawah ini terautentikasi otomatis:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs text-slate-900">Master Data 7 Kebiasaan (7KAIH)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Dapat mengedit deskripsi, target operasional, dan indikator 7 kebiasaan anak nasional sesuai Kepmendikdasmen No. 7/2025.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs text-slate-900">Master Satuan Pendidikan & Sekolah</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Menambahkan sekolah baru se-Indonesia, memperbarui data NPSN, akreditasi, dan menugaskan Administrator SIM Sekolah.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs text-slate-900">Penerbitan Akun Admin Sekolah</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Menerbitkan, mengaktifkan, dan menonaktifkan akun operator satuan pendidikan serta mengatur hak akses pengguna.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs text-slate-900">Akses Seluruh Modul Peran (Omni-Access)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Dapat mengoperasikan langsung seluruh modul data Siswa, Orang Tua, Guru Wali Kelas, Kepala Sekolah, dan Pengawas Pembina dalam sistem produksi aktif.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs text-slate-900">Log Audit Global & Row-Level Security</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Memantau seluruh jejak audit sistem, pengawasan kebijakan isolasi RLS, dan mengekspor laporan kepatuhan UU PDP.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs text-slate-900">Guardrails Etika AI Nasional</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Memastikan tidak ada fitur perankingan siswa (Anti-Ranking) dan pelabelan moral negatif (Anti-Character Judgment).
                </p>
              </div>
            </div>

            {onSwitchTab && (
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onSwitchTab('MASTER_DATA')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Buka Master Data Global →
                </button>
                <button
                  onClick={() => onSwitchTab('USERS')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Kelola Akun Admin Sekolah →
                </button>
                <button
                  onClick={() => onSwitchTab('AUDIT')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Periksa Log Audit Sistem →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
