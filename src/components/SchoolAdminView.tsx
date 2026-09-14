// ============================================================================
// SI-7KAIH AI - School Admin & System Audit Component
// Audit logs, master data overview, multi-provider AI health check
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Settings,
  Database,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  RefreshCw,
  Download,
  Filter,
  Building2,
  Plus,
  Calendar,
  BookOpen,
  UserPlus,
  KeyRound,
  Search,
  Trash2,
  Edit3,
  UserCheck,
  AlertCircle,
  FileText,
  Key,
  FileSpreadsheet,
  Upload,
  Layers,
  GraduationCap,
  Phone,
  Heart,
} from 'lucide-react';
import { AuditLog, UserRole } from '../../packages/types/src/index';
import { UserPersona, getStoredUsers, saveStoredUsers } from '../lib/constants';
import { SchoolMaster, getStoredSchools } from '../lib/schoolMasterData';
import {
  Student,
  Rombel,
  getStoredStudents,
  saveStoredStudents,
  getStoredRombels,
  saveStoredRombels,
  downloadStudentTemplateCsv,
  downloadRombelTemplateCsv,
} from '../lib/studentData';
import { DataImportModal } from './DataImportModal';
import { ConfirmDeleteModal, DeleteModalState } from './ConfirmDeleteModal';
import { UserAvatar, ROLE_DEFAULT_AVATARS } from './UserAvatar';

interface SchoolAdminViewProps {
  isSuperAdmin?: boolean;
  activeNavTab?: string;
  currentPersona?: UserPersona;
}

