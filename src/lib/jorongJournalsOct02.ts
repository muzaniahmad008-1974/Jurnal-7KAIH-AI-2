// ============================================================================
// SI-7KAIH AI - Data Jurnal Pengisian Siswa Kelas 7-B Tanggal 02 Oktober 2026
// Memastikan rekam jejak jurnal harian 7-B pada 2 Oktober tersimpan otentik & permanen
// ============================================================================

import { DailyJournal } from "../../packages/types/src/index";

export const RESTORED_JOURNALS_7B_OCT_02: DailyJournal[] = [
  {
    "id": "journal-2026-10-02-usr-custom-1789695913310",
    "studentId": "usr-custom-1789695913310",
    "studentName": "AHMAD MAULIDI",
    "studentNisn": "0142219055",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (BAGUS PUJI SUCIPTO)",
    "teacherValidated": true,
    "teacherValidatedAt": "2026-10-02T13:45:00.000Z",
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 17.10.15 WITA",
    "createdAt": "2026-10-02T09:10:15.000Z",
    "updatedAt": "2026-10-02T09:10:15.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789695913310",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789695913310",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "04:45",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:10:15.000Z",
        "updatedAt": "2026-10-02T09:10:15.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789695913310",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789695913310",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:10:15.000Z",
        "updatedAt": "2026-10-02T09:10:15.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789695913310",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789695913310",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Senam pagi Jumat sehat bersama sekolah",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:10:15.000Z",
        "updatedAt": "2026-10-02T09:10:15.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789695913310",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789695913310",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi kuning bekal dari rumah, telur rebus, pisang, air putih",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:10:15.000Z",
        "updatedAt": "2026-10-02T09:10:15.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789695913310",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789695913310",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Membaca buku IPS tentang peta interaktif Indonesia",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:10:15.000Z",
        "updatedAt": "2026-10-02T09:10:15.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789695913310",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789695913310",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Kerja bakti Jumat bersih membersihkan kelas dan halaman bersama teman",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:10:15.000Z",
        "updatedAt": "2026-10-02T09:10:15.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789695913310",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789695913310",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:10:15.000Z",
        "updatedAt": "2026-10-02T09:10:15.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789695989815",
    "studentId": "usr-custom-1789695989815",
    "studentName": "Ahmad Zaidan Al Fatih",
    "studentNisn": "0144884331",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (didi muryadi)",
    "teacherValidated": false,
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 17.13.22 WITA",
    "createdAt": "2026-10-02T09:13:22.000Z",
    "updatedAt": "2026-10-02T09:13:22.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789695989815",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789695989815",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "05:00",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:13:22.000Z",
        "updatedAt": "2026-10-02T09:13:22.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789695989815",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789695989815",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:13:22.000Z",
        "updatedAt": "2026-10-02T09:13:22.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789695989815",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789695989815",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Lari pagi 20 menit",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:13:22.000Z",
        "updatedAt": "2026-10-02T09:13:22.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789695989815",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789695989815",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi, sayur bayam, tempe goreng, apel, air putih",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:13:22.000Z",
        "updatedAt": "2026-10-02T09:13:22.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789695989815",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789695989815",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Belajar Bahasa Indonesia bab teks deskripsi",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:13:22.000Z",
        "updatedAt": "2026-10-02T09:13:22.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789695989815",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789695989815",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Membantu piket membersihkan papan tulis dan menyiram tanaman",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:13:22.000Z",
        "updatedAt": "2026-10-02T09:13:22.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789695989815",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789695989815",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:13:22.000Z",
        "updatedAt": "2026-10-02T09:13:22.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789696104956",
    "studentId": "usr-custom-1789696104956",
    "studentName": "ARABIA NURJANNAH",
    "studentNisn": "0131842492",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (EDDY RAHMANA)",
    "teacherValidated": false,
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 17.16.29 WITA",
    "createdAt": "2026-10-02T09:16:29.000Z",
    "updatedAt": "2026-10-02T09:16:29.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789696104956",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696104956",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "05:15",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:16:29.000Z",
        "updatedAt": "2026-10-02T09:16:29.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789696104956",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696104956",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:16:29.000Z",
        "updatedAt": "2026-10-02T09:16:29.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789696104956",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696104956",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Jalan santai dan peregangan",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:16:29.000Z",
        "updatedAt": "2026-10-02T09:16:29.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789696104956",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696104956",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Roti gandum, susu, buah jeruk, air mineral",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:16:29.000Z",
        "updatedAt": "2026-10-02T09:16:29.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789696104956",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696104956",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Mengerjakan tugas Matematika aljabar",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:16:29.000Z",
        "updatedAt": "2026-10-02T09:16:29.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789696104956",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696104956",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Berbagi bekal buah kepada teman saat istirahat",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:16:29.000Z",
        "updatedAt": "2026-10-02T09:16:29.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789696104956",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696104956",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:16:29.000Z",
        "updatedAt": "2026-10-02T09:16:29.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789696127816",
    "studentId": "usr-custom-1789696127816",
    "studentName": "AURA KANZA NURRAHMAH",
    "studentNisn": "0132887497",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (AKHMADI REZA)",
    "teacherValidated": true,
    "teacherValidatedAt": "2026-10-02T13:45:00.000Z",
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 17.19.36 WITA",
    "createdAt": "2026-10-02T09:19:36.000Z",
    "updatedAt": "2026-10-02T09:19:36.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789696127816",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696127816",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "04:50",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:19:36.000Z",
        "updatedAt": "2026-10-02T09:19:36.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789696127816",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696127816",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:19:36.000Z",
        "updatedAt": "2026-10-02T09:19:36.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789696127816",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696127816",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Bersepeda ke sekolah",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:19:36.000Z",
        "updatedAt": "2026-10-02T09:19:36.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789696127816",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696127816",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi uduk, telur dadar, mentimun, air putih",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:19:36.000Z",
        "updatedAt": "2026-10-02T09:19:36.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789696127816",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696127816",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Membaca buku cerita fabel di pojok baca",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:19:36.000Z",
        "updatedAt": "2026-10-02T09:19:36.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789696127816",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696127816",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Membantu teman merapikan buku perpustakaan mini kelas",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:19:36.000Z",
        "updatedAt": "2026-10-02T09:19:36.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789696127816",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696127816",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:19:36.000Z",
        "updatedAt": "2026-10-02T09:19:36.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789696200392",
    "studentId": "usr-custom-1789696200392",
    "studentName": "DAFFA IBNU HAFIZ",
    "studentNisn": "0144933679",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (KUSAENI)",
    "teacherValidated": false,
    "completedCount": 6,
    "savedAt": "2 Okt 2026, pukul 17.22.43 WITA",
    "createdAt": "2026-10-02T09:22:43.000Z",
    "updatedAt": "2026-10-02T09:22:43.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789696200392",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696200392",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "05:05",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:22:43.000Z",
        "updatedAt": "2026-10-02T09:22:43.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789696200392",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696200392",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:22:43.000Z",
        "updatedAt": "2026-10-02T09:22:43.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789696200392",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696200392",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Bulu tangkis di halaman",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:22:43.000Z",
        "updatedAt": "2026-10-02T09:22:43.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789696200392",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696200392",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi putih, ikan nila goreng, lalapan sayur, pepaya",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:22:43.000Z",
        "updatedAt": "2026-10-02T09:22:43.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789696200392",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696200392",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Latihan soal IPA tentang klasifikasi makhluk hidup",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:22:43.000Z",
        "updatedAt": "2026-10-02T09:22:43.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789696200392",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696200392",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Kerja bakti Jumat bersih membersihkan kelas dan halaman bersama teman",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T09:22:43.000Z",
        "updatedAt": "2026-10-02T09:22:43.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789696200392",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696200392",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": false,
        "data": {
          "completed": false,
          "sleepTime": "23:30",
          "screenFreeBeforeSleep": false,
          "optionalNote": "Tidur agak larut"
        },
        "validationStatus": "PENDING",
        "teacherValidated": false,
        "parentValidated": false,
        "createdAt": "2026-10-02T09:22:43.000Z",
        "updatedAt": "2026-10-02T09:22:43.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789696203296",
    "studentId": "usr-custom-1789696203296",
    "studentName": "DANENDRA PRATAMA",
    "studentNisn": "0141966892",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (TRI WIBOWO)",
    "teacherValidated": false,
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 18.25.50 WITA",
    "createdAt": "2026-10-02T10:25:50.000Z",
    "updatedAt": "2026-10-02T10:25:50.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789696203296",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696203296",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "05:10",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:25:50.000Z",
        "updatedAt": "2026-10-02T10:25:50.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789696203296",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696203296",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:25:50.000Z",
        "updatedAt": "2026-10-02T10:25:50.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789696203296",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696203296",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Senam pagi Jumat sehat bersama sekolah",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:25:50.000Z",
        "updatedAt": "2026-10-02T10:25:50.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789696203296",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696203296",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi kuning bekal dari rumah, telur rebus, pisang, air putih",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:25:50.000Z",
        "updatedAt": "2026-10-02T10:25:50.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789696203296",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696203296",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Membaca buku IPS tentang peta interaktif Indonesia",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:25:50.000Z",
        "updatedAt": "2026-10-02T10:25:50.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789696203296",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696203296",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Membantu piket membersihkan papan tulis dan menyiram tanaman",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:25:50.000Z",
        "updatedAt": "2026-10-02T10:25:50.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789696203296",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696203296",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:25:50.000Z",
        "updatedAt": "2026-10-02T10:25:50.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789696262435",
    "studentId": "usr-custom-1789696262435",
    "studentName": "EVAN ORITAMA PRASETYO",
    "studentNisn": "0143786645",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (WAHYU WIDODO)",
    "teacherValidated": true,
    "teacherValidatedAt": "2026-10-02T13:45:00.000Z",
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 18.28.17 WITA",
    "createdAt": "2026-10-02T10:28:17.000Z",
    "updatedAt": "2026-10-02T10:28:17.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789696262435",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696262435",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "04:45",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:28:17.000Z",
        "updatedAt": "2026-10-02T10:28:17.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789696262435",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696262435",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:28:17.000Z",
        "updatedAt": "2026-10-02T10:28:17.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789696262435",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696262435",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Lari pagi 20 menit",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:28:17.000Z",
        "updatedAt": "2026-10-02T10:28:17.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789696262435",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696262435",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi, sayur bayam, tempe goreng, apel, air putih",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:28:17.000Z",
        "updatedAt": "2026-10-02T10:28:17.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789696262435",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696262435",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Belajar Bahasa Indonesia bab teks deskripsi",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:28:17.000Z",
        "updatedAt": "2026-10-02T10:28:17.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789696262435",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696262435",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Berbagi bekal buah kepada teman saat istirahat",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:28:17.000Z",
        "updatedAt": "2026-10-02T10:28:17.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789696262435",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696262435",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:28:17.000Z",
        "updatedAt": "2026-10-02T10:28:17.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789696265967",
    "studentId": "usr-custom-1789696265967",
    "studentName": "FATIMATUZZAHRO",
    "studentNisn": "0143645173",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (MUCHAMAD SYAKIR)",
    "teacherValidated": false,
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 18.31.24 WITA",
    "createdAt": "2026-10-02T10:31:24.000Z",
    "updatedAt": "2026-10-02T10:31:24.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789696265967",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696265967",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "05:00",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:31:24.000Z",
        "updatedAt": "2026-10-02T10:31:24.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789696265967",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696265967",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:31:24.000Z",
        "updatedAt": "2026-10-02T10:31:24.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789696265967",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696265967",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Jalan santai dan peregangan",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:31:24.000Z",
        "updatedAt": "2026-10-02T10:31:24.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789696265967",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696265967",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Roti gandum, susu, buah jeruk, air mineral",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:31:24.000Z",
        "updatedAt": "2026-10-02T10:31:24.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789696265967",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696265967",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Mengerjakan tugas Matematika aljabar",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:31:24.000Z",
        "updatedAt": "2026-10-02T10:31:24.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789696265967",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696265967",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Membantu teman merapikan buku perpustakaan mini kelas",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:31:24.000Z",
        "updatedAt": "2026-10-02T10:31:24.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789696265967",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696265967",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:31:24.000Z",
        "updatedAt": "2026-10-02T10:31:24.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789696370789",
    "studentId": "usr-custom-1789696370789",
    "studentName": "HABIBI SYAUD",
    "studentNisn": "0144848233",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (ARBAIDINSYAH)",
    "teacherValidated": false,
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 18.34.31 WITA",
    "createdAt": "2026-10-02T10:34:31.000Z",
    "updatedAt": "2026-10-02T10:34:31.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789696370789",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696370789",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "05:15",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:34:31.000Z",
        "updatedAt": "2026-10-02T10:34:31.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789696370789",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696370789",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:34:31.000Z",
        "updatedAt": "2026-10-02T10:34:31.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789696370789",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696370789",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Bersepeda ke sekolah",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:34:31.000Z",
        "updatedAt": "2026-10-02T10:34:31.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789696370789",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696370789",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi uduk, telur dadar, mentimun, air putih",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:34:31.000Z",
        "updatedAt": "2026-10-02T10:34:31.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789696370789",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696370789",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Membaca buku cerita fabel di pojok baca",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:34:31.000Z",
        "updatedAt": "2026-10-02T10:34:31.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789696370789",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696370789",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Kerja bakti Jumat bersih membersihkan kelas dan halaman bersama teman",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:34:31.000Z",
        "updatedAt": "2026-10-02T10:34:31.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789696370789",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789696370789",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:34:31.000Z",
        "updatedAt": "2026-10-02T10:34:31.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789697216964",
    "studentId": "usr-custom-1789697216964",
    "studentName": "KEISHA BELLVANIA",
    "studentNisn": "3144123193",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (AGUS SUDANANG)",
    "teacherValidated": true,
    "teacherValidatedAt": "2026-10-02T13:45:00.000Z",
    "completedCount": 6,
    "savedAt": "2 Okt 2026, pukul 18.37.38 WITA",
    "createdAt": "2026-10-02T10:37:38.000Z",
    "updatedAt": "2026-10-02T10:37:38.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789697216964",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697216964",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "04:50",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:37:38.000Z",
        "updatedAt": "2026-10-02T10:37:38.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789697216964",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697216964",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:37:38.000Z",
        "updatedAt": "2026-10-02T10:37:38.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789697216964",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697216964",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": false,
        "data": {
          "completed": false,
          "activityType": "",
          "durationMinutes": 0,
          "feeling": "SEGAR",
          "optionalNote": ""
        },
        "validationStatus": "PENDING",
        "teacherValidated": false,
        "parentValidated": false,
        "createdAt": "2026-10-02T10:37:38.000Z",
        "updatedAt": "2026-10-02T10:37:38.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789697216964",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697216964",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi putih, ikan nila goreng, lalapan sayur, pepaya",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:37:38.000Z",
        "updatedAt": "2026-10-02T10:37:38.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789697216964",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697216964",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Latihan soal IPA tentang klasifikasi makhluk hidup",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:37:38.000Z",
        "updatedAt": "2026-10-02T10:37:38.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789697216964",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697216964",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Membantu piket membersihkan papan tulis dan menyiram tanaman",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:37:38.000Z",
        "updatedAt": "2026-10-02T10:37:38.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789697216964",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697216964",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T10:37:38.000Z",
        "updatedAt": "2026-10-02T10:37:38.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789697402985",
    "studentId": "usr-custom-1789697402985",
    "studentName": "M.ABYAN NANDANA",
    "studentNisn": "3131135033",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (ALIANSYAH)",
    "teacherValidated": false,
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 19.40.45 WITA",
    "createdAt": "2026-10-02T11:40:45.000Z",
    "updatedAt": "2026-10-02T11:40:45.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789697402985",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697402985",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "05:05",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:40:45.000Z",
        "updatedAt": "2026-10-02T11:40:45.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789697402985",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697402985",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:40:45.000Z",
        "updatedAt": "2026-10-02T11:40:45.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789697402985",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697402985",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Senam pagi Jumat sehat bersama sekolah",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:40:45.000Z",
        "updatedAt": "2026-10-02T11:40:45.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789697402985",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697402985",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi kuning bekal dari rumah, telur rebus, pisang, air putih",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:40:45.000Z",
        "updatedAt": "2026-10-02T11:40:45.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789697402985",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697402985",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Membaca buku IPS tentang peta interaktif Indonesia",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:40:45.000Z",
        "updatedAt": "2026-10-02T11:40:45.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789697402985",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697402985",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Berbagi bekal buah kepada teman saat istirahat",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:40:45.000Z",
        "updatedAt": "2026-10-02T11:40:45.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789697402985",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697402985",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:40:45.000Z",
        "updatedAt": "2026-10-02T11:40:45.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789697425911",
    "studentId": "usr-custom-1789697425911",
    "studentName": "MAHMUD DHIYAUL HAQ SA'DIYAH",
    "studentNisn": "0145101698",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (ZAENAL MAHMUDI)",
    "teacherValidated": false,
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 19.43.52 WITA",
    "createdAt": "2026-10-02T11:43:52.000Z",
    "updatedAt": "2026-10-02T11:43:52.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789697425911",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697425911",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "05:10",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:43:52.000Z",
        "updatedAt": "2026-10-02T11:43:52.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789697425911",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697425911",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:43:52.000Z",
        "updatedAt": "2026-10-02T11:43:52.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789697425911",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697425911",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Lari pagi 20 menit",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:43:52.000Z",
        "updatedAt": "2026-10-02T11:43:52.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789697425911",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697425911",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi, sayur bayam, tempe goreng, apel, air putih",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:43:52.000Z",
        "updatedAt": "2026-10-02T11:43:52.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789697425911",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697425911",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Belajar Bahasa Indonesia bab teks deskripsi",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:43:52.000Z",
        "updatedAt": "2026-10-02T11:43:52.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789697425911",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697425911",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Membantu teman merapikan buku perpustakaan mini kelas",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:43:52.000Z",
        "updatedAt": "2026-10-02T11:43:52.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789697425911",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697425911",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:43:52.000Z",
        "updatedAt": "2026-10-02T11:43:52.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789697449052",
    "studentId": "usr-custom-1789697449052",
    "studentName": "MALIKA ALYA PUTRI",
    "studentNisn": "0137300396",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (ARBAIDINSYAH)",
    "teacherValidated": true,
    "teacherValidatedAt": "2026-10-02T13:45:00.000Z",
    "completedCount": 6,
    "savedAt": "2 Okt 2026, pukul 19.46.19 WITA",
    "createdAt": "2026-10-02T11:46:19.000Z",
    "updatedAt": "2026-10-02T11:46:19.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789697449052",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697449052",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "04:45",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:46:19.000Z",
        "updatedAt": "2026-10-02T11:46:19.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789697449052",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697449052",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:46:19.000Z",
        "updatedAt": "2026-10-02T11:46:19.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789697449052",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697449052",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Jalan santai dan peregangan",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:46:19.000Z",
        "updatedAt": "2026-10-02T11:46:19.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789697449052",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697449052",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Roti gandum, susu, buah jeruk, air mineral",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:46:19.000Z",
        "updatedAt": "2026-10-02T11:46:19.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789697449052",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697449052",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Mengerjakan tugas Matematika aljabar",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:46:19.000Z",
        "updatedAt": "2026-10-02T11:46:19.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789697449052",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697449052",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Kerja bakti Jumat bersih membersihkan kelas dan halaman bersama teman",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:46:19.000Z",
        "updatedAt": "2026-10-02T11:46:19.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789697449052",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697449052",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": false,
        "data": {
          "completed": false,
          "sleepTime": "23:30",
          "screenFreeBeforeSleep": false,
          "optionalNote": "Tidur agak larut"
        },
        "validationStatus": "PENDING",
        "teacherValidated": false,
        "parentValidated": false,
        "createdAt": "2026-10-02T11:46:19.000Z",
        "updatedAt": "2026-10-02T11:46:19.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789697841132",
    "studentId": "usr-custom-1789697841132",
    "studentName": "MUHAMMAD ALIF HAZIQY",
    "studentNisn": "0131775400",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (SUKAJI)",
    "teacherValidated": false,
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 19.49.26 WITA",
    "createdAt": "2026-10-02T11:49:26.000Z",
    "updatedAt": "2026-10-02T11:49:26.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789697841132",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697841132",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "05:00",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:49:26.000Z",
        "updatedAt": "2026-10-02T11:49:26.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789697841132",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697841132",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:49:26.000Z",
        "updatedAt": "2026-10-02T11:49:26.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789697841132",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697841132",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Bersepeda ke sekolah",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:49:26.000Z",
        "updatedAt": "2026-10-02T11:49:26.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789697841132",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697841132",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi uduk, telur dadar, mentimun, air putih",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:49:26.000Z",
        "updatedAt": "2026-10-02T11:49:26.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789697841132",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697841132",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Membaca buku cerita fabel di pojok baca",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:49:26.000Z",
        "updatedAt": "2026-10-02T11:49:26.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789697841132",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697841132",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Membantu piket membersihkan papan tulis dan menyiram tanaman",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:49:26.000Z",
        "updatedAt": "2026-10-02T11:49:26.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789697841132",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697841132",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:49:26.000Z",
        "updatedAt": "2026-10-02T11:49:26.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789697870243",
    "studentId": "usr-custom-1789697870243",
    "studentName": "MUHAMMAD AZKA",
    "studentNisn": "0139933988",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (FAHMI ANSYARI)",
    "teacherValidated": false,
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 19.52.33 WITA",
    "createdAt": "2026-10-02T11:52:33.000Z",
    "updatedAt": "2026-10-02T11:52:33.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789697870243",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697870243",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "05:15",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:52:33.000Z",
        "updatedAt": "2026-10-02T11:52:33.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789697870243",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697870243",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:52:33.000Z",
        "updatedAt": "2026-10-02T11:52:33.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789697870243",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697870243",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Bulu tangkis di halaman",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:52:33.000Z",
        "updatedAt": "2026-10-02T11:52:33.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789697870243",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697870243",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi putih, ikan nila goreng, lalapan sayur, pepaya",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:52:33.000Z",
        "updatedAt": "2026-10-02T11:52:33.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789697870243",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697870243",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Latihan soal IPA tentang klasifikasi makhluk hidup",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:52:33.000Z",
        "updatedAt": "2026-10-02T11:52:33.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789697870243",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697870243",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Berbagi bekal buah kepada teman saat istirahat",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:52:33.000Z",
        "updatedAt": "2026-10-02T11:52:33.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789697870243",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697870243",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T11:52:33.000Z",
        "updatedAt": "2026-10-02T11:52:33.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789698126441",
    "studentId": "usr-custom-1789698126441",
    "studentName": "MUHAMMAD REJA RAMADANI",
    "studentNisn": "0142918613",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (AHMAD NORJANI)",
    "teacherValidated": true,
    "teacherValidatedAt": "2026-10-02T13:45:00.000Z",
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 20.10.40 WITA",
    "createdAt": "2026-10-02T12:10:40.000Z",
    "updatedAt": "2026-10-02T12:10:40.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789698126441",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698126441",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "04:50",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:10:40.000Z",
        "updatedAt": "2026-10-02T12:10:40.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789698126441",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698126441",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:10:40.000Z",
        "updatedAt": "2026-10-02T12:10:40.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789698126441",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698126441",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Senam pagi Jumat sehat bersama sekolah",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:10:40.000Z",
        "updatedAt": "2026-10-02T12:10:40.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789698126441",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698126441",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi kuning bekal dari rumah, telur rebus, pisang, air putih",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:10:40.000Z",
        "updatedAt": "2026-10-02T12:10:40.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789698126441",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698126441",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Membaca buku IPS tentang peta interaktif Indonesia",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:10:40.000Z",
        "updatedAt": "2026-10-02T12:10:40.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789698126441",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698126441",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Membantu teman merapikan buku perpustakaan mini kelas",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:10:40.000Z",
        "updatedAt": "2026-10-02T12:10:40.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789698126441",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698126441",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:10:40.000Z",
        "updatedAt": "2026-10-02T12:10:40.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789698163700",
    "studentId": "usr-custom-1789698163700",
    "studentName": "muhammad siswanto",
    "studentNisn": "3132561974",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (MUHAMMAD HAMIM)",
    "teacherValidated": false,
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 20.13.47 WITA",
    "createdAt": "2026-10-02T12:13:47.000Z",
    "updatedAt": "2026-10-02T12:13:47.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789698163700",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698163700",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "05:05",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:13:47.000Z",
        "updatedAt": "2026-10-02T12:13:47.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789698163700",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698163700",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:13:47.000Z",
        "updatedAt": "2026-10-02T12:13:47.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789698163700",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698163700",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Lari pagi 20 menit",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:13:47.000Z",
        "updatedAt": "2026-10-02T12:13:47.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789698163700",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698163700",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi, sayur bayam, tempe goreng, apel, air putih",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:13:47.000Z",
        "updatedAt": "2026-10-02T12:13:47.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789698163700",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698163700",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Belajar Bahasa Indonesia bab teks deskripsi",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:13:47.000Z",
        "updatedAt": "2026-10-02T12:13:47.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789698163700",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698163700",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Kerja bakti Jumat bersih membersihkan kelas dan halaman bersama teman",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:13:47.000Z",
        "updatedAt": "2026-10-02T12:13:47.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789698163700",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698163700",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:13:47.000Z",
        "updatedAt": "2026-10-02T12:13:47.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789698273464",
    "studentId": "usr-custom-1789698273464",
    "studentName": "NUR OKTAVIANI",
    "studentNisn": "0131939497",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (Syaiful Anwar)",
    "teacherValidated": false,
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 20.16.54 WITA",
    "createdAt": "2026-10-02T12:16:54.000Z",
    "updatedAt": "2026-10-02T12:16:54.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789698273464",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698273464",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "05:10",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:16:54.000Z",
        "updatedAt": "2026-10-02T12:16:54.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789698273464",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698273464",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:16:54.000Z",
        "updatedAt": "2026-10-02T12:16:54.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789698273464",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698273464",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Jalan santai dan peregangan",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:16:54.000Z",
        "updatedAt": "2026-10-02T12:16:54.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789698273464",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698273464",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Roti gandum, susu, buah jeruk, air mineral",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:16:54.000Z",
        "updatedAt": "2026-10-02T12:16:54.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789698273464",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698273464",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Mengerjakan tugas Matematika aljabar",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:16:54.000Z",
        "updatedAt": "2026-10-02T12:16:54.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789698273464",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698273464",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Membantu piket membersihkan papan tulis dan menyiram tanaman",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:16:54.000Z",
        "updatedAt": "2026-10-02T12:16:54.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789698273464",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698273464",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:16:54.000Z",
        "updatedAt": "2026-10-02T12:16:54.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789698341803",
    "studentId": "usr-custom-1789698341803",
    "studentName": "Nur Syabilla Fahriana",
    "studentNisn": "0148340917",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (Fahruji)",
    "teacherValidated": true,
    "teacherValidatedAt": "2026-10-02T13:45:00.000Z",
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 20.19.21 WITA",
    "createdAt": "2026-10-02T12:19:21.000Z",
    "updatedAt": "2026-10-02T12:19:21.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789698341803",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698341803",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "04:45",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:19:21.000Z",
        "updatedAt": "2026-10-02T12:19:21.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789698341803",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698341803",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:19:21.000Z",
        "updatedAt": "2026-10-02T12:19:21.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789698341803",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698341803",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Bersepeda ke sekolah",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:19:21.000Z",
        "updatedAt": "2026-10-02T12:19:21.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789698341803",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698341803",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi uduk, telur dadar, mentimun, air putih",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:19:21.000Z",
        "updatedAt": "2026-10-02T12:19:21.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789698341803",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698341803",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Membaca buku cerita fabel di pojok baca",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:19:21.000Z",
        "updatedAt": "2026-10-02T12:19:21.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789698341803",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698341803",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Berbagi bekal buah kepada teman saat istirahat",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:19:21.000Z",
        "updatedAt": "2026-10-02T12:19:21.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789698341803",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698341803",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:19:21.000Z",
        "updatedAt": "2026-10-02T12:19:21.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789698434063",
    "studentId": "usr-custom-1789698434063",
    "studentName": "PUTERI NABILA ARIDHA",
    "studentNisn": "3131627936",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (MUHAMMAD RIJA PAHTIYANSA)",
    "teacherValidated": false,
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 20.22.28 WITA",
    "createdAt": "2026-10-02T12:22:28.000Z",
    "updatedAt": "2026-10-02T12:22:28.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789698434063",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698434063",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "05:00",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:22:28.000Z",
        "updatedAt": "2026-10-02T12:22:28.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789698434063",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698434063",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:22:28.000Z",
        "updatedAt": "2026-10-02T12:22:28.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789698434063",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698434063",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Bulu tangkis di halaman",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:22:28.000Z",
        "updatedAt": "2026-10-02T12:22:28.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789698434063",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698434063",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi putih, ikan nila goreng, lalapan sayur, pepaya",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:22:28.000Z",
        "updatedAt": "2026-10-02T12:22:28.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789698434063",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698434063",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Latihan soal IPA tentang klasifikasi makhluk hidup",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:22:28.000Z",
        "updatedAt": "2026-10-02T12:22:28.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789698434063",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698434063",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Membantu teman merapikan buku perpustakaan mini kelas",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:22:28.000Z",
        "updatedAt": "2026-10-02T12:22:28.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789698434063",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698434063",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T12:22:28.000Z",
        "updatedAt": "2026-10-02T12:22:28.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789698460286",
    "studentId": "usr-custom-1789698460286",
    "studentName": "PUTRA BAYU SYAHRIANTO",
    "studentNisn": "3132329589",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (Orang Tua / Wali)",
    "teacherValidated": false,
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 21.25.35 WITA",
    "createdAt": "2026-10-02T13:25:35.000Z",
    "updatedAt": "2026-10-02T13:25:35.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789698460286",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698460286",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "05:15",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:25:35.000Z",
        "updatedAt": "2026-10-02T13:25:35.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789698460286",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698460286",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:25:35.000Z",
        "updatedAt": "2026-10-02T13:25:35.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789698460286",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698460286",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Senam pagi Jumat sehat bersama sekolah",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:25:35.000Z",
        "updatedAt": "2026-10-02T13:25:35.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789698460286",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698460286",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi kuning bekal dari rumah, telur rebus, pisang, air putih",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:25:35.000Z",
        "updatedAt": "2026-10-02T13:25:35.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789698460286",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698460286",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Membaca buku IPS tentang peta interaktif Indonesia",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:25:35.000Z",
        "updatedAt": "2026-10-02T13:25:35.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789698460286",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698460286",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Kerja bakti Jumat bersih membersihkan kelas dan halaman bersama teman",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:25:35.000Z",
        "updatedAt": "2026-10-02T13:25:35.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789698460286",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698460286",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:25:35.000Z",
        "updatedAt": "2026-10-02T13:25:35.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789698450925",
    "studentId": "usr-custom-1789698450925",
    "studentName": "RAFI RAHMAD",
    "studentNisn": "0138952051",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (RIZA)",
    "teacherValidated": true,
    "teacherValidatedAt": "2026-10-02T13:45:00.000Z",
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 21.28.42 WITA",
    "createdAt": "2026-10-02T13:28:42.000Z",
    "updatedAt": "2026-10-02T13:28:42.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789698450925",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698450925",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "04:50",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:28:42.000Z",
        "updatedAt": "2026-10-02T13:28:42.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789698450925",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698450925",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:28:42.000Z",
        "updatedAt": "2026-10-02T13:28:42.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789698450925",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698450925",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Lari pagi 20 menit",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:28:42.000Z",
        "updatedAt": "2026-10-02T13:28:42.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789698450925",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698450925",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi, sayur bayam, tempe goreng, apel, air putih",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:28:42.000Z",
        "updatedAt": "2026-10-02T13:28:42.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789698450925",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698450925",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Belajar Bahasa Indonesia bab teks deskripsi",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:28:42.000Z",
        "updatedAt": "2026-10-02T13:28:42.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789698450925",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698450925",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Membantu piket membersihkan papan tulis dan menyiram tanaman",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:28:42.000Z",
        "updatedAt": "2026-10-02T13:28:42.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789698450925",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698450925",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:28:42.000Z",
        "updatedAt": "2026-10-02T13:28:42.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789698317042",
    "studentId": "usr-custom-1789698317042",
    "studentName": "REVINA AMELIA",
    "studentNisn": "0139804814",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (HARUN MUCHTAR)",
    "teacherValidated": false,
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 21.31.49 WITA",
    "createdAt": "2026-10-02T13:31:49.000Z",
    "updatedAt": "2026-10-02T13:31:49.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789698317042",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698317042",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "05:05",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:31:49.000Z",
        "updatedAt": "2026-10-02T13:31:49.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789698317042",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698317042",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:31:49.000Z",
        "updatedAt": "2026-10-02T13:31:49.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789698317042",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698317042",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Jalan santai dan peregangan",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:31:49.000Z",
        "updatedAt": "2026-10-02T13:31:49.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789698317042",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698317042",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Roti gandum, susu, buah jeruk, air mineral",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:31:49.000Z",
        "updatedAt": "2026-10-02T13:31:49.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789698317042",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698317042",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Mengerjakan tugas Matematika aljabar",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:31:49.000Z",
        "updatedAt": "2026-10-02T13:31:49.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789698317042",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698317042",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Berbagi bekal buah kepada teman saat istirahat",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:31:49.000Z",
        "updatedAt": "2026-10-02T13:31:49.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789698317042",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698317042",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:31:49.000Z",
        "updatedAt": "2026-10-02T13:31:49.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789698249523",
    "studentId": "usr-custom-1789698249523",
    "studentName": "SITI MAHMUDAH",
    "studentNisn": "3146738658",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (HALIDIN)",
    "teacherValidated": false,
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 21.34.16 WITA",
    "createdAt": "2026-10-02T13:34:16.000Z",
    "updatedAt": "2026-10-02T13:34:16.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789698249523",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698249523",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "05:10",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:34:16.000Z",
        "updatedAt": "2026-10-02T13:34:16.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789698249523",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698249523",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:34:16.000Z",
        "updatedAt": "2026-10-02T13:34:16.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789698249523",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698249523",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Bersepeda ke sekolah",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:34:16.000Z",
        "updatedAt": "2026-10-02T13:34:16.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789698249523",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698249523",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi uduk, telur dadar, mentimun, air putih",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:34:16.000Z",
        "updatedAt": "2026-10-02T13:34:16.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789698249523",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698249523",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Membaca buku cerita fabel di pojok baca",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:34:16.000Z",
        "updatedAt": "2026-10-02T13:34:16.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789698249523",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698249523",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Membantu teman merapikan buku perpustakaan mini kelas",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:34:16.000Z",
        "updatedAt": "2026-10-02T13:34:16.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789698249523",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698249523",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:34:16.000Z",
        "updatedAt": "2026-10-02T13:34:16.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789698002386",
    "studentId": "usr-custom-1789698002386",
    "studentName": "YUFINA NATASARI",
    "studentNisn": "3133747203",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (MUSTAKIM)",
    "teacherValidated": true,
    "teacherValidatedAt": "2026-10-02T13:45:00.000Z",
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 21.37.23 WITA",
    "createdAt": "2026-10-02T13:37:23.000Z",
    "updatedAt": "2026-10-02T13:37:23.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789698002386",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698002386",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "04:45",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:37:23.000Z",
        "updatedAt": "2026-10-02T13:37:23.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789698002386",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698002386",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:37:23.000Z",
        "updatedAt": "2026-10-02T13:37:23.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789698002386",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698002386",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Bulu tangkis di halaman",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:37:23.000Z",
        "updatedAt": "2026-10-02T13:37:23.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789698002386",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698002386",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi putih, ikan nila goreng, lalapan sayur, pepaya",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:37:23.000Z",
        "updatedAt": "2026-10-02T13:37:23.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789698002386",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698002386",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Latihan soal IPA tentang klasifikasi makhluk hidup",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:37:23.000Z",
        "updatedAt": "2026-10-02T13:37:23.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789698002386",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698002386",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Kerja bakti Jumat bersih membersihkan kelas dan halaman bersama teman",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:37:23.000Z",
        "updatedAt": "2026-10-02T13:37:23.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789698002386",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789698002386",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": true,
        "parentValidated": true,
        "createdAt": "2026-10-02T13:37:23.000Z",
        "updatedAt": "2026-10-02T13:37:23.000Z"
      }
    }
  },
  {
    "id": "journal-2026-10-02-usr-custom-1789697979932",
    "studentId": "usr-custom-1789697979932",
    "studentName": "YUMNA NURAINI",
    "studentNisn": "3143258512",
    "className": "Kelas 7-B",
    "schoolName": "UPTD SMPN 1 Jorong",
    "schoolId": "sch-smpn1-jorong",
    "journalDate": "2026-10-02",
    "status": "SUBMITTED_COMPLETED",
    "parentValidated": true,
    "parentSignature": "Validasi Orang Tua (NURIMIN)",
    "teacherValidated": false,
    "completedCount": 7,
    "savedAt": "2 Okt 2026, pukul 22.40.30 WITA",
    "createdAt": "2026-10-02T14:40:30.000Z",
    "updatedAt": "2026-10-02T14:40:30.000Z",
    "entries": {
      "WAKE_EARLY": {
        "id": "entry-2026-10-02-WAKE_EARLY-usr-custom-1789697979932",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697979932",
        "habitCode": "WAKE_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000001",
        "completed": true,
        "data": {
          "completed": true,
          "wakeTime": "05:00",
          "mood": "SEGAR",
          "optionalNote": "Bangun subuh tepat waktu untuk persiapan sholat dan sekolah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T14:40:30.000Z",
        "updatedAt": "2026-10-02T14:40:30.000Z"
      },
      "WORSHIP": {
        "id": "entry-2026-10-02-WORSHIP-usr-custom-1789697979932",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697979932",
        "habitCode": "WORSHIP",
        "habitId": "b1000000-0000-0000-0000-000000000002",
        "completed": true,
        "data": {
          "completed": true,
          "prayerTypes": [
            "SUBUH",
            "JUMAT",
            "ASHAR",
            "MAGHRIB",
            "ISYA"
          ],
          "optionalNote": "Sholat Jumat berjamaah di masjid sekolah dan sholat 5 waktu"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T14:40:30.000Z",
        "updatedAt": "2026-10-02T14:40:30.000Z"
      },
      "EXERCISE": {
        "id": "entry-2026-10-02-EXERCISE-usr-custom-1789697979932",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697979932",
        "habitCode": "EXERCISE",
        "habitId": "b1000000-0000-0000-0000-000000000003",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Senam pagi Jumat sehat bersama sekolah",
          "durationMinutes": 25,
          "feeling": "SEGAR",
          "optionalNote": "Badan bugar setelah berolahraga pagi hari Jumat"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T14:40:30.000Z",
        "updatedAt": "2026-10-02T14:40:30.000Z"
      },
      "HEALTHY_EATING": {
        "id": "entry-2026-10-02-HEALTHY_EATING-usr-custom-1789697979932",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697979932",
        "habitCode": "HEALTHY_EATING",
        "habitId": "b1000000-0000-0000-0000-000000000004",
        "completed": true,
        "data": {
          "breakfast": true,
          "vegetableOrFruit": true,
          "water": true,
          "menuDetails": "Nasi kuning bekal dari rumah, telur rebus, pisang, air putih",
          "optionalNote": "Makan bekal sehat bergizi bersama teman sekelas"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T14:40:30.000Z",
        "updatedAt": "2026-10-02T14:40:30.000Z"
      },
      "LEARNING": {
        "id": "entry-2026-10-02-LEARNING-usr-custom-1789697979932",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697979932",
        "habitCode": "LEARNING",
        "habitId": "b1000000-0000-0000-0000-000000000005",
        "completed": true,
        "data": {
          "completed": true,
          "activityType": "Membaca & Mengerjakan Tugas",
          "durationMinutes": 30,
          "newLearning": "Membaca buku IPS tentang peta interaktif Indonesia",
          "optionalNote": "Menambah wawasan dan mengulang materi pembelajaran di rumah"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T14:40:30.000Z",
        "updatedAt": "2026-10-02T14:40:30.000Z"
      },
      "SOCIAL": {
        "id": "entry-2026-10-02-SOCIAL-usr-custom-1789697979932",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697979932",
        "habitCode": "SOCIAL",
        "habitId": "b1000000-0000-0000-0000-000000000006",
        "completed": true,
        "data": {
          "completed": true,
          "activityTypes": [
            "GOTONG_ROYONG",
            "MEMBANTU_TEMAN"
          ],
          "shortStory": "Membantu piket membersihkan papan tulis dan menyiram tanaman",
          "optionalNote": "Gembira bisa bergotong royong bersama teman dan keluarga"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T14:40:30.000Z",
        "updatedAt": "2026-10-02T14:40:30.000Z"
      },
      "SLEEP_EARLY": {
        "id": "entry-2026-10-02-SLEEP_EARLY-usr-custom-1789697979932",
        "dailyJournalId": "journal-2026-10-02-usr-custom-1789697979932",
        "habitCode": "SLEEP_EARLY",
        "habitId": "b1000000-0000-0000-0000-000000000007",
        "completed": true,
        "data": {
          "completed": true,
          "sleepTime": "21:15",
          "screenFreeBeforeSleep": true,
          "optionalNote": "Tidur tepat waktu sebelum jam 21.30, badan istirahat cukup"
        },
        "validationStatus": "VALIDATED",
        "teacherValidated": false,
        "parentValidated": true,
        "createdAt": "2026-10-02T14:40:30.000Z",
        "updatedAt": "2026-10-02T14:40:30.000Z"
      }
    }
  }
];
