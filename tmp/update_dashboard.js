const fs = require('fs');

const filePath = 'src/components/TeacherDashboard.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Check if classJournals needs to be positioned before studentsList
const originalStudentsListMarker = '  // Calculate synchronized student rows with journal metrics (0 when no data)\n  const studentsList: StudentClassRow[] = useMemo(() => {';
const studentsListEndMarker = '  }, [rawClassStudents, syncedJournals, teacherValidations]);\n\n  const [localFollowUps, setLocalFollowUps]';

const newStudentsListBlock = `  // Class journals strictly matched to students in this rombel and school
  const classJournals = useMemo(() => {
    const studentIds = new Set(rawClassStudents.map((s) => s.id));
    const studentNisns = new Set(rawClassStudents.map((s) => s.nisn).filter(Boolean));
    const studentNames = new Set(rawClassStudents.map((s) => s.name.toLowerCase().trim()));
    const normActiveRombel = normalizeClassName(activeRombel.name);

    return syncedJournals.filter((j) => {
      if (j.studentId && (studentIds.has(j.studentId) || studentNisns.has(j.studentId))) return true;
      if (j.studentNisn && (studentNisns.has(j.studentNisn) || studentIds.has(j.studentNisn))) return true;
      if (j.studentName && studentNames.has(j.studentName.toLowerCase().trim())) return true;
      if (j.className && normActiveRombel) {
        const normJ = normalizeClassName(j.className);
        if (normJ === normActiveRombel || normJ.includes(normActiveRombel) || normActiveRombel.includes(normJ)) return true;
      }
      return false;
    });
  }, [rawClassStudents, syncedJournals, activeRombel]);

  // Tanggal aktif monitoring pengisian jurnal siswa (Default: 26 September 2026 sebagai submit terbaru)
  const [selectedJournalDate, setSelectedJournalDate] = useState<string>('2026-09-26');

  // Daftar tanggal pengisian jurnal yang tersedia secara kronologis (20 Sep - 26 Sep 2026)
  const availableJournalDates = useMemo(() => {
    const set = new Set<string>();
    classJournals.forEach((j) => {
      const d = j.journalDate || (j as any).date;
      if (d && typeof d === 'string' && d.trim()) {
        set.add(d.trim());
      }
    });
    // Pastikan seluruh tanggal 20 s.d. 26 September tersedia untuk Kelas 7-B
    if (activeRombel.name.includes('7-B') || (activeRombel.code && activeRombel.code.includes('7B'))) {
      ['2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26'].forEach((d) => set.add(d));
    }
    const sorted = Array.from(set).sort();
    return sorted.length > 0 ? sorted : ['2026-09-26'];
  }, [classJournals, activeRombel]);

  const getFormattedDateLabel = (dateStr: string) => {
    if (dateStr === 'ALL') return 'Semua Rentang (20 - 26 Sep 2026)';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      if (y && m && d) {
        const dt = new Date(y, m - 1, d);
        return formatIndonesianFullDate(dt);
      }
    } catch (_e) {}
    return dateStr;
  };

  const getShortDateLabel = (dateStr: string) => {
    if (dateStr === 'ALL') return '20-26 Sep';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      if (y && m && d) {
        const dt = new Date(y, m - 1, d);
        return formatIndonesianShortDate(dt);
      }
    } catch (_e) {}
    return dateStr;
  };

  // Calculate synchronized student rows with journal metrics (0 when no data)
  const studentsList: StudentClassRow[] = useMemo(() => {
    return rawClassStudents.map((st) => {
      const studentJournals = syncedJournals.filter((j) => {
        if (j.studentId && (j.studentId === st.id || j.studentId === st.nisn)) return true;
        if (j.studentNisn && st.nisn && j.studentNisn === st.nisn) return true;
        if (j.studentName && st.name && j.studentName.toLowerCase().trim() === st.name.toLowerCase().trim()) return true;
        return false;
      });

      let completedForSelectedDate = 0;
      let hasJournalOnSelectedDate = false;
      let validatedForSelectedDate = false;
      let monthlyConsistency = 0;
      let completenessRate = 0;
      let lastDate = '-';
      let totalCompletedHabits = 0;

      if (studentJournals.length > 0) {
        // Cari jurnal pada tanggal terpilih (misal: 2026-09-26) atau evaluasi rentang
        const dateMatchJournal = selectedJournalDate === 'ALL'
          ? null
          : studentJournals.find((j) => {
              const d = j.journalDate || (j as any).date;
              return d === selectedJournalDate;
            });

        if (dateMatchJournal) {
          hasJournalOnSelectedDate = true;
          if (dateMatchJournal.entries) {
            completedForSelectedDate = Object.values(dateMatchJournal.entries).filter((h: any) => h?.completed).length;
          } else if (dateMatchJournal.habits) {
            completedForSelectedDate = Object.values(dateMatchJournal.habits).filter((h: any) => h?.completed).length;
          } else if (typeof dateMatchJournal.completedCount === 'number') {
            completedForSelectedDate = dateMatchJournal.completedCount;
          }
          validatedForSelectedDate = !!dateMatchJournal.teacherValidated ||
            !!teacherValidations[\`\${st.id}_\${selectedJournalDate}\`] ||
            !!teacherValidations[st.id] ||
            (st.nisn ? !!teacherValidations[st.nisn] : false);
        } else if (selectedJournalDate === 'ALL') {
          hasJournalOnSelectedDate = true;
          validatedForSelectedDate = studentJournals.every((j) => j.teacherValidated) || !!teacherValidations[st.id];
        }

        studentJournals.forEach((j) => {
          if (j.entries) {
            totalCompletedHabits += Object.values(j.entries).filter((h: any) => h?.completed).length;
          } else if (j.habits) {
            totalCompletedHabits += Object.values(j.habits).filter((h: any) => h?.completed).length;
          } else if (typeof j.completedCount === 'number') {
            totalCompletedHabits += j.completedCount;
          }
        });

        // Jika ALL dipilih, rerata per entri dijadikan nilai completedForSelectedDate
        if (selectedJournalDate === 'ALL') {
          completedForSelectedDate = studentJournals.length > 0
            ? Math.round((totalCompletedHabits / studentJournals.length) * 10) / 10
            : 0;
        }

        const recordedDates = new Set(
          studentJournals.map((j) => j.journalDate || (j as any).date).filter(Boolean)
        );
        
        // Kelengkapan dalam rentang evaluasi aktif 20-26 September (7 hari pengisian)
        const activeRangeDays = Math.max(1, availableJournalDates.length > 0 ? availableJournalDates.length : 7);
        completenessRate = Math.min(100, Math.round((recordedDates.size / activeRangeDays) * 100));

        monthlyConsistency = studentJournals.length > 0
          ? Math.min(100, Math.round((totalCompletedHabits / (studentJournals.length * 7)) * 100))
          : 0;

        const sortedJournals = [...studentJournals].sort((a, b) => {
          const da = a.journalDate || (a as any).date || '';
          const db = b.journalDate || (b as any).date || '';
          return db.localeCompare(da);
        });
        lastDate = sortedJournals[0]?.journalDate || (sortedJournals[0] as any)?.date || '-';
      }

      const avgCompletedHabits = studentJournals.length > 0 ? (totalCompletedHabits / studentJournals.length) : 0;

      const category: EarlyWarningCategory | 'BELUM_ADA_DATA' =
        studentJournals.length === 0
          ? 'BELUM_ADA_DATA'
          : (avgCompletedHabits >= 5.6 || monthlyConsistency >= 80)
          ? 'TERPANTAU_BAIK'
          : (avgCompletedHabits >= 3.8 || monthlyConsistency >= 55)
          ? 'PERLU_PENGUATAN'
          : 'PERLU_PENDAMPINGAN';

      const isValidated =
        !!teacherValidations[st.id] ||
        (st.nisn ? !!teacherValidations[st.nisn] : false) ||
        studentJournals.some((j) => j.teacherValidated);

      return {
        id: st.id,
        nisn: st.nisn,
        name: st.name,
        completedTodayCount: Math.min(7, Math.round(completedForSelectedDate)),
        completedOnSelectedDate: Math.min(7, completedForSelectedDate),
        hasJournalOnSelectedDate,
        validatedForSelectedDate,
        monthlyConsistency: Math.min(100, Math.max(0, monthlyConsistency)),
        completenessRate: Math.min(100, Math.max(0, completenessRate)),
        avgHabitsCompleted: studentJournals.length > 0 ? Math.round(avgCompletedHabits * 10) / 10 : 0,
        totalJournalsCount: studentJournals.length,
        category,
        lastJournalDate: lastDate,
        validatedByTeacher: selectedJournalDate === 'ALL' ? isValidated : validatedForSelectedDate,
        gender: st.gender,
        parentName: st.parentName,
        parentPhone: st.parentPhone,
        address: st.address,
        status: st.status,
      };
    });
  }, [rawClassStudents, syncedJournals, teacherValidations, selectedJournalDate, availableJournalDates]);\n\n  const [localFollowUps, setLocalFollowUps]`;