export const SchoolAdminView: React.FC<SchoolAdminViewProps> = ({
  isSuperAdmin = false,
  activeNavTab,
  currentPersona,
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [activeSubTab, setActiveSubTab] = useState<'DATA' | 'PROGRAMS' | 'USERS' | 'AUDIT' | 'SETTINGS'>('DATA');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Standalone user accounts management
  const [userAccounts, setUserAccounts] = useState<UserPersona[]>(() => getStoredUsers());

  // Real-time synchronization of users from LocalStorage / other view mutations
  useEffect(() => {
    const syncUsers = () => {
      const freshUsers = getStoredUsers();
      setUserAccounts(freshUsers);
    };
    syncUsers();

    const syncMaster = () => {
      setStudents(getStoredStudents());
      setRombels(getStoredRombels());
      setSchools(getStoredSchools());
    };

    window.addEventListener('storage', syncUsers);
    window.addEventListener('si7kaih_users_updated', syncUsers);
    window.addEventListener('si7kaih_schools_updated', syncMaster);
    window.addEventListener('si7kaih_students_updated', syncMaster);
    window.addEventListener('si7kaih_rombels_updated', syncMaster);
    window.addEventListener('focus', syncUsers);

    return () => {
      window.removeEventListener('storage', syncUsers);
      window.removeEventListener('si7kaih_users_updated', syncUsers);
      window.removeEventListener('si7kaih_schools_updated', syncMaster);
      window.removeEventListener('si7kaih_students_updated', syncMaster);
      window.removeEventListener('si7kaih_rombels_updated', syncMaster);
      window.removeEventListener('focus', syncUsers);
    };
  }, [activeNavTab, activeSubTab]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Edit user modal state
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserPersona | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserClassName, setEditUserClassName] = useState('');

  // Delete & Action Modal State
  const [deleteModalState, setDeleteModalState] = useState<DeleteModalState>({
    isOpen: false,
    type: 'STUDENT',
    title: '',
    itemName: '',
  });

  // Bulk Selection States
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [editUserIdentifierValue, setEditUserIdentifierValue] = useState('');
  const [editUserStatus, setEditUserStatus] = useState<'MANDIRI_AKTIF' | 'MANDIRI_NONAKTIF'>('MANDIRI_AKTIF');

  // Parent specific edit states
  const [editUserChildName, setEditUserChildName] = useState('');
  const [editUserChildNisn, setEditUserChildNisn] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');

  // Parent specific new user states
  const [newUserChildName, setNewUserChildName] = useState('');
  const [newUserChildNisn, setNewUserChildNisn] = useState('');
  const [newUserChildId, setNewUserChildId] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserParentRelation, setNewUserParentRelation] = useState<'Ayah' | 'Ibu' | 'Wali Murid'>('Wali Murid');

  // Batch create parent accounts modal
  const [isBatchParentModalOpen, setIsBatchParentModalOpen] = useState(false);

  // Master Students & Rombel State (100% Mandiri Operator, tanpa Dapodik)
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());
  const [rombels, setRombels] = useState<Rombel[]>(() => getStoredRombels());

  // School Authority context: Identify the specific school for the current School Admin
  const [schools, setSchools] = useState<SchoolMaster[]>(() => getStoredSchools());
  const currentSchoolId = currentPersona?.schoolId || 'sch-default';
  const currentSchoolName = currentPersona?.schoolName || 'Satuan Pendidikan';
  const currentSchoolMaster = schools.find(
    (s) =>
      s.id === currentSchoolId ||
      s.name.trim().toLowerCase() === currentSchoolName.trim().toLowerCase()
  ) || schools[0] || getStoredSchools()[0];
  const currentSchoolNpsn = currentSchoolMaster?.npsn || '-';

  // Strict Scoping Filter: School Admin may only access users of their own school
  const isUserOfSchool = (user: UserPersona): boolean => {
    // Super admin and supervisor are national/regional roles, not managed by school admin
    if (user.role === 'SUPER_ADMIN' || user.role === 'SUPERVISOR') {
      return false;
    }

    // 1. Direct or normalized school ID match
    if (user.schoolId && currentSchoolId) {
      if (user.schoolId.toLowerCase() === currentSchoolId.toLowerCase()) return true;
      if (
        (user.schoolId === 's1' || user.schoolId.startsWith('s1000')) &&
        (currentSchoolId === 's1' || currentSchoolId.startsWith('s1000'))
      ) {
        return true;
      }
      if (
        (user.schoolId === 's2' || user.schoolId.startsWith('s2000')) &&
        (currentSchoolId === 's2' || currentSchoolId.startsWith('s2000'))
      ) {
        return true;
      }
      if (
        user.schoolId.includes('smp-01') && currentSchoolId.includes('smp-01')
      ) {
        return true;
      }
    }

    // 2. Direct school name match (case-insensitive)
    if (user.schoolName && currentSchoolName) {
      if (user.schoolName.trim().toLowerCase() === currentSchoolName.trim().toLowerCase()) {
        return true;
      }
    }

    // 3. ManagedBy string fallback if it mentions the school
    if (user.managedBy && user.managedBy.toLowerCase().includes(currentSchoolName.toLowerCase())) {
      return true;
    }

    // 4. For parent users, link to this school if their child is enrolled in this school
    if (user.role === 'PARENT') {
      if (user.childNisn && students.some((s) => s.nisn === user.childNisn)) {
        return true;
      }
      if (user.childName && students.some((s) => s.name.toLowerCase() === user.childName?.toLowerCase())) {
        return true;
      }
    }

    return false;
  };

  // Scoped list of users strictly within this school
  const schoolScopedUsers = useMemo(() => {
    return userAccounts.filter(isUserOfSchool);
  }, [userAccounts, currentSchoolId, currentSchoolName, students]);

  // Sync user accounts with LocalStorage while preserving other schools' accounts
  const updateSchoolUsers = (updatedSchoolUsers: UserPersona[]) => {
    const allUsers = getStoredUsers();
    // Keep users from other schools untouched
    const otherSchoolUsers = allUsers.filter((u) => !isUserOfSchool(u));
    const mergedPool = [...otherSchoolUsers, ...updatedSchoolUsers];
    setUserAccounts(mergedPool);
    saveStoredUsers(mergedPool);
  };

  // Re-read storage if current persona's school changes
  useEffect(() => {
    setUserAccounts(getStoredUsers());
  }, [currentPersona?.schoolId, currentPersona?.schoolName]);

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('STUDENT');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserIdentifierLabel, setNewUserIdentifierLabel] = useState('NISN');
  const [newUserIdentifierValue, setNewUserIdentifierValue] = useState('');
  const [newUserClassName, setNewUserClassName] = useState('Kelas 7-A');
  const [newUserPassword, setNewUserPassword] = useState('123456');
  const [selectedExistingPerson, setSelectedExistingPerson] = useState('');

  // Sync with Header navigation tab
  useEffect(() => {
    if (!activeNavTab) return;
    if (activeNavTab === 'dashboard') {
      setActiveSubTab('DATA');
    } else if (activeNavTab === 'programs') {
      setActiveSubTab('PROGRAMS');
    } else if (activeNavTab === 'users') {
      setActiveSubTab('USERS');
    } else if (activeNavTab === 'audit-logs') {
      setActiveSubTab('AUDIT');
    } else if (activeNavTab === 'system-settings') {
      setActiveSubTab('SETTINGS');
    }
  }, [activeNavTab]);

  // School programs state with persistence
  const [schoolPrograms, setSchoolPrograms] = useState(() => {
    try {
      const saved = localStorage.getItem('si7kaih_school_programs_prod');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_e) {}
    return [
      {
        id: 'prg-01',
        title: 'Jumat Berkah Sarapan Bergizi Bersama',
        habitTarget: 'Makan Sehat & Bergizi',
        frequency: 'Setiap Jumat Pagi (06:45 - 07:15)',
        status: 'AKTIF',
        leadTeacher: 'Drs. H. Mulyono, M.M.',
        participants: 'Semua Rombel (Kelas 7 s.d. 9)',
      },
      {
        id: 'prg-02',
        title: 'Sabtu Kebugaran & Senam Remaja Hebat',
        habitTarget: 'Berolahraga',
        frequency: 'Setiap Sabtu Pagi (07:00 - 07:45)',
        status: 'AKTIF',
        leadTeacher: 'Pak Hendra Wijaya, S.Pd. (Guru Penjas)',
        participants: 'Semua Siswa SMP & Dewan Guru',
      },
      {
        id: 'prg-03',
        title: 'Pojok Literasi Digital & Riset Remaja 15 Menit',
        habitTarget: 'Gemar Belajar',
        frequency: 'Senin - Kamis (Sebelum Pelajaran Pertama)',
        status: 'AKTIF',
        leadTeacher: 'Ibu Siti Aminah, S.Pd. (Pustakawan)',
        participants: 'Fase D (Kelas 7, 8, 9)',
      },
      {
        id: 'prg-04',
        title: 'Tantangan 21 Hari Bangun Pagi Mandiri',
        habitTarget: 'Bangun Pagi',
        frequency: 'Program Kolaborasi Rumah & Sekolah (Bulan Berjalan)',
        status: 'AKTIF',
        leadTeacher: 'Pak Ahmad Fauzi, S.Pd.',
        participants: 'Kolaborasi Wali Murid Kelas 7-A',
      },
    ];
  });

  const updateSchoolPrograms = (updated: typeof schoolPrograms) => {
    setSchoolPrograms(updated);
    try {
      localStorage.setItem('si7kaih_school_programs_prod', JSON.stringify(updated));
    } catch (_e) {}
  };

  // Master Students & Rombel State (100% Mandiri Operator, tanpa Dapodik)
  const [dataSubView, setDataSubView] = useState<'STUDENTS' | 'ROMBELS'>('STUDENTS');

  // Search & Filter
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('ALL');
  const [studentStatusFilter, setStudentStatusFilter] = useState('ALL');
  const [rombelSearchQuery, setRombelSearchQuery] = useState('');
  const [rombelPhaseFilter, setRombelPhaseFilter] = useState('ALL');

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importModalTab, setImportModalTab] = useState<'STUDENTS' | 'ROMBELS'>('STUDENTS');

  // Add / Edit Student Modal State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentFormNisn, setStudentFormNisn] = useState('');
  const [studentFormName, setStudentFormName] = useState('');
  const [studentFormGender, setStudentFormGender] = useState<'L' | 'P'>('L');
  const [studentFormClass, setStudentFormClass] = useState('');
  const [studentFormBirthDate, setStudentFormBirthDate] = useState('');
  const [studentFormParentName, setStudentFormParentName] = useState('');
  const [studentFormParentPhone, setStudentFormParentPhone] = useState('');
  const [studentFormStatus, setStudentFormStatus] = useState<'AKTIF' | 'MUTASI' | 'LULUS'>('AKTIF');

  // Add / Edit Rombel Modal State
  const [isRombelModalOpen, setIsRombelModalOpen] = useState(false);
  const [editingRombel, setEditingRombel] = useState<Rombel | null>(null);
  const [rombelFormCode, setRombelFormCode] = useState('');
  const [rombelFormName, setRombelFormName] = useState('');
  const [rombelFormGrade, setRombelFormGrade] = useState(7);
  const [rombelFormPhase, setRombelFormPhase] = useState('Fase D');
  const [rombelFormTeacher, setRombelFormTeacher] = useState('');
  const [rombelFormTeacherNip, setRombelFormTeacherNip] = useState('');
  const [rombelFormCapacity, setRombelFormCapacity] = useState(32);
  const [rombelFormYear, setRombelFormYear] = useState('2025/2026 Ganjil');
  const [rombelFormStatus, setRombelFormStatus] = useState<'AKTIF' | 'NONAKTIF'>('AKTIF');

  // Sync to LocalStorage
  const updateStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    saveStoredStudents(newStudents);
  };

  const updateRombels = (newRombels: Rombel[]) => {
    setRombels(newRombels);
    saveStoredRombels(newRombels);
  };

  // Import Handlers
  const handleImportStudents = (imported: Student[], mode: 'APPEND' | 'REPLACE') => {
    let updated: Student[];
    if (mode === 'REPLACE') {
      updated = imported;
    } else {
      const map = new Map<string, Student>();
      students.forEach((s) => map.set(s.nisn, s));
      imported.forEach((s) => map.set(s.nisn, s));
      updated = Array.from(map.values());
    }
    updateStudents(updated);
    showToast(`Berhasil mengimpor ${imported.length} data peserta didik secara mandiri!`);
  };

  const handleImportRombels = (imported: Rombel[], mode: 'APPEND' | 'REPLACE') => {
    let updated: Rombel[];
    if (mode === 'REPLACE') {
      updated = imported;
    } else {
      const map = new Map<string, Rombel>();
      rombels.forEach((r) => map.set(r.name, r));
      imported.forEach((r) => map.set(r.name, r));
      updated = Array.from(map.values());
    }
    updateRombels(updated);
    showToast(`Berhasil mengimpor ${imported.length} rombongan belajar secara mandiri!`);
  };

  // Derived lists of existing teachers and students for auto-completing account creation
  const availableTeachers = useMemo(() => {
    const map = new Map<string, { name: string; nip?: string; className?: string }>();
    rombels.forEach((r) => {
      if (r.teacher && r.teacher.trim()) {
        map.set(r.teacher.trim(), {
          name: r.teacher.trim(),
          nip: r.teacherNip || '',
          className: r.name,
        });
      }
    });
    userAccounts
      .filter((u) => u.role === 'TEACHER' && isUserOfSchool(u))
      .forEach((u) => {
        if (!map.has(u.name)) {
          map.set(u.name, {
            name: u.name,
            nip: u.identifierValue || u.nip || '',
            className: u.className || '',
          });
        }
      });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [rombels, userAccounts, isUserOfSchool]);

  const availableStudents = useMemo(() => {
    return [...students].sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  // Students who do not currently have a linked parent user
  const studentsWithoutParent = useMemo(() => {
    const parentChildNisns = new Set(
      schoolScopedUsers
        .filter((u) => u.role === 'PARENT' && u.childNisn)
        .map((u) => u.childNisn)
    );
    const parentUsernames = new Set(
      schoolScopedUsers
        .filter((u) => u.role === 'PARENT')
        .map((u) => u.username)
    );
    return students.filter(
      (s) => !parentChildNisns.has(s.nisn) && !parentUsernames.has(`wali.${s.nisn}`)
    );
  }, [students, schoolScopedUsers]);

  const handleSelectExistingPerson = (val: string) => {
    setSelectedExistingPerson(val);
    if (!val || val === 'MANUAL') {
      return;
    }
    if (val.startsWith('TEACHER:')) {
      const teacherName = val.replace('TEACHER:', '');
      const found = availableTeachers.find((t) => t.name === teacherName);
      if (found) {
        setNewUserName(found.name);
        setNewUserRole('TEACHER');
        setNewUserIdentifierLabel('NIP');
        setNewUserIdentifierValue(found.nip || '');
        setNewUserClassName(found.className || '');
        const cleanName = found.name
          .toLowerCase()
          .replace(/^(pak|ibu|bapak|dr|drs|dra|h|hj)\.?\s+/gi, '')
          .split(',')[0]
          .trim()
          .replace(/[^a-z0-9]/g, '.');
        setNewUserUsername(cleanName || 'guru.' + Date.now().toString().slice(-4));
      }
    } else if (val.startsWith('STUDENT:')) {
      const nisn = val.replace('STUDENT:', '');
      const found = availableStudents.find((s) => s.nisn === nisn);
      if (found) {
        setNewUserName(found.name);
        setNewUserRole('STUDENT');
        setNewUserIdentifierLabel('NISN');
        setNewUserIdentifierValue(found.nisn);
        setNewUserClassName(found.className);
        const cleanName = found.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '.');
        setNewUserUsername(found.nisn || cleanName);
        setNewUserChildName('');
        setNewUserChildNisn('');
        setNewUserChildId('');
        setNewUserPhone('');
      }
    } else if (val.startsWith('PARENT:')) {
      const nisn = val.replace('PARENT:', '');
      const found = availableStudents.find((s) => s.nisn === nisn);
      if (found) {
        setNewUserRole('PARENT');
        setNewUserChildName(found.name);
        setNewUserChildNisn(found.nisn);
        setNewUserChildId(found.id);
        setNewUserClassName(found.className);
        const parentName =
          found.parentName && found.parentName !== '-'
            ? found.parentName
            : `Wali dari ${found.name}`;
        setNewUserName(parentName);
        setNewUserPhone(found.parentPhone || '');
        setNewUserIdentifierLabel('No. WhatsApp / NIK');
        setNewUserIdentifierValue(found.parentPhone || found.nisn);
        setNewUserUsername(`wali.${found.nisn}`);
      }
    }
  };

  const handleOpenAddUser = () => {
    setSelectedExistingPerson('');
    setNewUserName('');
    setNewUserRole('STUDENT');
    setNewUserUsername('');
    setNewUserIdentifierLabel('NISN');
    setNewUserIdentifierValue('');
    setNewUserClassName('');
    setNewUserPassword('123456');
    setNewUserChildName('');
    setNewUserChildNisn('');
    setNewUserChildId('');
    setNewUserPhone('');
    setNewUserParentRelation('Wali Murid');
    setIsAddUserModalOpen(true);
  };

  const handleOpenAddParent = (targetStudent?: Student) => {
    setNewUserRole('PARENT');
    setNewUserIdentifierLabel('No. WhatsApp / NIK');
    setNewUserPassword('123456');
    setNewUserParentRelation('Wali Murid');

    if (targetStudent) {
      setSelectedExistingPerson(`PARENT:${targetStudent.nisn}`);
      setNewUserChildName(targetStudent.name);
      setNewUserChildNisn(targetStudent.nisn);
      setNewUserChildId(targetStudent.id);
      setNewUserClassName(targetStudent.className);
      const parentName =
        targetStudent.parentName && targetStudent.parentName !== '-'
          ? targetStudent.parentName
          : `Wali dari ${targetStudent.name}`;
      setNewUserName(parentName);
      setNewUserPhone(targetStudent.parentPhone || '');
      setNewUserIdentifierValue(targetStudent.parentPhone || targetStudent.nisn);
      setNewUserUsername(`wali.${targetStudent.nisn}`);
    } else {
      setSelectedExistingPerson('');
      setNewUserChildName('');
      setNewUserChildNisn('');
      setNewUserChildId('');
      setNewUserClassName('');
      setNewUserName('');
      setNewUserPhone('');
      setNewUserIdentifierValue('');
      setNewUserUsername('');
    }
    setIsAddUserModalOpen(true);
  };

  const handleExecuteBatchCreateParents = () => {
    if (studentsWithoutParent.length === 0) {
      showToast('Semua peserta didik sudah memiliki akun orang tua!');
      return;
    }

    const schoolDomain = currentSchoolName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    const newAccounts: UserPersona[] = studentsWithoutParent.map((s, idx) => {
      const pName =
        s.parentName && s.parentName.trim() !== '-'
          ? s.parentName.trim()
          : `Wali dari ${s.name}`;
      return {
        id: `usr-parent-${Date.now()}-${idx}-${s.nisn}`,
        name: pName,
        role: 'PARENT',
        title: `Wali Murid dari ${s.name}`,
        schoolId: currentSchoolId,
        schoolName: currentSchoolName,
        email: `wali.${s.nisn}@${schoolDomain || 'keluarga'}.sch.id`,
        username: `wali.${s.nisn}`,
        passwordHash: '123456',
        avatar: '👨‍👩‍👧',
        authChannel: 'MANDIRI_INTERNAL',
        accountStatus: 'MANDIRI_AKTIF',
        authProviderLabel: `Autentikasi Mandiri ${currentSchoolName}`,
        securityLevel: 'Orang Tua / Wali Murid',
        identifierLabel: 'No. WhatsApp / NIK',
        identifierValue: s.parentPhone || s.nisn,
        className: s.className,
        managedBy: `Administrator Mandiri ${currentSchoolName}`,
        childName: s.name,
        childId: s.id,
        childNisn: s.nisn,
        phone: s.parentPhone || undefined,
        createdDate: new Date().toISOString().slice(0, 10),
      };
    });

    updateSchoolUsers([...schoolScopedUsers, ...newAccounts]);
    setIsBatchParentModalOpen(false);
    showToast(
      `Berhasil menerbitkan ${newAccounts.length} akun orang tua baru secara mandiri untuk ${currentSchoolName}!`
    );
  };

  // Student Form Actions
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentFormNisn('');
    setStudentFormName('');
    setStudentFormGender('L');
    setStudentFormClass('');
    setStudentFormBirthDate('');
    setStudentFormParentName('');
    setStudentFormParentPhone('');
    setStudentFormStatus('AKTIF');
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (s: Student) => {
    setEditingStudent(s);
    setStudentFormNisn(s.nisn);
    setStudentFormName(s.name);
    setStudentFormGender(s.gender);
    setStudentFormClass(s.className);
    setStudentFormBirthDate(s.birthDate || '');
    setStudentFormParentName(s.parentName);
    setStudentFormParentPhone(s.parentPhone || '');
    setStudentFormStatus(s.status);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFormName.trim() || !studentFormNisn.trim()) {
      showToast('Nama dan NISN siswa wajib diisi!');
      return;
    }

    if (editingStudent) {
      const updated = students.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              nisn: studentFormNisn.trim(),
              name: studentFormName.trim(),
              gender: studentFormGender,
              className: studentFormClass,
              birthDate: studentFormBirthDate,
              parentName: studentFormParentName.trim() || 'Orang Tua / Wali',
              parentPhone: studentFormParentPhone.trim(),
              status: studentFormStatus,
            }
          : s
      );
      updateStudents(updated);
      showToast('Data peserta didik berhasil diperbarui!');
    } else {
      const newStudent: Student = {
        id: `std-man-${Date.now()}`,
        nisn: studentFormNisn.trim(),
        name: studentFormName.trim(),
        gender: studentFormGender,
        className: studentFormClass,
        birthDate: studentFormBirthDate,
        parentName: studentFormParentName.trim() || 'Orang Tua / Wali',
        parentPhone: studentFormParentPhone.trim(),
        status: studentFormStatus,
        source: 'INPUT_MANUAL',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      updateStudents([newStudent, ...students]);
      showToast(`Peserta didik ${newStudent.name} berhasil ditambahkan!`);
    }
    setIsStudentModalOpen(false);
  };

  // Open Modal Confirmation Handlers for School Admin
  const handleOpenDeleteStudent = (student: Student) => {
    setDeleteModalState({
      isOpen: true,
      type: 'STUDENT',
      title: 'Hapus Peserta Didik',
      itemName: student.name,
      itemIdentifier: `NISN: ${student.nisn} • ${student.className} • Wali: ${student.parentName}`,
      warningMessage: `Data peserta didik "${student.name}" akan dihapus dari data mandiri ${currentSchoolName}.`,
      data: student,
    });
  };

  const handleOpenDeleteRombel = (rombel: Rombel) => {
    setDeleteModalState({
      isOpen: true,
      type: 'ROMBEL',
      title: 'Hapus Rombongan Belajar',
      itemName: rombel.name,
      itemIdentifier: `Kode: ${rombel.code} • Tingkat ${rombel.grade} • Wali: ${rombel.teacher}`,
      warningMessage: `Rombongan belajar "${rombel.name}" akan dihapus. Peserta didik yang terdaftar pada kelas ini tetap tersimpan.`,
      data: rombel,
    });
  };

  const handleOpenDeleteUser = (user: UserPersona) => {
    if (user.id === currentPersona?.id) {
      showToast('Tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan!');
      return;
    }
    setDeleteModalState({
      isOpen: true,
      type: 'USER',
      title: 'Hapus Akun Pengguna Mandiri',
      itemName: user.name,
      itemIdentifier: `@${user.username} • Peran: ${user.role} • ${user.className || currentSchoolName}`,
      warningMessage: `Akun mandiri "${user.name}" (@${user.username}) akan dihapus dari ${currentSchoolName} dan tidak dapat lagi masuk ke sistem.`,
      data: user,
    });
  };

  const handleOpenDeleteProgram = (program: { id: string; title: string; habitTarget: string; leadTeacher: string }) => {
    setDeleteModalState({
      isOpen: true,
      type: 'PROGRAM',
      title: 'Hapus Program Pembiasaan',
      itemName: program.title,
      itemIdentifier: `Target: ${program.habitTarget} • PJ: ${program.leadTeacher}`,
      warningMessage: `Program pembiasaan "${program.title}" akan dihapus dari daftar kegiatan pembiasaan ${currentSchoolName}.`,
      data: program,
    });
  };

  const handleOpenDeleteSelectedStudents = () => {
    if (selectedStudentIds.size === 0) return;
    setDeleteModalState({
      isOpen: true,
      type: 'BULK_STUDENT',
      title: `Hapus ${selectedStudentIds.size} Peserta Didik Terpilih`,
      itemName: `${selectedStudentIds.size} Peserta Didik terpilih`,
      itemIdentifier: 'Penghapusan massal data siswa sekolah',
      warningMessage: `Semua ${selectedStudentIds.size} data peserta didik yang dipilih akan dihapus permanen dari ${currentSchoolName}.`,
    });
  };

  const handleOpenDeleteSelectedUsers = () => {
    if (selectedUserIds.size === 0) return;
    setDeleteModalState({
      isOpen: true,
      type: 'BULK_USER',
      title: `Hapus ${selectedUserIds.size} Akun Pengguna Terpilih`,
      itemName: `${selectedUserIds.size} Akun Pengguna terpilih`,
      itemIdentifier: 'Penghapusan massal akun mandiri sekolah',
      warningMessage: `Semua ${selectedUserIds.size} akun pengguna yang dipilih akan dihapus permanen dari ${currentSchoolName}.`,
    });
  };

  const handleOpenClearLogs = () => {
    setDeleteModalState({
      isOpen: true,
      type: 'AUDIT_LOGS',
      title: 'Bersihkan Log Audit Sekolah',
      itemName: 'Seluruh Catatan Log Aktivitas Sekolah',
      itemIdentifier: `${logs.length} catatan audit tercatat`,
      warningMessage: 'Semua riwayat catatan audit akan dibersihkan dari tampilan sekolah.',
    });
  };

  // Direct alias wrappers
  const handleDeleteStudent = (id: string, name: string) => {
    const student = students.find((s) => s.id === id) || ({ id, name, nisn: '-', className: '-', parentName: '-' } as Student);
    handleOpenDeleteStudent(student);
  };

  const handleDeleteRombel = (id: string, name: string) => {
    const rombel = rombels.find((r) => r.id === id) || ({ id, name, code: '-', grade: 1, phase: '-', teacher: '-' } as Rombel);
    handleOpenDeleteRombel(rombel);
  };

  // Centralized Execution of Modal Confirmation
  const handleExecuteDelete = () => {
    const { type, data } = deleteModalState;

    if (type === 'STUDENT' && data) {
      const student = data as Student;
      const updated = students.filter((s) => s.id !== student.id);
      updateStudents(updated);
      showToast(`Peserta didik "${student.name}" berhasil dihapus.`);
      setSelectedStudentIds((prev) => {
        const next = new Set(prev);
        next.delete(student.id);
        return next;
      });
    } else if (type === 'ROMBEL' && data) {
      const rombel = data as Rombel;
      const updated = rombels.filter((r) => r.id !== rombel.id);
      updateRombels(updated);
      showToast(`Rombongan belajar "${rombel.name}" berhasil dihapus.`);
    } else if (type === 'USER' && data) {
      const user = data as UserPersona;
      const filtered = schoolScopedUsers.filter((u) => u.id !== user.id);
      updateSchoolUsers(filtered);
      showToast(`Akun mandiri "${user.name}" berhasil dihapus dari ${currentSchoolName}.`);
      setSelectedUserIds((prev) => {
        const next = new Set(prev);
        next.delete(user.id);
        return next;
      });
    } else if (type === 'PROGRAM' && data) {
      const program = data as { id: string; title: string };
      const updated = schoolPrograms.filter((p) => p.id !== program.id);
      updateSchoolPrograms(updated);
      showToast(`Program "${program.title}" berhasil dihapus.`);
    } else if (type === 'BULK_STUDENT') {
      const updated = students.filter((s) => !selectedStudentIds.has(s.id));
      updateStudents(updated);
      showToast(`${selectedStudentIds.size} peserta didik terpilih berhasil dihapus.`);
      setSelectedStudentIds(new Set());
    } else if (type === 'BULK_USER') {
      const filtered = schoolScopedUsers.filter((u) => {
        if (!selectedUserIds.has(u.id)) return true;
        if (currentPersona && u.id === currentPersona.id) return true;
        return false;
      });
      updateSchoolUsers(filtered);
      showToast(`Akun terpilih berhasil dihapus.`);
      setSelectedUserIds(new Set());
    } else if (type === 'AUDIT_LOGS') {
      setLogs([]);
      showToast('Seluruh riwayat log audit sekolah berhasil dibersihkan.');
    }

    setDeleteModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Rombel Form Actions
  const handleOpenAddRombel = () => {
    setEditingRombel(null);
    setRombelFormCode(`ROMBEL-${Date.now().toString().slice(-4)}`);
    setRombelFormName('');
    setRombelFormGrade(7);
    setRombelFormPhase('Fase D');
    setRombelFormTeacher('');
    setRombelFormTeacherNip('');
    setRombelFormCapacity(32);
    setRombelFormYear('2025/2026 Ganjil');
    setRombelFormStatus('AKTIF');
    setIsRombelModalOpen(true);
  };

  const handleOpenEditRombel = (r: Rombel) => {
    setEditingRombel(r);
    setRombelFormCode(r.code);
    setRombelFormName(r.name);
    setRombelFormGrade(r.grade);
    setRombelFormPhase(r.phase);
    setRombelFormTeacher(r.teacher);
    setRombelFormTeacherNip(r.teacherNip);
    setRombelFormCapacity(r.capacity);
    setRombelFormYear(r.academicYear);
    setRombelFormStatus(r.status);
    setIsRombelModalOpen(true);
  };

  const handleSaveRombel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rombelFormName.trim()) {
      showToast('Nama Rombongan Belajar wajib diisi!');
      return;
    }

    if (editingRombel) {
      const updated = rombels.map((r) =>
        r.id === editingRombel.id
          ? {
              ...r,
              code: rombelFormCode.trim() || r.code,
              name: rombelFormName.trim(),
              grade: rombelFormGrade,
              phase: rombelFormPhase,
              teacher: rombelFormTeacher.trim() || 'Wali Kelas',
              teacherNip: rombelFormTeacherNip.trim() || '-',
              capacity: rombelFormCapacity,
              academicYear: rombelFormYear,
              status: rombelFormStatus,
            }
          : r
      );
      updateRombels(updated);
      showToast('Rombongan Belajar berhasil diperbarui!');
    } else {
      const newRombel: Rombel = {
        id: `rombel-man-${Date.now()}`,
        code: rombelFormCode.trim() || `ROMBEL-${Date.now().toString().slice(-4)}`,
        name: rombelFormName.trim(),
        grade: rombelFormGrade,
        phase: rombelFormPhase,
        teacher: rombelFormTeacher.trim() || 'Wali Kelas',
        teacherNip: rombelFormTeacherNip.trim() || '-',
        capacity: rombelFormCapacity,
        academicYear: rombelFormYear,
        status: rombelFormStatus,
        source: 'INPUT_MANUAL',
      };
      updateRombels([...rombels, newRombel]);
      showToast(`Rombongan Belajar ${newRombel.name} berhasil ditambahkan!`);
    }
    setIsRombelModalOpen(false);
  };

  // System Guardrails State
  const [guardrails, setGuardrails] = useState({
    antiRanking: true,
    noCharacterJudgment: true,
    rlsEnforcement: true,
    parentalConsentEnforced: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleProgramStatus = (id: string) => {
    const updated = schoolPrograms.map((p) =>
      p.id === id ? { ...p, status: p.status === 'AKTIF' ? 'NONAKTIF' : 'AKTIF' } : p
    );
    updateSchoolPrograms(updated);
    showToast('Status operasional program sekolah berhasil diperbarui.');
  };

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data || []);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filterRole === 'ALL') return true;
    return log.actorRole === filterRole;
  });

  const handleExportAuditCsv = () => {
    const headers = ['Waktu', 'Aktor Role', 'Aktor ID', 'Aksi', 'Entitas', 'Target ID', 'Metadata'];
    const rows = filteredLogs.map((l) => [
      `"${new Date(l.timestamp).toLocaleString('id-ID')}"`,
      `"${l.actorRole}"`,
      `"${l.actorId}"`,
      `"${l.action}"`,
      `"${l.targetEntity}"`,
      `"${l.targetId}"`,
      `"${JSON.stringify(l.metadata).replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Audit_Log_SI7KAIH_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl shadow-sm">
            🛡️
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {isSuperAdmin
                ? 'Panel Super Admin & Keamanan Sistem'
                : `Administrasi Data & Akun SIM ${currentPersona?.schoolName || 'Satuan Pendidikan'}`}
            </h2>
            <p className="text-xs text-slate-500">
              Operator SIM: <span className="font-bold text-slate-700">{currentPersona?.name || 'Administrator'}</span> • Pengelolaan mandiri master data siswa, rombel, dan akun satuan pendidikan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAuditCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor Log (CSV)</span>
          </button>
          <button
            onClick={fetchAuditLogs}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan Log</span>
          </button>
        </div>
      </div>

      {/* Standalone Authentication Notice: 100% Admin-Managed & Non-Portal */}
      <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
            <Shield className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-950">
                Sistem Autentikasi Mandiri Satuan Pendidikan (Bebas Ketergantungan Portal)
              </span>
              <span className="text-[10px] bg-emerald-200 text-emerald-950 font-bold px-2 py-0.5 rounded-md border border-emerald-300">
                Non-Portal Eksternal
              </span>
            </div>
            <p className="text-[11px] text-emerald-900 mt-0.5">
              Seluruh kredensial dan hak akses pengguna (Siswa, Wali, Guru, Kepsek, Pengawas, Operator) dibuat dan dikelola secara mandiri oleh Administrator Satuan Pendidikan.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-emerald-900 font-mono bg-white/90 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Otoritas Kredensial: Mandiri Lokal 100%</span>
        </div>
      </div>

      {/* Sub-navigation bar */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('DATA')}
          className={`pb-3 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'DATA'
              ? 'border-b-2 border-[#0753A5] text-[#0753A5]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Master Data Siswa & Rombel Mandiri ({students.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('PROGRAMS')}
          className={`pb-3 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'PROGRAMS'
              ? 'border-b-2 border-[#0753A5] text-[#0753A5]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Program Pembiasaan ({schoolPrograms.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('USERS')}
          className={`pb-3 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'USERS'
              ? 'border-b-2 border-[#0753A5] text-[#0753A5]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4 text-[#0753A5]" />
          <span>Autentikasi & Akun Mandiri ({schoolScopedUsers.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('AUDIT')}
          className={`pb-3 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'AUDIT'
              ? 'border-b-2 border-[#0753A5] text-[#0753A5]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Log Audit & Integritas</span>
        </button>
        <button
          onClick={() => setActiveSubTab('SETTINGS')}
          className={`pb-3 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
            activeSubTab === 'SETTINGS'
              ? 'border-b-2 border-[#0753A5] text-[#0753A5]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan Keamanan Mandiri</span>
        </button>
      </div>

      {/* 1. MASTER DATA SUBTAB (100% MANDIRI OPERATOR - BEBAS DAPODIK) */}
      {activeSubTab === 'DATA' && (
        <div className="space-y-6">
          {/* Official Mandiri Notice Banner */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 p-6 rounded-3xl border border-blue-200/80 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0753A5] text-white text-[10px] font-extrabold uppercase tracking-wide">
                    Kebijakan Mandiri Satuan Pendidikan
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Tanpa Sinkronisasi Dapodik / EMIS
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Pengelolaan Mandiri Peserta Didik & Rombongan Belajar
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  Seluruh pengelolaan data siswa dan rombongan belajar dikelola secara otonom oleh Admin dan Operator Sekolah melalui input manual atau fitur <strong>impor berkas template resmi (.CSV)</strong>. Anda dapat mengunduh format template di bawah, mengisi datanya melalui aplikasi spreadsheet favorit Anda, dan mengimpornya kembali ke sistem.
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={downloadStudentTemplateCsv}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                  title="Unduh Template CSV Peserta Didik"
                >
                  <Download className="w-3.5 h-3.5 text-[#0753A5]" />
                  <span>Template Siswa (.CSV)</span>
                </button>
                <button
                  onClick={downloadRombelTemplateCsv}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
                  title="Unduh Template CSV Rombongan Belajar"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Template Rombel (.CSV)</span>
                </button>
                <button
                  onClick={() => {
                    setImportModalTab(dataSubView);
                    setIsImportModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Impor Berkas Mandiri</span>
                </button>
              </div>
            </div>
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">Peserta Didik Terdaftar</span>
              <span className="text-2xl font-black text-[#0753A5] mt-1 block">
                {students.length} Siswa
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{students.filter((s) => s.status === 'AKTIF').length} Berstatus Aktif</span>
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">Rombongan Belajar (Rombel)</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {rombels.length} Rombel
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Fase D (Kelas 7, 8, 9) Terkonfigurasi
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">Daya Tampung / Kapasitas</span>
              <span className="text-2xl font-black text-indigo-700 mt-1 block">
                {rombels.reduce((acc, r) => acc + (r.capacity || 0), 0)} Kursi
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Keterisian {Math.round((students.length / Math.max(1, rombels.reduce((acc, r) => acc + (r.capacity || 0), 0))) * 100)}% kuota
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">Metode Pengelolaan</span>
              <span className="text-xs font-black text-emerald-700 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Mandiri Operator</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                Bebas Dapodik • Berbasis File Impor
              </span>
            </div>
          </div>

          {/* Sub-View Switcher: Students vs Rombel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
                <button
                  onClick={() => setDataSubView('STUDENTS')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    dataSubView === 'STUDENTS'
                      ? 'bg-white text-[#0753A5] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Data Peserta Didik</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    dataSubView === 'STUDENTS' ? 'bg-blue-100 text-[#0753A5]' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {students.length}
                  </span>
                </button>
                <button
                  onClick={() => setDataSubView('ROMBELS')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    dataSubView === 'ROMBELS'
                      ? 'bg-white text-[#0753A5] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Rombongan Belajar (Rombel)</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    dataSubView === 'ROMBELS' ? 'bg-blue-100 text-[#0753A5]' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {rombels.length}
                  </span>
                </button>
              </div>

              {/* Action buttons based on active subview */}
              <div className="flex items-center gap-2">
                {dataSubView === 'STUDENTS' ? (
                  <>
                    <button
                      onClick={() => {
                        setImportModalTab('STUDENTS');
                        setIsImportModalOpen(true);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#0753A5]" />
                      <span>Impor Siswa (.CSV)</span>
                    </button>
                    {selectedStudentIds.size > 0 && (
                      <button
                        onClick={handleOpenDeleteSelectedStudents}
                        className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs animate-in fade-in duration-150"
                        title="Hapus Siswa Terpilih"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Terpilih ({selectedStudentIds.size})</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenAddParent()}
                      className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Tambah akun orang tua siswa"
                    >
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>+ Akun Orang Tua</span>
                    </button>
                    {studentsWithoutParent.length > 0 && (
                      <button
                        onClick={() => setIsBatchParentModalOpen(true)}
                        className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        title="Terbitkan akun orang tua sekaligus untuk siswa yang belum punya akun"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Terbitkan Ortu Massal ({studentsWithoutParent.length})</span>
                      </button>
                    )}
                    <button
                      onClick={handleOpenAddStudent}
                      className="px-3.5 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Siswa Manual</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setImportModalTab('ROMBELS');
                        setIsImportModalOpen(true);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Impor Rombel (.CSV)</span>
                    </button>
                    <button
                      onClick={handleOpenAddRombel}
                      className="px-3.5 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Rombel Manual</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* TABEL 1: PESERTA DIDIK */}
            {dataSubView === 'STUDENTS' && (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari NISN, nama peserta didik, atau orang tua..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Filter className="w-3.5 h-3.5" />
                      <span className="font-semibold">Filter:</span>
                    </div>

                    <select
                      value={studentClassFilter}
                      onChange={(e) => setStudentClassFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    >
                      <option value="ALL">Semua Rombel ({students.length})</option>
                      {rombels.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={studentStatusFilter}
                      onChange={(e) => setStudentStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    >
                      <option value="ALL">Semua Status</option>
                      <option value="AKTIF">Status: Aktif</option>
                      <option value="MUTASI">Status: Mutasi</option>
                      <option value="LULUS">Status: Lulus</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3 w-8">
                          <input
                            type="checkbox"
                            checked={
                              students.length > 0 &&
                              students
                                .filter((s) => {
                                  const matchSearch =
                                    s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                                    s.nisn.includes(studentSearchQuery) ||
                                    s.parentName.toLowerCase().includes(studentSearchQuery.toLowerCase());
                                  const matchClass = studentClassFilter === 'ALL' || s.className === studentClassFilter;
                                  const matchStatus = studentStatusFilter === 'ALL' || s.status === studentStatusFilter;
                                  return matchSearch && matchClass && matchStatus;
                                })
                                .every((s) => selectedStudentIds.has(s.id))
                            }
                            onChange={(e) => {
                              const filtered = students.filter((s) => {
                                const matchSearch =
                                  s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                                  s.nisn.includes(studentSearchQuery) ||
                                  s.parentName.toLowerCase().includes(studentSearchQuery.toLowerCase());
                                const matchClass = studentClassFilter === 'ALL' || s.className === studentClassFilter;
                                const matchStatus = studentStatusFilter === 'ALL' || s.status === studentStatusFilter;
                                return matchSearch && matchClass && matchStatus;
                              });
                              if (e.target.checked) {
                                setSelectedStudentIds(new Set(filtered.map((s) => s.id)));
                              } else {
                                setSelectedStudentIds(new Set());
                              }
                            }}
                            className="rounded text-[#0753A5] focus:ring-0 cursor-pointer"
                            aria-label="Pilih semua siswa"
                          />
                        </th>
                        <th className="py-3 px-4">NISN & Sumber</th>
                        <th className="py-3 px-4">Nama Peserta Didik</th>
                        <th className="py-3 px-4">Rombel / Kelas</th>
                        <th className="py-3 px-4">Orang Tua / Wali</th>
                        <th className="py-3 px-4">Tanggal Lahir</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Aksi Mandiri</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {students
                        .filter((s) => {
                          const matchSearch =
                            s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                            s.nisn.includes(studentSearchQuery) ||
                            s.parentName.toLowerCase().includes(studentSearchQuery.toLowerCase());
                          const matchClass = studentClassFilter === 'ALL' || s.className === studentClassFilter;
                          const matchStatus = studentStatusFilter === 'ALL' || s.status === studentStatusFilter;
                          return matchSearch && matchClass && matchStatus;
                        })
                        .map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3">
                              <input
                                type="checkbox"
                                checked={selectedStudentIds.has(s.id)}
                                onChange={(e) => {
                                  const next = new Set(selectedStudentIds);
                                  if (e.target.checked) next.add(s.id);
                                  else next.delete(s.id);
                                  setSelectedStudentIds(next);
                                }}
                                className="rounded text-[#0753A5] focus:ring-0 cursor-pointer"
                                aria-label={`Pilih ${s.name}`}
                              />
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-mono font-bold text-slate-900">{s.nisn}</div>
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight mt-0.5 ${
                                s.source === 'IMPORT_FILE'
                                  ? 'bg-blue-50 text-blue-700'
                                  : s.source === 'INPUT_MANUAL'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {s.source === 'IMPORT_FILE' ? 'Berkas CSV' : s.source === 'INPUT_MANUAL' ? 'Input Manual' : 'Sistem'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                <span>{s.name}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  s.gender === 'L' ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {s.gender === 'L' ? 'L' : 'P'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 font-bold text-[11px] border border-blue-100">
                                {s.className}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-slate-800 font-semibold">{s.parentName}</div>
                              {s.parentPhone && (
                                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                  <Phone className="w-2.5 h-2.5" />
                                  <span>{s.parentPhone}</span>
                                </div>
                              )}
                              {(() => {
                                const parentAcc = schoolScopedUsers.find(
                                  (u) =>
                                    u.role === 'PARENT' &&
                                    (u.childNisn === s.nisn || u.childId === s.id || u.username === `wali.${s.nisn}`)
                                );
                                if (parentAcc) {
                                  return (
                                    <div className="mt-1 flex items-center gap-1">
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                        <span>Akun: {parentAcc.username}</span>
                                      </span>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <button
                                      onClick={() => handleOpenAddParent(s)}
                                      className="mt-1 text-[10px] text-purple-600 hover:text-purple-800 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                      <Plus className="w-2.5 h-2.5" />
                                      <span>+ Buat Akun Ortu</span>
                                    </button>
                                  );
                                }
                              })()}
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                              {s.birthDate || '-'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.status === 'AKTIF'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : s.status === 'MUTASI'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                ● {s.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleOpenAddParent(s)}
                                  className="p-1.5 rounded-lg text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-colors cursor-pointer"
                                  title={`Kelola / Terbitkan Akun Orang Tua untuk ${s.name}`}
                                >
                                  <Users className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditStudent(s)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#0753A5] hover:bg-blue-50 transition-colors cursor-pointer"
                                  title="Edit Siswa"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(s.id, s.name)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Hapus Siswa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                      {students.filter((s) => {
                        const matchSearch =
                          s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                          s.nisn.includes(studentSearchQuery) ||
                          s.parentName.toLowerCase().includes(studentSearchQuery.toLowerCase());
                        const matchClass = studentClassFilter === 'ALL' || s.className === studentClassFilter;
                        const matchStatus = studentStatusFilter === 'ALL' || s.status === studentStatusFilter;
                        return matchSearch && matchClass && matchStatus;
                      }).length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-slate-400">
                            <GraduationCap className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <p className="font-bold text-slate-600">Tidak ada data peserta didik yang cocok</p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Gunakan tombol &quot;Impor Berkas Mandiri&quot; atau &quot;Tambah Siswa Manual&quot; untuk menginput data.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TABEL 2: ROMBONGAN BELAJAR */}
            {dataSubView === 'ROMBELS' && (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari rombel, wali kelas, atau kode..."
                      value={rombelSearchQuery}
                      onChange={(e) => setRombelSearchQuery(e.target.value)}
                      className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Filter className="w-3.5 h-3.5" />
                      <span className="font-semibold">Fase Kurikulum:</span>
                    </div>

                    <select
                      value={rombelPhaseFilter}
                      onChange={(e) => setRombelPhaseFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    >
                      <option value="ALL">Semua Fase ({rombels.length})</option>
                      <option value="Fase D">Fase D (SMP Kelas 7-9)</option>
                      <option value="Fase A">Fase A (SD Kelas 1-2)</option>
                      <option value="Fase B">Fase B (SD Kelas 3-4)</option>
                      <option value="Fase C">Fase C (SD Kelas 5-6)</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Kode & Nama Rombel</th>
                        <th className="py-3 px-4">Tingkat & Fase</th>
                        <th className="py-3 px-4">Guru Wali Kelas & NIP</th>
                        <th className="py-3 px-4">Jumlah Siswa Terdaftar</th>
                        <th className="py-3 px-4">Tahun Ajaran</th>
                        <th className="py-3 px-4">Status & Sumber</th>
                        <th className="py-3 px-4 text-center">Aksi Mandiri</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {rombels
                        .filter((r) => {
                          const matchSearch =
                            r.name.toLowerCase().includes(rombelSearchQuery.toLowerCase()) ||
                            r.teacher.toLowerCase().includes(rombelSearchQuery.toLowerCase()) ||
                            r.code.toLowerCase().includes(rombelSearchQuery.toLowerCase());
                          const matchPhase = rombelPhaseFilter === 'ALL' || r.phase === rombelPhaseFilter;
                          return matchSearch && matchPhase;
                        })
                        .map((r) => {
                          const enrolledCount = students.filter((s) => s.className === r.name).length;
                          return (
                            <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900 text-sm">{r.name}</div>
                                <div className="font-mono text-[10px] text-slate-400">{r.code}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-800">Kelas {r.grade}</div>
                                <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-[10px] mt-0.5">
                                  {r.phase}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-800">{r.teacher}</div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  NIP: {r.teacherNip || '-'}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span className={enrolledCount > r.capacity ? 'text-amber-600' : 'text-slate-900'}>
                                    {enrolledCount} Siswa
                                  </span>
                                  <span className="text-slate-400 font-normal text-[11px]">
                                    / {r.capacity} Kuota
                                  </span>
                                </div>
                                <div className="w-24 bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      enrolledCount >= r.capacity ? 'bg-amber-500' : 'bg-[#0753A5]'
                                    }`}
                                    style={{
                                      width: `${Math.min(100, (enrolledCount / Math.max(1, r.capacity)) * 100)}%`,
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="py-3 px-4 text-slate-700 font-semibold text-[11px]">
                                {r.academicYear}
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold block w-fit">
                                  ● {r.status}
                                </span>
                                <span className="text-[9px] text-slate-400 block mt-1">
                                  {r.source === 'IMPORT_FILE' ? 'Berkas CSV' : 'Mandiri'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditRombel(r)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#0753A5] hover:bg-blue-50 transition-colors cursor-pointer"
                                    title="Edit Rombel"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRombel(r.id, r.name)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Hapus Rombel"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                      {rombels.filter((r) => {
                        const matchSearch =
                          r.name.toLowerCase().includes(rombelSearchQuery.toLowerCase()) ||
                          r.teacher.toLowerCase().includes(rombelSearchQuery.toLowerCase()) ||
                          r.code.toLowerCase().includes(rombelSearchQuery.toLowerCase());
                        const matchPhase = rombelPhaseFilter === 'ALL' || r.phase === rombelPhaseFilter;
                        return matchSearch && matchPhase;
                      }).length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-slate-400">
                            <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <p className="font-bold text-slate-600">Tidak ada data rombongan belajar yang cocok</p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Gunakan tombol &quot;Impor Rombel (.CSV)&quot; atau &quot;Tambah Rombel Manual&quot; untuk menambahkan kelas baru.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. PROGRAMS SUBTAB */}
      {activeSubTab === 'PROGRAMS' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Program Pembiasaan Sekolah 7KAIH
                </h3>
                <p className="text-xs text-slate-500">
                  Kegiatan terstruktur penunjang penguatan karakter siswa di lingkungan satuan pendidikan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {schoolPrograms.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0753A5]">
                        {p.habitTarget}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1.5">{p.title}</h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleProgramStatus(p.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                          p.status === 'AKTIF'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        ● {p.status}
                      </button>
                      <button
                        onClick={() => handleOpenDeleteProgram(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Program Pembiasaan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <p>
                      <strong>Jadwal:</strong> {p.frequency}
                    </p>
                    <p>
                      <strong>Penanggung Jawab:</strong> {p.leadTeacher}
                    </p>
                    <p>
                      <strong>Peserta:</strong> {p.participants}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. AUDIT LOGS SUBTAB */}
      {activeSubTab === 'AUDIT' && (
        <div className="space-y-6">
          {/* System Integrity & AI Providers Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Database & RLS</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Terproteksi Aktif
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span>PostgreSQL Supabase (RLS Enforced)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Akses siswa dan orang tua terisolasi pada id masing-masing.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Penyedia AI (Multi-Provider)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Siap Digunakan
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Google Gemini / OpenAI / Custom Guardrails</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Dilengkapi validator anti-perankingan & larangan vonis karakter.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Integritas Audit</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0753A5] text-[10px] font-bold">
                  Immutable Log
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Riwayat Tindakan Tercatat Permanen</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Setiap validasi dan ekspor laporan terekam dengan timestamp.
              </p>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Log Audit Aktivitas & Keamanan Terkini
                </h3>
                <p className="text-xs text-slate-500">
                  {filteredLogs.length} dari {logs.length} rekaman ditampilkan
                </p>
              </div>

              {/* Role Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['ALL', 'PARENT', 'TEACHER', 'PRINCIPAL', 'SUPERVISOR', 'SYSTEM'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setFilterRole(role)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      filterRole === role
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {role === 'ALL' ? 'Semua Role' : role}
                  </button>
                ))}
                {logs.length > 0 && (
                  <button
                    onClick={handleOpenClearLogs}
                    className="px-3 py-1 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                    title="Bersihkan Semua Catatan Log"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Bersihkan Log</span>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-3">Waktu (WIB)</th>
                    <th className="py-3 px-3">Aktor (Pengguna)</th>
                    <th className="py-3 px-3">Aksi</th>
                    <th className="py-3 px-3">Entitas</th>
                    <th className="py-3 px-3">Detail Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800">{log.actorRole}</span>
                        <span className="block text-[10px] text-slate-400 font-sans">{log.actorId}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0753A5] font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {log.targetEntity}: {log.targetId}
                      </td>
                      <td className="py-3 px-3 text-slate-500 max-w-xs truncate font-sans text-xs">
                        {JSON.stringify(log.metadata)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. STANDALONE USERS MANAGEMENT SUBTAB */}
      {activeSubTab === 'USERS' && (
        <div className="space-y-6">
          {/* School Authority & Access Restriction Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-3xl shadow-md space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white shrink-0">
                  <Building2 className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                      Wewenang Terikat Satuan Pendidikan
                    </span>
                    <span className="text-[10px] font-mono text-blue-200">
                      NPSN: {currentSchoolNpsn}
                    </span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight text-white mt-0.5">
                    {currentSchoolName}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs text-white border border-white/20 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-300" />
                  <span>Akses Mandiri Terisolasi</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-blue-100/90 leading-relaxed border-t border-white/10 pt-2.5">
              Sebagai Administrator Satuan Pendidikan, hak akses manajemen akun mandiri dibatasi secara eksklusif hanya untuk warga satuan pendidikan <strong>{currentSchoolName}</strong>. Akun dan kredensial dari satuan pendidikan lain tidak dapat diakses atau diubah demi menjamin keamanan dan kedaulatan data lokal masing-masing sekolah.
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">Total Akun Sekolah</span>
              <span className="text-2xl font-black text-[#0753A5] mt-1 block">
                {schoolScopedUsers.length} Akun
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Warga {currentSchoolName}
              </span>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">Siswa (Murid)</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {schoolScopedUsers.filter((u) => u.role === 'STUDENT').length} Akun
              </span>
              <span className="text-[10px] text-slate-500">Berbasis NISN</span>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-purple-200/80 bg-purple-50/20 shadow-xs">
              <span className="text-xs font-bold text-purple-700 block flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-600" /> Orang Tua / Wali
              </span>
              <span className="text-2xl font-black text-purple-900 mt-1 block">
                {schoolScopedUsers.filter((u) => u.role === 'PARENT').length} Akun
              </span>
              <span className="text-[10px] text-purple-600 font-semibold">
                {studentsWithoutParent.length === 0
                  ? 'Semua siswa tercover'
                  : `${studentsWithoutParent.length} siswa belum ada akun`}
              </span>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">Guru & Kepala Sekolah</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {schoolScopedUsers.filter((u) => u.role === 'TEACHER' || u.role === 'PRINCIPAL').length} Akun
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">Kredensial PTK</span>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">Operator SIM Sekolah</span>
              <span className="text-2xl font-black text-amber-900 mt-1 block">
                {schoolScopedUsers.filter((u) => u.role === 'SCHOOL_ADMIN').length} Akun
              </span>
              <span className="text-[10px] text-amber-700 font-semibold">Pengelola Internal</span>
            </div>
          </div>

          {/* Action and Filter Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Manajemen Autentikasi Mandiri Pengguna
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seluruh akun warga {currentSchoolName} (Siswa, Orang Tua, Guru, Tenaga Kependidikan) diatur dan dikontrol oleh Admin Satuan Pendidikan secara mandiri.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const dataStr =
                      'data:text/json;charset=utf-8,' +
                      encodeURIComponent(JSON.stringify(schoolScopedUsers, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute('href', dataStr);
                    downloadAnchor.setAttribute(
                      'download',
                      `kredensial-mandiri-${currentSchoolName
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, '-')}-${new Date()
                        .toISOString()
                        .slice(0, 10)}.json`
                    );
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                    showToast(
                      `Cadangan kredensial akun mandiri ${currentSchoolName} (${schoolScopedUsers.length} akun) berhasil diunduh.`
                    );
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cadangkan Kredensial ({schoolScopedUsers.length})</span>
                </button>
                {selectedUserIds.size > 0 && (
                  <button
                    onClick={handleOpenDeleteSelectedUsers}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs animate-in fade-in duration-150"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Terpilih ({selectedUserIds.size})</span>
                  </button>
                )}
                <button
                  onClick={() => handleOpenAddParent()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>+ Tambah Akun Orang Tua</span>
                </button>
                {studentsWithoutParent.length > 0 && (
                  <button
                    onClick={() => setIsBatchParentModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                    title="Terbitkan akun login orang tua untuk semua siswa yang belum memiliki akun"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>⚡ Terbitkan Ortu Massal ({studentsWithoutParent.length})</span>
                  </button>
                )}
                <button
                  onClick={handleOpenAddUser}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Tambah Akun Mandiri Baru</span>
                </button>
              </div>
            </div>

            {/* Search and Role Filter */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Cari nama, ID pengguna, NISN, atau NIP di ${currentSchoolName}...`}
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
                {[
                  { id: 'ALL', label: `Semua (${schoolScopedUsers.length})` },
                  {
                    id: 'STUDENT',
                    label: `Siswa (${schoolScopedUsers.filter((u) => u.role === 'STUDENT').length})`,
                  },
                  {
                    id: 'PARENT',
                    label: `Orang Tua (${schoolScopedUsers.filter((u) => u.role === 'PARENT').length})`,
                  },
                  {
                    id: 'TEACHER',
                    label: `Guru (${schoolScopedUsers.filter((u) => u.role === 'TEACHER').length})`,
                  },
                  {
                    id: 'PRINCIPAL',
                    label: `Kepsek (${schoolScopedUsers.filter((u) => u.role === 'PRINCIPAL').length})`,
                  },
                  {
                    id: 'SCHOOL_ADMIN',
                    label: `Operator (${schoolScopedUsers.filter((u) => u.role === 'SCHOOL_ADMIN').length})`,
                  },
                ].map((roleTab) => (
                  <button
                    key={roleTab.id}
                    onClick={() => setUserRoleFilter(roleTab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      userRoleFilter === roleTab.id
                        ? 'bg-[#0753A5] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {roleTab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={
                          schoolScopedUsers.filter((u) => u.id !== currentPersona?.id).length > 0 &&
                          schoolScopedUsers
                            .filter((u) => {
                              if (u.id === currentPersona?.id) return false;
                              if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
                              if (!searchUserQuery.trim()) return true;
                              const q = searchUserQuery.toLowerCase();
                              return (
                                u.name.toLowerCase().includes(q) ||
                                (u.username && u.username.toLowerCase().includes(q)) ||
                                (u.identifierValue && u.identifierValue.toLowerCase().includes(q)) ||
                                (u.className && u.className.toLowerCase().includes(q)) ||
                                (u.childName && u.childName.toLowerCase().includes(q)) ||
                                (u.childNisn && u.childNisn.toLowerCase().includes(q))
                              );
                            })
                            .every((u) => selectedUserIds.has(u.id))
                        }
                        onChange={(e) => {
                          const filtered = schoolScopedUsers.filter((u) => {
                            if (u.id === currentPersona?.id) return false;
                            if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
                            if (!searchUserQuery.trim()) return true;
                            const q = searchUserQuery.toLowerCase();
                            return (
                              u.name.toLowerCase().includes(q) ||
                              (u.username && u.username.toLowerCase().includes(q)) ||
                              (u.identifierValue && u.identifierValue.toLowerCase().includes(q)) ||
                              (u.className && u.className.toLowerCase().includes(q)) ||
                              (u.childName && u.childName.toLowerCase().includes(q)) ||
                              (u.childNisn && u.childNisn.toLowerCase().includes(q))
                            );
                          });
                          if (e.target.checked) {
                            setSelectedUserIds(new Set(filtered.map((u) => u.id)));
                          } else {
                            setSelectedUserIds(new Set());
                          }
                        }}
                        className="rounded text-[#0753A5] focus:ring-0 cursor-pointer"
                        aria-label="Pilih semua akun"
                      />
                    </th>
                    <th className="py-3 px-4">Pengguna & Akun Mandiri</th>
                    <th className="py-3 px-3">Peran Akses</th>
                    <th className="py-3 px-3">Identitas (NISN / NIP / NIK / HP)</th>
                    <th className="py-3 px-3">Satuan / Kelas</th>
                    <th className="py-3 px-3">Status Kredensial</th>
                    <th className="py-3 px-4 text-right">Tindakan Administrator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schoolScopedUsers
                    .filter((u) => {
                      if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
                      if (!searchUserQuery.trim()) return true;
                      const q = searchUserQuery.toLowerCase();
                      return (
                        u.name.toLowerCase().includes(q) ||
                        (u.username && u.username.toLowerCase().includes(q)) ||
                        (u.identifierValue && u.identifierValue.toLowerCase().includes(q)) ||
                        (u.className && u.className.toLowerCase().includes(q)) ||
                        (u.childName && u.childName.toLowerCase().includes(q)) ||
                        (u.childNisn && u.childNisn.toLowerCase().includes(q))
                      );
                    })
                    .map((user) => {
                      const isInactive = user.accountStatus === 'MANDIRI_NONAKTIF';
                      const isSelf = user.id === currentPersona?.id;
                      return (
                        <tr key={user.id} className={`hover:bg-slate-50/80 transition-colors ${isSelf ? 'bg-blue-50/30' : ''}`}>
                          <td className="py-3 px-3">
                            <input
                              type="checkbox"
                              disabled={isSelf}
                              checked={selectedUserIds.has(user.id)}
                              onChange={(e) => {
                                const next = new Set(selectedUserIds);
                                if (e.target.checked) next.add(user.id);
                                else next.delete(user.id);
                                setSelectedUserIds(next);
                              }}
                              className="rounded text-[#0753A5] focus:ring-0 cursor-pointer disabled:opacity-30"
                              aria-label={`Pilih ${user.name}`}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                avatar={user.avatar}
                                role={user.role}
                                name={user.name}
                                size="md"
                              />
                              <div>
                                <span className="font-bold text-slate-900 block">{user.name}</span>
                                {user.role === 'PARENT' && user.childName && (
                                  <div className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                                    <span>Wali:</span>
                                    <span className="text-purple-900 underline decoration-purple-300 font-bold">
                                      {user.childName}
                                    </span>
                                    {user.childNisn && (
                                      <span className="text-[10px] text-slate-400 font-mono">({user.childNisn})</span>
                                    )}
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                                  <span>ID: {user.username || user.email.split('@')[0]}</span>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                    Mandiri
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                user.role === 'STUDENT'
                                  ? 'bg-blue-100 text-blue-800'
                                  : user.role === 'PARENT'
                                  ? 'bg-purple-100 text-purple-800'
                                  : user.role === 'TEACHER'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : user.role === 'PRINCIPAL'
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {user.title}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-slate-700 font-mono text-[11px]">
                            {user.identifierLabel ? `${user.identifierLabel}: ` : ''}
                            <span className="font-semibold">{user.identifierValue || '-'}</span>
                          </td>

                          <td className="py-3 px-3 text-slate-600 font-medium text-[11px]">
                            {user.className ? (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                                {user.className}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">{currentSchoolName}</span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 ${
                                !isInactive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  !isInactive ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                              />
                              {!isInactive ? 'PRODUKSI AKTIF' : 'DITANGGUHKAN'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit User Button */}
                              <button
                                onClick={() => {
                                  setEditingUser(user);
                                  setEditUserName(user.name);
                                  setEditUserClassName(user.className || '');
                                  setEditUserIdentifierValue(user.identifierValue || '');
                                  setEditUserStatus(
                                    user.accountStatus === 'MANDIRI_NONAKTIF'
                                      ? 'MANDIRI_NONAKTIF'
                                      : 'MANDIRI_AKTIF'
                                  );
                                  setEditUserChildName(user.childName || '');
                                  setEditUserChildNisn(user.childNisn || '');
                                  setEditUserPhone((user as any).phone || user.identifierValue || '');
                                  setIsEditUserModalOpen(true);
                                }}
                                title="Edit Data Pengguna"
                                className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3 text-blue-600" />
                                <span>Edit</span>
                              </button>

                              {/* Reset Password Button */}
                              <button
                                onClick={() => {
                                  const updated = schoolScopedUsers.map((u) => {
                                    if (u.id === user.id) {
                                      return {
                                        ...u,
                                        passwordHash: '123456',
                                        lastUpdated: new Date().toISOString().slice(0, 10),
                                      };
                                    }
                                    return u;
                                  });
                                  updateSchoolUsers(updated);
                                  showToast(
                                    `Kata sandi untuk ${user.name} (${currentSchoolName}) berhasil direset ke default: 123456`
                                  );
                                }}
                                title="Reset Kata Sandi ke Default (123456)"
                                className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <KeyRound className="w-3 h-3 text-amber-600" />
                                <span>Reset Sandi</span>
                              </button>

                              {/* Toggle Status Button */}
                              <button
                                onClick={() => {
                                  const updated = schoolScopedUsers.map((u) => {
                                    if (u.id === user.id) {
                                      const nextStatus =
                                        u.accountStatus === 'MANDIRI_NONAKTIF'
                                          ? 'MANDIRI_AKTIF'
                                          : 'MANDIRI_NONAKTIF';
                                      return {
                                        ...u,
                                        accountStatus: nextStatus,
                                        lastUpdated: new Date().toISOString().slice(0, 10),
                                      };
                                    }
                                    return u;
                                  });
                                  updateSchoolUsers(updated);
                                  showToast(
                                    `Status akun mandiri ${user.name} berhasil diperbarui.`
                                  );
                                }}
                                title={isInactive ? 'Aktifkan Akun' : 'Tangguhkan Akun'}
                                className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                  isInactive
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700 border border-slate-200'
                                }`}
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>{isInactive ? 'Aktifkan' : 'Tangguhkan'}</span>
                              </button>

                              {/* Delete User Button (Dapat menghapus akun warga sekolah kecuali akun sendiri) */}
                              {user.id !== currentPersona?.id && (
                                <button
                                  onClick={() => handleOpenDeleteUser(user)}
                                  title="Hapus Akun Pengguna"
                                  className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {schoolScopedUsers.filter((u) => {
                if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
                if (!searchUserQuery.trim()) return true;
                const q = searchUserQuery.toLowerCase();
                return (
                  u.name.toLowerCase().includes(q) ||
                  (u.username && u.username.toLowerCase().includes(q)) ||
                  (u.identifierValue && u.identifierValue.toLowerCase().includes(q)) ||
                  (u.className && u.className.toLowerCase().includes(q))
                );
              }).length === 0 && (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-bold text-sm text-slate-700">
                    Tidak ada akun mandiri yang cocok di {currentSchoolName}
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {searchUserQuery
                      ? `Tidak ditemukan akun yang sesuai dengan kata kunci "${searchUserQuery}".`
                      : `Belum ada akun mandiri yang terdaftar untuk filter peran yang dipilih pada satuan pendidikan ini.`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Add User Modal */}
          {isAddUserModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh] my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between p-5 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 shrink-0 bg-white">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0753A5] flex items-center justify-center font-bold">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        Tambah Akun Mandiri Baru
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Diterbitkan langsung untuk warga {currentSchoolName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1 overscroll-contain text-xs">
                  {/* Locked School Indicator */}
                  <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#0753A5]" />
                      <div>
                        <span className="block text-[10px] text-blue-800 font-bold uppercase tracking-wider">
                          Satuan Pendidikan (Otoritas Terikat)
                        </span>
                        <span className="font-bold text-slate-900">
                          {currentSchoolName} <span className="font-mono text-blue-700">(NPSN: {currentSchoolNpsn})</span>
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Wewenang Terikat
                    </span>
                  </div>

                  {/* Dropdown Pemilihan Nama Pengguna dari Data yang Ada */}
                  <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/50 p-3.5 rounded-2xl border border-blue-200/80">
                    <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-[#0753A5]">
                        <UserCheck className="w-4 h-4 text-[#0753A5]" />
                        Pilih dari Data Siswa, Wali, atau Guru yang Ada
                      </span>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-blue-200 text-blue-800 font-bold">
                        {availableTeachers.length} Guru &bull; {availableStudents.length} Siswa & Wali
                      </span>
                    </label>
                    <select
                      value={selectedExistingPerson}
                      onChange={(e) => handleSelectExistingPerson(e.target.value)}
                      className="w-full p-2.5 rounded-xl border-2 border-blue-300 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/30 focus:border-[#0753A5]"
                    >
                      <option value="">-- Pilih dari Data Siswa / Wali / Guru (Isi Otomatis) --</option>
                      <option value="MANUAL">✍️ Ketik Manual / Nama Pengguna Baru</option>
                      
                      <optgroup label={`👨‍👩‍👧 Data Orang Tua / Wali Murid Siswa (${availableStudents.length} Siswa)`}>
                        {availableStudents.map((s) => (
                          <option key={`p-${s.id || s.nisn}`} value={`PARENT:${s.nisn}`}>
                            Wali dari {s.name} ({s.parentName || 'Nama Wali'}) - {s.className}
                          </option>
                        ))}
                      </optgroup>

                      <optgroup label={`👨‍🏫 Data Guru & Pendidik (${availableTeachers.length} Orang)`}>
                        {availableTeachers.map((t, idx) => (
                          <option key={`t-${idx}`} value={`TEACHER:${t.name}`}>
                            {t.name} {t.className ? `[Wali ${t.className}]` : ''} {t.nip ? `(NIP: ${t.nip})` : ''}
                          </option>
                        ))}
                      </optgroup>

                      <optgroup label={`🎓 Data Siswa / Peserta Didik (${availableStudents.length} Siswa)`}>
                        {availableStudents.map((s) => (
                          <option key={s.id || s.nisn} value={`STUDENT:${s.nisn}`}>
                            {s.name} - {s.className} (NISN: {s.nisn})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <p className="text-[10px] text-blue-900/80 mt-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />
                      Memilih siswa, orang tua, atau guru akan otomatis mengisi nama lengkap, peran akun, nomor ID (NISN/NIP/NIK), dan perwalian.
                    </p>
                  </div>

                  {/* Bidang Khusus Orang Tua / Wali Murid */}
                  {newUserRole === 'PARENT' && (
                    <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-purple-600" />
                          Keterkaitan Perwalian Siswa
                        </span>
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full border border-purple-200">
                          Khusus Akun Orang Tua
                        </span>
                      </div>

                      <div>
                        <label className="block font-bold text-purple-900 mb-1 text-[11px]">
                          Pilih Siswa yang Diwalikan (Otomatiskan Data Anak)
                        </label>
                        <select
                          value={newUserChildNisn}
                          onChange={(e) => {
                            const nisn = e.target.value;
                            const st = availableStudents.find((s) => s.nisn === nisn);
                            if (st) {
                              setNewUserChildNisn(st.nisn);
                              setNewUserChildName(st.name);
                              setNewUserChildId(st.id);
                              setNewUserClassName(st.className);
                              if (!newUserName.trim() || newUserName === 'Orang Tua Murid') {
                                setNewUserName(st.parentName || `Orang Tua ${st.name}`);
                              }
                              if (!newUserUsername || newUserUsername.startsWith('wali.')) {
                                setNewUserUsername(`wali.${st.nisn}`);
                              }
                              if (st.parentPhone) {
                                setNewUserPhone(st.parentPhone);
                                setNewUserIdentifierValue(st.parentPhone);
                              }
                            } else {
                              setNewUserChildNisn('');
                            }
                          }}
                          className="w-full p-2 rounded-xl border border-purple-200 bg-white font-semibold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                          <option value="">-- Pilih Siswa yang Diwalikan --</option>
                          {availableStudents.map((s) => (
                            <option key={`ch-${s.id || s.nisn}`} value={s.nisn}>
                              {s.name} ({s.className}) - NISN: {s.nisn}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                            Nama Lengkap Siswa / Anak
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Budi Santoso"
                            value={newUserChildName}
                            onChange={(e) => setNewUserChildName(e.target.value)}
                            className="w-full p-2 rounded-xl border border-purple-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                            NISN Siswa / Anak
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: 0098765432"
                            value={newUserChildNisn}
                            onChange={(e) => setNewUserChildNisn(e.target.value)}
                            className="w-full p-2 rounded-xl border border-purple-200 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                          No. WhatsApp / HP Orang Tua
                        </label>
                        <input
                          type="tel"
                          placeholder="Contoh: 081234567890"
                          value={newUserPhone}
                          onChange={(e) => {
                            setNewUserPhone(e.target.value);
                            if (!newUserIdentifierValue || newUserIdentifierValue === '-') {
                              setNewUserIdentifierValue(e.target.value);
                            }
                          }}
                          className="w-full p-2 rounded-xl border border-purple-200 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Lengkap Pengguna <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Muhammad Rizky Pratama"
                      value={newUserName}
                      onChange={(e) => {
                        setNewUserName(e.target.value);
                        if (!newUserUsername) {
                          setNewUserUsername(
                            e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '.')
                          );
                        }
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Peran Hak Akses
                      </label>
                      <select
                        value={newUserRole}
                        onChange={(e) => {
                          const r = e.target.value as UserRole;
                          setNewUserRole(r);
                          if (r === 'STUDENT') {
                            setNewUserIdentifierLabel('NISN');
                          } else if (r === 'PARENT') {
                            setNewUserIdentifierLabel('NIK');
                          } else {
                            setNewUserIdentifierLabel('NIP');
                          }
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                      >
                        <option value="STUDENT">Siswa (Peserta Didik)</option>
                        <option value="PARENT">Orang Tua / Wali Murid</option>
                        <option value="TEACHER">Guru / Wali Kelas</option>
                        <option value="PRINCIPAL">Kepala Sekolah</option>
                        <option value="SCHOOL_ADMIN">Operator SIM Sekolah</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        ID Pengguna / Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: rizky.pratama"
                        value={newUserUsername}
                        onChange={(e) => setNewUserUsername(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Nomor {newUserIdentifierLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={`Masukkan ${newUserIdentifierLabel}`}
                        value={newUserIdentifierValue}
                        onChange={(e) => setNewUserIdentifierValue(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Rombel / Penugasan
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Kelas 7-A"
                        value={newUserClassName}
                        onChange={(e) => setNewUserClassName(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kata Sandi Awal Pengguna
                    </label>
                    <input
                      type="text"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Pengguna dapat mengubah kata sandi ini setelah login mandiri pertama kali.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 p-4 sm:p-5 pt-3 border-t border-slate-100 shrink-0 bg-slate-50/80 rounded-b-3xl">
                  <button
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      if (!newUserName.trim() || !newUserUsername.trim()) {
                        alert('Mohon isi nama lengkap dan ID pengguna.');
                        return;
                      }

                      const roleTitles: Record<UserRole, string> = {
                        STUDENT: 'Peserta Didik',
                        PARENT: 'Orang Tua / Wali',
                        TEACHER: 'Guru Wali Kelas',
                        PRINCIPAL: 'Kepala Sekolah',
                        SUPERVISOR: 'Pengawas Pembina',
                        SCHOOL_ADMIN: 'Operator SIM Sekolah',
                        SUPER_ADMIN: 'Administrator Sistem',
                      };

                      const schoolDomain = currentSchoolName
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, '');

                      const newPersona: UserPersona = {
                        id: `usr-custom-${Date.now()}`,
                        name: newUserName.trim(),
                        role: newUserRole,
                        title: roleTitles[newUserRole] || 'Pengguna Mandiri',
                        schoolId: currentSchoolId,
                        schoolName: currentSchoolName,
                        email: `${newUserUsername.trim().toLowerCase()}@${schoolDomain}.sch.id`,
                        username: newUserUsername.trim().toLowerCase(),
                        avatar: ROLE_DEFAULT_AVATARS[newUserRole] || '👤',
                        authChannel: 'MANDIRI_INTERNAL',
                        accountStatus: 'MANDIRI_AKTIF',
                        authProviderLabel: `Autentikasi Mandiri ${currentSchoolName}`,
                        securityLevel: 'Pengguna Mandiri Terdaftar',
                        identifierLabel: newUserIdentifierLabel,
                        identifierValue: newUserIdentifierValue.trim() || '-',
                        className: newUserClassName.trim() || undefined,
                        managedBy: `Administrator Mandiri ${currentSchoolName}`,
                        createdDate: new Date().toISOString().slice(0, 10),
                        childName: newUserRole === 'PARENT' ? newUserChildName.trim() || undefined : undefined,
                        childNisn: newUserRole === 'PARENT' ? newUserChildNisn.trim() || undefined : undefined,
                        childId: newUserRole === 'PARENT' ? newUserChildId.trim() || undefined : undefined,
                        phone: newUserRole === 'PARENT' ? newUserPhone.trim() || undefined : undefined,
                      } as any;

                      updateSchoolUsers([...schoolScopedUsers, newPersona]);
                      setIsAddUserModalOpen(false);
                      setSelectedExistingPerson('');
                      setNewUserName('');
                      setNewUserUsername('');
                      setNewUserIdentifierValue('');
                      setNewUserChildName('');
                      setNewUserChildNisn('');
                      setNewUserChildId('');
                      setNewUserPhone('');
                      showToast(
                        `Akun mandiri untuk ${newPersona.name} (${newPersona.title}) di ${currentSchoolName} berhasil diterbitkan!`
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                  >
                    Terbitkan Akun di {currentSchoolName}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {isEditUserModalOpen && editingUser && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh] my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between p-5 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 shrink-0 bg-white">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0753A5] flex items-center justify-center font-bold">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        Edit Data Akun Mandiri
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Perbarui rincian pengguna di {currentSchoolName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditUserModalOpen(false);
                      setEditingUser(null);
                    }}
                    className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1 overscroll-contain text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Lengkap Pengguna <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editUserName}
                      onChange={(e) => setEditUserName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Peran (Terkunci)
                      </label>
                      <input
                        type="text"
                        disabled
                        value={editingUser.title}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-semibold cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        ID Pengguna (Terkunci)
                      </label>
                      <input
                        type="text"
                        disabled
                        value={editingUser.username || editingUser.email.split('@')[0]}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono text-slate-600 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Nomor {editingUser.identifierLabel || 'Identitas'}
                      </label>
                      <input
                        type="text"
                        value={editUserIdentifierValue}
                        onChange={(e) => setEditUserIdentifierValue(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Rombel / Penugasan
                      </label>
                      <input
                        type="text"
                        value={editUserClassName}
                        onChange={(e) => setEditUserClassName(e.target.value)}
                        placeholder="Contoh: Kelas 7-A"
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                      />
                    </div>
                  </div>

                  {editingUser.role === 'PARENT' && (
                    <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-3">
                      <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-600" />
                        Data Perwalian Siswa
                      </span>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                            Nama Anak / Siswa
                          </label>
                          <input
                            type="text"
                            value={editUserChildName}
                            onChange={(e) => setEditUserChildName(e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            className="w-full p-2 rounded-xl border border-purple-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                            NISN Siswa
                          </label>
                          <input
                            type="text"
                            value={editUserChildNisn}
                            onChange={(e) => setEditUserChildNisn(e.target.value)}
                            placeholder="Contoh: 0098765432"
                            className="w-full p-2 rounded-xl border border-purple-200 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                          No. HP / WhatsApp Wali
                        </label>
                        <input
                          type="tel"
                          value={editUserPhone}
                          onChange={(e) => {
                            setEditUserPhone(e.target.value);
                            if (!editUserIdentifierValue || editUserIdentifierValue === '-') {
                              setEditUserIdentifierValue(e.target.value);
                            }
                          }}
                          placeholder="Contoh: 081234567890"
                          className="w-full p-2 rounded-xl border border-purple-200 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Status Akun Kredensial
                    </label>
                    <select
                      value={editUserStatus}
                      onChange={(e) =>
                        setEditUserStatus(e.target.value as 'MANDIRI_AKTIF' | 'MANDIRI_NONAKTIF')
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                    >
                      <option value="MANDIRI_AKTIF">MANDIRI AKTIF (Bisa Login)</option>
                      <option value="MANDIRI_NONAKTIF">DITANGGUHKAN (Blokir Sementara)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 p-4 sm:p-5 pt-3 border-t border-slate-100 shrink-0 bg-slate-50/80 rounded-b-3xl">
                  <button
                    onClick={() => {
                      setIsEditUserModalOpen(false);
                      setEditingUser(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      if (!editUserName.trim()) {
                        alert('Nama pengguna tidak boleh kosong.');
                        return;
                      }

                      const updated = schoolScopedUsers.map((u) => {
                        if (u.id === editingUser.id) {
                          return {
                            ...u,
                            name: editUserName.trim(),
                            className: editUserClassName.trim() || undefined,
                            identifierValue: editUserIdentifierValue.trim() || '-',
                            accountStatus: editUserStatus,
                            lastUpdated: new Date().toISOString().slice(0, 10),
                            childName:
                              editingUser.role === 'PARENT'
                                ? editUserChildName.trim() || undefined
                                : u.childName,
                            childNisn:
                              editingUser.role === 'PARENT'
                                ? editUserChildNisn.trim() || undefined
                                : u.childNisn,
                            phone:
                              editingUser.role === 'PARENT'
                                ? editUserPhone.trim() || undefined
                                : (u as any).phone,
                          } as any;
                        }
                        return u;
                      });

                      updateSchoolUsers(updated);
                      setIsEditUserModalOpen(false);
                      setEditingUser(null);
                      showToast(`Perubahan data akun ${editUserName} berhasil disimpan.`);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Batch Create Parent Accounts Modal */}
          {isBatchParentModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh] my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between p-5 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 shrink-0 bg-white">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        Terbitkan Akun Orang Tua Massal
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Otomatisasi akun portal orang tua untuk siswa di {currentSchoolName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsBatchParentModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain text-xs">
                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-purple-900">
                        Terdeteksi {studentsWithoutParent.length} Siswa Belum Memiliki Akun Orang Tua
                      </p>
                      <p className="text-[11px] text-purple-800/90 leading-relaxed">
                        Sistem mandiri akan secara otomatis menerbitkan akun untuk orang tua masing-masing siswa dengan format:
                      </p>
                      <ul className="text-[10px] list-disc list-inside text-purple-900 space-y-0.5 pt-1 font-mono">
                        <li>ID Pengguna: <span className="font-bold">wali.[NISN-Siswa]</span></li>
                        <li>Kata Sandi Awal: <span className="font-bold">wali-[NISN-Siswa]</span> (dapat diubah nanti)</li>
                        <li>Nama Wali: Diambil dari data wali peserta didik pada Dapodik/SIM</li>
                      </ul>
                    </div>
                  </div>

                  {/* List of students that will get parents */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Daftar Peserta Didik yang Diterbitkan Akun Wali Murid ({studentsWithoutParent.length}):
                    </label>
                    <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-slate-50/50">
                      {studentsWithoutParent.map((st) => (
                        <div key={st.id || st.nisn} className="p-2.5 px-3 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-slate-900 block">{st.name}</span>
                            <span className="text-[10px] text-slate-500">
                              Kelas: {st.className} &bull; NISN: {st.nisn}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-purple-900 block">
                              {st.parentName || 'Orang Tua / Wali'}
                            </span>
                            <span className="text-[10px] font-mono text-purple-600">
                              wali.{st.nisn}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 p-4 sm:p-5 pt-3 border-t border-slate-100 shrink-0 bg-slate-50/80 rounded-b-3xl">
                  <button
                    onClick={() => setIsBatchParentModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleExecuteBatchCreateParents}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Terbitkan {studentsWithoutParent.length} Akun Orang Tua Sekarang</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SETTINGS SUBTAB */}
      {activeSubTab === 'SETTINGS' && (
        <div className="space-y-6">
          {/* Standalone Authentication Channel Architecture */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">
                    Arsitektur Autentikasi 100% Mandiri & Kedaulatan Data Lokal
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Bebas Portal Eksternal
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seluruh pengaturan autentikasi pengguna dibuat secara mandiri oleh admin dan tidak terhubung ke portal manapun.
                </p>
              </div>
              <div className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Otonomi Kredensial Satuan Pendidikan Aktif</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Standalone Channel 1: Pengawas Pembina */}
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-700" />
                    Pengawas Pembina (SIM-Was Mandiri)
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                    Kanal Mandiri Terisolasi
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/90 leading-relaxed">
                  Autentikasi diisolasi secara mandiri menggunakan modul IAM Pengawas Wilayah I (NIP Pembina: 196811051992031004). Tidak terikat atau terdampak oleh siklus portal eksternal apapun.
                </p>
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[10px] text-amber-800 font-mono">
                  <span>Status: Terhubung Mandiri</span>
                  <span className="font-bold text-emerald-700">● 100% Bebas Ketergantungan Portal</span>
                </div>
              </div>

              {/* Standalone Channel 2: Admin & Operator SIM Sekolah */}
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-700" />
                    Operator SIM Satuan Pendidikan
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                    Otoritas Manajemen Mandiri
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/90 leading-relaxed">
                  Operator sekolah memiliki wewenang penuh menerbitkan akun, mereset kata sandi, dan mengatur hak akses seluruh warga sekolah secara lokal tanpa perantara portal luar.
                </p>
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[10px] text-amber-800 font-mono">
                  <span>Status: Otoritas Root Lokal</span>
                  <span className="font-bold text-emerald-700">● Kedaulatan Penuh</span>
                </div>
              </div>

              {/* Standalone Channel 3: Guru & Tenaga Kependidikan */}
              <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#0753A5]" />
                    Pendidik & Kepala Sekolah
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#0753A5]">
                    Kredensial PTK Mandiri
                  </span>
                </div>
                <p className="text-[11px] text-blue-900/90 leading-relaxed">
                  Guru dan Kepala Sekolah mengakses jurnal karakter menggunakan kredensial internal yang didaftarkan langsung oleh sekolah, menjamin proses belajar tetap berjalan walau koneksi portal luar terganggu.
                </p>
                <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[10px] text-blue-800 font-mono">
                  <span>Status: Terverifikasi NUPTK/NIP</span>
                  <span className="font-bold text-emerald-700">● Akses Mandiri Aktif</span>
                </div>
              </div>

              {/* Standalone Channel 4: Siswa & Orang Tua */}
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-700" />
                    Peserta Didik & Orang Tua
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                    Kanal Mandiri Ramah Anak
                  </span>
                </div>
                <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                  Siswa masuk dengan ID NISN / Username yang diberikan sekolah tanpa kewajiban memiliki akun email portal eksternal, memudahkan siswa SMP (Fase D) mencatat 7 Kebiasaan Anak Indonesia Hebat.
                </p>
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[10px] text-emerald-800 font-mono">
                  <span>Status: Terhubung Mandiri Sekolah</span>
                  <span className="font-bold text-emerald-700">● Perlindungan Privasi Anak</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Integritas Pedagogis & Pengaturan Keamanan Sistem
              </h3>
              <p className="text-xs text-slate-500">
                Pondasi etika pembiasaan karakter dan kepatuhan privasi data anak (UU PDP No. 27/2022).
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Prinsip Anti-Perankingan Karakter Siswa</h4>
                  <p className="text-[11px] text-slate-500">
                    Mencegah pembuatan papan peringkat atau leaderboard perbandingan antar-siswa yang berpotensi melahirkan beban psikologis.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setGuardrails((g) => ({ ...g, antiRanking: !g.antiRanking }));
                    showToast('Pengaturan anti-perankingan diperbarui.');
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    guardrails.antiRanking ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {guardrails.antiRanking ? 'AKTIF (WAJIB)' : 'NONAKTIF'}
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Larangan Vonis Moral AI (Anti-Punitive Guardrail)</h4>
                  <p className="text-[11px] text-slate-500">
                    Sistem memblokir saran AI yang menghakimi siswa malas atau memberi cap negatif. AI difokuskan semata-mata pada motivasi positif.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setGuardrails((g) => ({ ...g, noCharacterJudgment: !g.noCharacterJudgment }));
                    showToast('Pengaturan guardrail AI diperbarui.');
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    guardrails.noCharacterJudgment ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {guardrails.noCharacterJudgment ? 'AKTIF (WAJIB)' : 'NONAKTIF'}
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Isolasi Hak Akses Baris (PostgreSQL Row Level Security)</h4>
                  <p className="text-[11px] text-slate-500">
                    Data jurnal anak hanya dapat diakses oleh anak itu sendiri, orang tua sah, dan guru wali kelas berwenang.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-800 text-xs font-bold">
                  TERKUNCI OLEH SISTEM
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Data Import Modal (CSV Import with Delimiter Detection & Template) */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportStudents={handleImportStudents}
        onImportRombels={handleImportRombels}
        defaultTab={importModalTab}
      />

      {/* Standalone Add / Edit Student Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh] my-auto overflow-hidden">
            <div className="flex items-center justify-between p-5 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0753A5]">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {editingStudent ? 'Perbarui Data Peserta Didik' : 'Tambah Peserta Didik Mandiri'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Input langsung oleh Operator Sekolah (Tanpa Dapodik)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1 overscroll-contain text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      NISN <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 0142987123"
                      value={studentFormNisn}
                      onChange={(e) => setStudentFormNisn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Jenis Kelamin <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={studentFormGender}
                      onChange={(e) => setStudentFormGender(e.target.value as 'L' | 'P')}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap Peserta Didik <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Farhan Al-Fatih"
                    value={studentFormName}
                    onChange={(e) => setStudentFormName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Penempatan Rombel / Kelas <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={studentFormClass}
                      onChange={(e) => setStudentFormClass(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    >
                      <option value="">-- Pilih Rombel / Kelas --</option>
                      {rombels.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name} ({r.phase})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={studentFormBirthDate}
                      onChange={(e) => setStudentFormBirthDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Orang Tua / Wali
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Bapak Irwan"
                      value={studentFormParentName}
                      onChange={(e) => setStudentFormParentName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">No. Kontak / WA</label>
                    <input
                      type="text"
                      placeholder="0812xxxxxxxx"
                      value={studentFormParentPhone}
                      onChange={(e) => setStudentFormParentPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Keaktifan</label>
                  <div className="flex items-center gap-3 mt-1">
                    {(['AKTIF', 'MUTASI', 'LULUS'] as const).map((st) => (
                      <label key={st} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="studentStatus"
                          checked={studentFormStatus === st}
                          onChange={() => setStudentFormStatus(st)}
                          className="text-[#0753A5] focus:ring-[#0753A5]"
                        />
                        <span className="font-semibold">{st}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 p-4 sm:p-5 pt-3 border-t border-slate-100 shrink-0 bg-slate-50/80 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Daftarkan Peserta Didik'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standalone Add / Edit Rombel Modal */}
      {isRombelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[90vh] my-auto overflow-hidden">
            <div className="flex items-center justify-between p-5 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {editingRombel ? 'Perbarui Rombongan Belajar' : 'Tambah Rombongan Belajar Mandiri'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Konfigurasi kelas Kurikulum Merdeka lokal tanpa Dapodik
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRombelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRombel} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1 overscroll-contain text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kode Rombel</label>
                    <input
                      type="text"
                      value={rombelFormCode}
                      onChange={(e) => setRombelFormCode(e.target.value)}
                      placeholder="ROMBEL-4A"
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Rombel <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={rombelFormName}
                      onChange={(e) => setRombelFormName(e.target.value)}
                      placeholder="Kelas 7-A"
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20 focus:border-[#0753A5]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tingkat Kelas</label>
                    <select
                      value={rombelFormGrade}
                      onChange={(e) => {
                        const gr = parseInt(e.target.value);
                        setRombelFormGrade(gr);
                        if (gr >= 7 && gr <= 9) setRombelFormPhase('Fase D');
                        else if (gr <= 2) setRombelFormPhase('Fase A');
                        else if (gr <= 4) setRombelFormPhase('Fase B');
                        else if (gr <= 6) setRombelFormPhase('Fase C');
                        else setRombelFormPhase('Fase D');
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    >
                      {[7, 8, 9, 1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>
                          {g >= 7 ? `Kelas ${g} SMP/MTs (Fase D)` : `Kelas ${g} SD/MI`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Fase Perkembangan</label>
                    <select
                      value={rombelFormPhase}
                      onChange={(e) => setRombelFormPhase(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    >
                      <option value="Fase D">Fase D (SMP Kelas 7 - 9)</option>
                      <option value="Fase A">Fase A (SD Kelas 1 - 2)</option>
                      <option value="Fase B">Fase B (SD Kelas 3 - 4)</option>
                      <option value="Fase C">Fase C (SD Kelas 5 - 6)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Guru Wali Kelas <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={rombelFormTeacher}
                      onChange={(e) => setRombelFormTeacher(e.target.value)}
                      placeholder="Contoh: Pak Ahmad Fauzi, S.Pd."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NIP / NUPTK Guru</label>
                    <input
                      type="text"
                      value={rombelFormTeacherNip}
                      onChange={(e) => setRombelFormTeacherNip(e.target.value)}
                      placeholder="198503122010011002"
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Daya Tampung (Kuota Siswa)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={rombelFormCapacity}
                      onChange={(e) => setRombelFormCapacity(parseInt(e.target.value) || 30)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran & Semester</label>
                    <input
                      type="text"
                      value={rombelFormYear}
                      onChange={(e) => setRombelFormYear(e.target.value)}
                      placeholder="2025/2026 Ganjil"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0753A5]/20"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 p-4 sm:p-5 pt-3 border-t border-slate-100 shrink-0 bg-slate-50/80 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsRombelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0753A5] hover:bg-blue-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                >
                  {editingRombel ? 'Simpan Perubahan' : 'Buat Rombongan Belajar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for School Admin */}
      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleExecuteDelete}
        title={deleteModalState.title}
        itemName={deleteModalState.itemName}
        itemIdentifier={deleteModalState.itemIdentifier}
        warningMessage={deleteModalState.warningMessage}
        confirmLabel={deleteModalState.type === 'RESET' ? 'Ya, Reset Sekarang' : 'Ya, Hapus Sekarang'}
        isDanger={deleteModalState.type !== 'RESET'}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