const startIdx = code.indexOf(originalStudentsListMarker);
const endIdx = code.indexOf(studentsListEndMarker);

if (startIdx !== -1 && endIdx !== -1) {
  code = code.slice(0, startIdx) + newStudentsListBlock + code.slice(endIdx + studentsListEndMarker.length);
  console.log('Inserted new classJournals & studentsList successfully');
} else {
  console.error('Could not find studentsList markers', startIdx, endIdx);
}

// 2. Remove the old classJournals block
const oldClassJournalsTarget = `  // Class journals strictly matched to students in this rombel and school
  const classJournals = useMemo(() => {
    const studentIds = new Set(rawClassStudents.map((s) => s.id));
    const studentNisns = new Set(rawClassStudents.map((s) => s.nisn).filter(Boolean));
    const studentNames = new Set(rawClassStudents.map((s) => s.name.toLowerCase().trim()));
    const normActiveRombel = normalizeClassName(activeRombel.name);

    return syncedJournals.filter((j) => {
      if (j.studentId && (studentIds.has(j.studentId) || studentNisns.has(j.studentId))) return true;
      if (j.studentNisn && (studentNisns.has(j.studentNisn) || studentIds.has(j.studentNisn))) return true;
      if (j.studentName && studentNames.has(j.studentName.toLowerCase().trim())) return true;
      if (j.className && normActiveRombel) {
        const normJ = normalizeClassName(j.className);
        if (normJ === normActiveRombel || normJ.includes(normActiveRombel) || normActiveRombel.includes(normJ)) return true;
      }
      return false;
    });
  }, [rawClassStudents, syncedJournals, activeRombel]);\n\n`;

if (code.includes(oldClassJournalsTarget)) {
  code = code.replace(oldClassJournalsTarget, '');
  console.log('Removed old duplicate classJournals block');
} else {
  console.warn('Old classJournals block not found directly, checking partial');
}

// 3. Update classHabitStats todayJournals to use selectedJournalDate
const oldHabitTodayTarget = `    const todayJournals = classJournals.filter((j) => {
      const d = j.journalDate || (j as any).date;
      return d === localTodayStr || d === utcTodayStr;
    });`;

const newHabitTodayTarget = `    const todayJournals = selectedJournalDate === 'ALL'
      ? classJournals
      : classJournals.filter((j) => {
          const d = j.journalDate || (j as any).date;
          return d === selectedJournalDate;
        });`;

if (code.includes(oldHabitTodayTarget)) {
  code = code.replace(oldHabitTodayTarget, newHabitTodayTarget);
  console.log('Updated classHabitStats todayJournals');
} else {
  console.warn('oldHabitTodayTarget not found');
}

// 4. Update handleValidateAllToday to respect selectedJournalDate
const oldValidateAllTarget = `  const handleValidateAllToday = () => {
    const studentsWithToday = studentsList.filter((s) => s.completedTodayCount > 0 && !s.validatedByTeacher);
    if (studentsWithToday.length === 0) {
      showToast('Semua siswa yang mengisi hari ini sudah tervalidasi.');
      return;
    }

    const updated = { ...teacherValidations };
    studentsWithToday.forEach((s) => {
      updated[s.id] = true;
      if (s.nisn) updated[s.nisn] = true;
    });
    setTeacherValidations(updated);
    saveStoredValidations(updated);

    try {
      const storedJournalsStr = localStorage.getItem('si7kaih_journals_prod');
      if (storedJournalsStr) {
        const list: DailyJournal[] = JSON.parse(storedJournalsStr);
        const idsSet = new Set(studentsWithToday.map((s) => s.id));
        const nisnsSet = new Set(studentsWithToday.map((s) => s.nisn).filter(Boolean));
        const namesSet = new Set(studentsWithToday.map((s) => s.name.toLowerCase().trim()));

        const nextList = list.map((j) => {
          const match =
            (j.studentId && idsSet.has(j.studentId)) ||
            (j.studentNisn && nisnsSet.has(j.studentNisn)) ||
            (j.studentName && namesSet.has(j.studentName.toLowerCase().trim()));
          if (match) {
            const updatedEntries = { ...j.entries };
            if (updatedEntries) {
              Object.keys(updatedEntries).forEach((k) => {
                const hCode = k as HabitCode;
                if (updatedEntries[hCode]) {
                  updatedEntries[hCode] = { ...updatedEntries[hCode], teacherValidated: true };
                }
              });
            }
            return {
              ...j,
              teacherValidated: true,
              teacherValidatedAt: new Date().toISOString(),
              entries: updatedEntries,
            };
          }
          return j;
        });

        localStorage.setItem('si7kaih_journals_prod', JSON.stringify(nextList));
        setSyncedJournals(nextList);
        window.dispatchEvent(new CustomEvent('si7kaih_journals_updated', { detail: nextList }));
        const modifiedJournals = nextList.filter(
          (j) =>
            (j.studentId && idsSet.has(j.studentId)) ||
            (j.studentNisn && nisnsSet.has(j.studentNisn)) ||
            (j.studentName && namesSet.has(j.studentName.toLowerCase().trim()))
        );
        if (modifiedJournals.length > 0) {
          saveAllJournalsToSupabase(modifiedJournals).catch(() => {});
        }
      }
    } catch (_e) {}

    showToast(\`Berhasil memvalidasi \${studentsWithToday.length} siswa yang mengisi hari ini!\`);
  };`;

const newValidateAllTarget = `  const handleValidateAllToday = () => {
    const studentsWithToday = studentsList.filter((s) => s.completedTodayCount > 0 && !s.validatedByTeacher);
    if (studentsWithToday.length === 0) {
      showToast(selectedJournalDate === 'ALL'
        ? 'Semua siswa dalam rentang 20-26 September sudah tervalidasi.'
        : \`Semua siswa untuk tanggal \${getShortDateLabel(selectedJournalDate)} sudah tervalidasi.\`);
      return;
    }

    const updated = { ...teacherValidations };
    studentsWithToday.forEach((s) => {
      updated[s.id] = true;
      if (s.nisn) updated[s.nisn] = true;
      if (selectedJournalDate !== 'ALL') {
        updated[\`\${s.id}_\${selectedJournalDate}\`] = true;
      }
    });
    setTeacherValidations(updated);
    saveStoredValidations(updated);

    try {
      const storedJournalsStr = localStorage.getItem('si7kaih_journals_prod');
      if (storedJournalsStr) {
        const list: DailyJournal[] = JSON.parse(storedJournalsStr);
        const idsSet = new Set(studentsWithToday.map((s) => s.id));
        const nisnsSet = new Set(studentsWithToday.map((s) => s.nisn).filter(Boolean));
        const namesSet = new Set(studentsWithToday.map((s) => s.name.toLowerCase().trim()));

        const nextList = list.map((j) => {
          const matchDate = selectedJournalDate === 'ALL' || (j.journalDate === selectedJournalDate || (j as any).date === selectedJournalDate);
          const match =
            matchDate &&
            ((j.studentId && idsSet.has(j.studentId)) ||
              (j.studentNisn && nisnsSet.has(j.studentNisn)) ||
              (j.studentName && namesSet.has(j.studentName.toLowerCase().trim())));
          if (match) {
            const updatedEntries = { ...j.entries };
            if (updatedEntries) {
              Object.keys(updatedEntries).forEach((k) => {
                const hCode = k as HabitCode;
                if (updatedEntries[hCode]) {
                  updatedEntries[hCode] = { ...updatedEntries[hCode], teacherValidated: true };
                }
              });
            }
            return {
              ...j,
              teacherValidated: true,
              teacherValidatedAt: new Date().toISOString(),
              entries: updatedEntries,
            };
          }
          return j;
        });

        localStorage.setItem('si7kaih_journals_prod', JSON.stringify(nextList));
        setSyncedJournals(nextList);
        window.dispatchEvent(new CustomEvent('si7kaih_journals_updated', { detail: nextList }));
        const modifiedJournals = nextList.filter(
          (j) =>
            (selectedJournalDate === 'ALL' || (j.journalDate === selectedJournalDate || (j as any).date === selectedJournalDate)) &&
            ((j.studentId && idsSet.has(j.studentId)) ||
              (j.studentNisn && nisnsSet.has(j.studentNisn)) ||
              (j.studentName && namesSet.has(j.studentName.toLowerCase().trim())))
        );
        if (modifiedJournals.length > 0) {
          saveAllJournalsToSupabase(modifiedJournals).catch(() => {});
        }
      }
    } catch (_e) {}

    showToast(\`Berhasil memvalidasi \${studentsWithToday.length} siswa untuk \${selectedJournalDate === 'ALL' ? 'seluruh rentang 20-26 September' : \`tanggal \${getShortDateLabel(selectedJournalDate)}\`}!\`);
  };`;

if (code.includes(oldValidateAllTarget)) {
  code = code.replace(oldValidateAllTarget, newValidateAllTarget);
  console.log('Updated handleValidateAllToday');
} else {
  console.warn('oldValidateAllTarget not found');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('All updates written to ' + filePath);
