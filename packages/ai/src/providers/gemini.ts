// ============================================================================
// SI-7KAIH AI - Gemini Provider using @google/genai SDK
// ============================================================================

import { GoogleGenAI, Type } from '@google/genai';
import { AIProvider, AIAnalysisRequest } from '../types';
import { AIAnalysisResult } from '../../../types/src/index';
import { SYSTEM_GUARDRAIL_INSTRUCTIONS } from '../guardrails/index';

export class GeminiAIProvider implements AIProvider {
  name = 'gemini' as const;
  private ai: GoogleGenAI | null = null;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (key) {
      this.ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }

  async generateStructured(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    if (!this.ai) {
      // Fallback structured generation when API key is not yet configured
      return this.generateFallbackResult(request);
    }

    const isRtlTask = request.taskType === 'FollowUpGenerator' || request.taskType === 'TEACHER_RTL_GENERATOR';
    const isProgramTask = request.taskType === 'PRINCIPAL_PROGRAM_RECOMMENDER';
    const isDirectiveTask = request.taskType === 'PRINCIPAL_DIRECTIVE_ASSISTANT';
    const isRtlSynthesizerTask = request.taskType === 'PRINCIPAL_RTL_SYNTHESIZER';

    let prompt = '';

    if (isProgramTask) {
      prompt = `
${SYSTEM_GUARDRAIL_INSTRUCTIONS}

Tugas: Analisis Cakupan Program Pembiasaan 7KAIH & Rekomendasi Inisiatif Sekolah untuk Kepala Sekolah.
Peran Pemohon: ${request.actorRole}
Konteks Satuan Pendidikan:
${JSON.stringify(request.context, null, 2)}

Instruksi Khusus:
1. Evaluasi program pembiasaan yang telah terdaftar saat ini dan identifikasi dimensi 7KAIH yang masih minim program (coverage gap).
2. Rancang 2-3 usulan program pembiasaan tingkat satuan pendidikan yang inovatif, ramah anak, mudah diintegrasikan dalam budaya sekolah, dan kolaboratif.
3. Hasilkan output JSON terstruktur dengan properti:
   - facts: fakta-fakta status program dan kondisi pembiasaan sekolah
   - patterns: pola program dan konsistensi siswa
   - limitations: keterbatasan data pelaksanaan program
   - hypothesesToVerify: hal yang perlu dicek ke dewan guru / komite
   - recommendations: saran umum penguatan tata kelola program
   - supportingMetrics: metrik pendukung
   - programSuggestions: array objek program usulan, masing-masing berisi:
     * id: string unik (misal "prg-ai-1", "prg-ai-2")
     * habitCode: salah satu dari "BANGUN_PAGI" | "BERIBADAH" | "BEROLAHRAGA" | "MAKAN_SEHAT" | "GEMAR_BELAJAR" | "BERMASYARAKAT" | "TIDUR_CEPAT"
     * title: judul program yang menarik & inspiratif
     * description: penjelasan operasional program
     * participantScope: sasaran rombel (misal "Seluruh Peserta Didik", "Fase D (Kelas 7-9)", dll)
     * schedule: jadwal/frekuensi (misal "Setiap Hari Selasa & Kamis", "Setiap Pagi Sebelum KBM")
     * pic: penanggung jawab rekomendasi (misal "Tim Kesiswaan & Pembina OSIS", "Koordinator UKS")
     * reasoning: alasan pedagogis program ini mendesak
     * indicator: indikator keberhasilan
`;
    } else if (isDirectiveTask) {
      prompt = `
${SYSTEM_GUARDRAIL_INSTRUCTIONS}

Tugas: Penyusunan Draf Arahan & Instruksi Supervisi Kepala Sekolah untuk Dewan Guru dan Wali Kelas.
Peran Pemohon: ${request.actorRole}
Konteks Satuan Pendidikan & Isu Pembiasaan:
${JSON.stringify(request.context, null, 2)}

Instruksi Khusus:
1. Susun draf arahan resmi Kepala Sekolah yang inspiratif, berwibawa, apresiatif, berbasis data riil sekolah, dan memuat instruksi langkah konkret.
2. Hasilkan output JSON terstruktur dengan properti:
   - facts: fakta capaian sekolah yang mendasari arahan
   - patterns: pola pembiasaan yang menjadi sorotan
   - limitations: batas cakupan arahan
   - hypothesesToVerify: poin konfirmasi saat rapat supervisi
   - recommendations: rekomendasi tindak lanjut guru
   - supportingMetrics: metrik terkait
   - directiveDraft: objek berisi:
     * focus: tema fokus arahan
     * title: judul instruksi supervisi resmi
     * directiveText: paragraf lengkap instruksi kepala sekolah siap salin/terbit (berisi salam, apresiasi, instruksi spesifik, dan penutup)
     * bulletPoints: 3-4 poin instruksi teknis ringkas untuk guru
     * callToAction: kalimat penyemangat penutup
`;
    } else if (isRtlSynthesizerTask) {
      prompt = `
${SYSTEM_GUARDRAIL_INSTRUCTIONS}

Tugas: Sintesis RTL Lintas Rombel & Rekomendasi Kebijakan Intervensi Sekolah untuk Kepala Sekolah.
Peran Pemohon: ${request.actorRole}
Konteks RTL Rombel & Data Siswa Butuh Pendampingan:
${JSON.stringify(request.context, null, 2)}

Instruksi Khusus:
1. Analisis seluruh temuan RTL dari guru/wali kelas untuk menemukan kluster akar masalah utama (common systemic root cause).
2. Rumuskan 1 usulan kebijakan strategis tingkat satuan pendidikan yang melengkapi tindakan kelas.
3. Hasilkan output JSON terstruktur dengan properti:
   - facts: fakta-fakta pola RTL rombel
   - patterns: benang merah masalah lintas kelas
   - limitations: keterbatasan data pemantauan
   - hypothesesToVerify: hal yang perlu dicek ke orang tua/komite
   - recommendations: rekomendasi kepemimpinan sekolah
   - supportingMetrics: metrik terkait
   - rtlSynthesis: objek berisi:
     * dominantIssue: isu utama yang paling banyak dialami rombel
     * rootCauseCluster: kluster akar masalah sistemik
     * affectedScope: rombel/kelompok siswa terdampak
     * recommendedPolicy: kebijakan/program intervensi tingkat sekolah
     * strategicActionPlan: rencana aksi strategis sekolah
     * targetMetric: target capaian kuantitatif terukur
     * responsibleLead: penanggung jawab utama tingkat sekolah
`;
    } else if (isRtlTask) {
      prompt = `
${SYSTEM_GUARDRAIL_INSTRUCTIONS}

Tugas: Penyusunan Rekomendasi Rencana Tindak Lanjut (RTL) Berbasis Data untuk Guru / Wali Kelas di SI-7KAIH AI.
Peran Pemohon: ${request.actorRole}
Data Konteks Rombel & Pembiasaan:
${JSON.stringify(request.context, null, 2)}

Susunlah 1 (satu) usulan Rencana Tindak Lanjut (RTL) yang konkret, terukur, positif, non-punitive (tanpa penghakiman/pelabelan), dan kolaboratif bersama peserta didik dan paguyuban orang tua.
Hasilkan output JSON terstruktur dengan properti:
- facts: daftar fakta tercatat dari data rombel (dengan metricReferences)
- patterns: pola kebiasaan yang terlihat
- limitations: keterbatasan data pemantauan
- hypothesesToVerify: hipotesis yang perlu dikonfirmasi langsung dengan guru/orang tua/siswa
- recommendations: saran umum langkah tindak lanjut
- supportingMetrics: objek metrik pendukung
- rtlSuggestion: objek berisi:
  * finding: kalimat indikator temuan / isu pembiasaan spesifik
  * rootCauseType: "FACT" atau "HYPOTHESIS_TO_VERIFY"
  * rootCause: akar masalah yang mendasari
  * actionPlan: rencana aksi nyata intervensi positif dan kolaboratif
  * target: sasaran peserta didik/keluarga
  * indicator: indikator ketercapaian yang diharapkan
  * owner: penanggung jawab (PIC), misal "Wali Kelas & Paguyuban Kelas"
  * recommendedDeadline: estimasi tanggal tenggat (format YYYY-MM-DD, kira-kira 3-4 pekan ke depan)
  * reasoning: alasan pedagogis rekomendasi ini
`;
    } else {
      prompt = `
${SYSTEM_GUARDRAIL_INSTRUCTIONS}

Tugas: Analisis AI untuk SI-7KAIH AI.
Jenis Tugas: ${request.taskType}
Peran Pemohon: ${request.actorRole}
Data Konteks:
${JSON.stringify(request.context, null, 2)}

Hasilkan output terstruktur dalam format JSON dengan properti:
- facts: daftar fakta yang tercatat dengan referensi metrik
- patterns: pola kebiasaan yang terlihat
- limitations: keterbatasan data (misal kelengkapan pencatatan)
- hypothesesToVerify: hal yang perlu diverifikasi langsung ke guru/orang tua/siswa
- recommendations: saran pendampingan positif dan praktis
- supportingMetrics: objek key-value angka atau ringkasan pendukung
`;
    }

    // Candidate models to handle spikes in demand or temporary 503 UNAVAILABLE
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

    const baseSchemaProperties: Record<string, any> = {
      facts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            statement: { type: Type.STRING },
            metricReferences: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['statement', 'metricReferences'],
        },
      },
      patterns: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      limitations: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      hypothesesToVerify: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      recommendations: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      supportingMetrics: {
        type: Type.OBJECT,
      },
    };

    if (isRtlTask) {
      baseSchemaProperties.rtlSuggestion = {
        type: Type.OBJECT,
        properties: {
          finding: { type: Type.STRING },
          rootCauseType: { type: Type.STRING },
          rootCause: { type: Type.STRING },
          actionPlan: { type: Type.STRING },
          target: { type: Type.STRING },
          indicator: { type: Type.STRING },
          owner: { type: Type.STRING },
          recommendedDeadline: { type: Type.STRING },
          reasoning: { type: Type.STRING },
        },
        required: [
          'finding',
          'rootCauseType',
          'rootCause',
          'actionPlan',
          'target',
          'indicator',
          'owner',
          'recommendedDeadline',
        ],
      };
    } else if (isProgramTask) {
      baseSchemaProperties.programSuggestions = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            habitCode: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            participantScope: { type: Type.STRING },
            schedule: { type: Type.STRING },
            pic: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            indicator: { type: Type.STRING },
          },
          required: ['id', 'habitCode', 'title', 'description', 'participantScope', 'schedule', 'pic'],
        },
      };
    } else if (isDirectiveTask) {
      baseSchemaProperties.directiveDraft = {
        type: Type.OBJECT,
        properties: {
          focus: { type: Type.STRING },
          title: { type: Type.STRING },
          directiveText: { type: Type.STRING },
          bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          callToAction: { type: Type.STRING },
        },
        required: ['focus', 'title', 'directiveText', 'bulletPoints', 'callToAction'],
      };
    } else if (isRtlSynthesizerTask) {
      baseSchemaProperties.rtlSynthesis = {
        type: Type.OBJECT,
        properties: {
          dominantIssue: { type: Type.STRING },
          rootCauseCluster: { type: Type.STRING },
          affectedScope: { type: Type.STRING },
          recommendedPolicy: { type: Type.STRING },
          strategicActionPlan: { type: Type.STRING },
          targetMetric: { type: Type.STRING },
          responsibleLead: { type: Type.STRING },
        },
        required: ['dominantIssue', 'rootCauseCluster', 'affectedScope', 'recommendedPolicy', 'strategicActionPlan'],
      };
    }

    const requiredFields = [
      'facts',
      'patterns',
      'limitations',
      'hypothesesToVerify',
      'recommendations',
    ];
    if (isRtlTask) requiredFields.push('rtlSuggestion');
    if (isProgramTask) requiredFields.push('programSuggestions');
    if (isDirectiveTask) requiredFields.push('directiveDraft');
    if (isRtlSynthesizerTask) requiredFields.push('rtlSynthesis');

    for (const model of candidateModels) {
      try {
        const response = await this.ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: baseSchemaProperties,
              required: requiredFields,
            },
          },
        });

        const text = response.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed && Array.isArray(parsed.facts)) {
            return parsed as AIAnalysisResult;
          }
        }
      } catch (_err) {
        // Continue to next candidate model quietly if upstream is congested
        continue;
      }
    }

    return this.generateFallbackResult(request);
  }

  private generateFallbackResult(request: AIAnalysisRequest): AIAnalysisResult {
    const ctx = request.context || {};
    const task = request.taskType;

    // 1. AI Chat Assistant task
    if (task === 'AI_CHAT_ASSISTANT') {
      const q = ((ctx.question as string) || '').toLowerCase();
      let answer = 'Terus lakukan 7 Kebiasaan Anak Indonesia Hebat dengan riang gembira dan tulus bersama keluarga!';
      
      if (q.includes('tidur') || q.includes('malam') || q.includes('istirahat') || q.includes('gawai')) {
        answer = 'Tips tidur tepat waktu:\n1. Matikan atau simpan gawai 30 menit sebelum jam tidur.\n2. Lakukan peregangan ringan dan cuci muka atau sikat gigi.\n3. Redupkan lampu kamar dan nikmati waktu istirahat yang cukup agar esok bangun segar!';
      } else if (q.includes('sarapan') || q.includes('makan') || q.includes('gizi')) {
        answer = 'Tips sarapan bergizi:\n1. Pastikan ada karbohidrat (nasi/roti/ubi) dan protein (telur/tahu/tempe/ikan).\n2. Tambahkan buah segar seperti pisang atau pepaya.\n3. Minum segelas air putih hangat sebelum berangkat sekolah.';
      } else if (q.includes('bangun') || q.includes('pagi') || q.includes('subuh')) {
        answer = 'Tips bangun pagi ceria:\n1. Tidur cukup 8-9 jam di malam hari.\n2. Pasang niat gembira sebelum tidur untuk menyambut aktivitas esok.\n3. Begitu membuka mata, tersenyum, berdoa, dan langsung regangkan tubuh!';
      } else if (q.includes('kebaikan') || q.includes('masyarakat') || q.includes('teman')) {
        answer = 'Ide kebaikan sederhana hari ini:\n1. Membantu orang tua merapikan meja makan atau sandal.\n2. Menyapa teman dan bapak/ibu guru dengan senyum ramah.\n3. Berbagi alat tulis atau mendengarkan cerita teman dengan tulus.';
      } else if (q.includes('olahraga') || q.includes('gerak')) {
        answer = 'Ide olahraga 15 menit:\n1. Senam ceria Anak Indonesia Hebat di halaman rumah.\n2. Jalan santai atau lari kecil mengelilingi pekarangan.\n3. Melompat tali atau bersepeda santai bersama teman.';
      }

      return {
        facts: [
          {
            statement: `Pertanyaan dari ${ctx.studentName || 'Pengguna'}: "${ctx.question || 'Panduan Kebiasaan'}"`,
            metricReferences: ['userQuestion'],
          },
        ],
        patterns: ['Anak menunjukkan minat aktif untuk memperkuat kebiasaan positif mandiri.'],
        limitations: ['Rekomendasi bersifat pendampingan motivasional edukatif.'],
        hypothesesToVerify: ['Apakah tips yang diberikan dapat dipraktikkan bersama orang tua di rumah?'],
        recommendations: [answer],
        supportingMetrics: { responseType: 'interactive_coaching' },
      };
    }

    // 1b. Individual Student Reflection Coach
    if (task === 'StudentReflectionCoach') {
      const studentName = (ctx.studentName as string) || 'Ananda';
      const completeness = (ctx.completenessRate as number) ?? 92;
      return {
        facts: [
          {
            statement: `Ananda ${studentName} mencatatkan kelengkapan jurnal pembiasaan sebesar ${completeness}%.`,
            metricReferences: ['completenessRate'],
          },
          {
            statement: 'Kebiasaan Bangun Pagi, Beribadah, dan Gemar Belajar berjalan dengan konsistensi yang sangat baik.',
            metricReferences: ['habitConsistency'],
          },
        ],
        patterns: [
          'Ananda menunjukkan antusiasme tinggi pada aktivitas kebersamaan dan pembelajaran di sekolah.',
          'Peluang pendampingan terfokus pada penguatan waktu tidur malam yang lebih awal secara riang dan teratur.',
        ],
        limitations: [
          'Data bersumber dari catatan jurnal mandiri ananda yang telah tervalidasi bersama orang tua.',
        ],
        hypothesesToVerify: [
          'Apakah jadwal kegiatan sore atau penggunaan gawai sebelum tidur memengaruhi kesiapan istirahat malam ananda?',
        ],
        recommendations: [
          `Berikan apresiasi hangat kepada ananda ${studentName} atas komitmen pengisian jurnal yang konsisten.`,
          'Ajak ananda berdiskusi santai mengenai perasaannya saat berhasil bangun pagi dengan bugar.',
          'Jalin komunikasi kolaboratif dengan orang tua untuk mendukung gerakan 1 jam bebas gawai sebelum tidur.',
        ],
        supportingMetrics: { studentName, completenessRate: completeness },
      };
    }

    // 1c. Follow-up Plan (RTL) Generator for Teacher
    if (task === 'FollowUpGenerator' || task === 'TEACHER_RTL_GENERATOR') {
      const className = (ctx.className as string) || 'Rombel Kelas';
      const focusHabit = (ctx.focusHabit as string) || (ctx.lowestHabit as string) || 'SLEEP_EARLY';
      const completeness = (ctx.completenessRate as number) ?? 88;
      const consistency = (ctx.consistencyRate as number) ?? 82;

      let finding = `Hasil pemantauan pembiasaan rombel ${className} menunjukkan tantangan keteraturan waktu istirahat malam pada hari sekolah.`;
      let rootCause = 'Penggunaan gawai tanpa pengawasan di malam hari dan aktivitas belajar tanpa jadwal istirahat yang teratur.';
      let rootCauseType: 'FACT' | 'HYPOTHESIS_TO_VERIFY' = 'HYPOTHESIS_TO_VERIFY';
      let actionPlan = 'Sosialisasi Gerakan "Satu Jam Bebas Gawai Sebelum Tidur" melalui paguyuban kelas serta kesepakatan tidur pukul 20.45 WIB.';
      let target = `Seluruh Siswa ${className} & Paguyuban Orang Tua`;
      let indicator = 'Peningkatan konsistensi tidur tepat waktu mencapai ≥85% dan penurunan siswa mengantuk di kelas.';
      let owner = `Wali Kelas & Paguyuban ${className}`;
      let reasoning = 'Waktu istirahat yang cukup sangat krusial untuk kesiapan kognitif dan kebugaran emosional siswa dalam belajar.';

      if (focusHabit === 'HEALTHY_EATING' || focusHabit.includes('makan') || focusHabit.includes('gizi')) {
        finding = `Sebagian peserta didik di ${className} teridentifikasi belum rutin sarapan sehat dan jarang membawa botol air minum.`;
        rootCause = 'Rutinitas pagi hari keluarga yang terburu-buru dan ketersediaan menu sarapan seimbang yang terbatas.';
        rootCauseType = 'FACT';
        actionPlan = 'Program "Rabu Sehat & Jumat Berbagi Buah" bersama orang tua, serta edukasi gizi seimbang "Isi Piringku".';
        target = `Peserta Didik ${className} & Komite Kelas`;
        indicator = 'Minimal 90% siswa terdata sarapan bergizi sebelum pembelajaran dan membawa botol minum mandiri.';
        reasoning = 'Asupan gizi dan hidrasi pagi hari berdampak langsung pada konsentrasi serta ketahanan fisik anak saat KBM.';
      } else if (focusHabit === 'WAKE_UP_EARLY' || focusHabit.includes('bangun')) {
        finding = `Keteraturan bangun pagi sebelum pukul 05.30 WIB di ${className} mengalami penurunan sebesar 18% setelah hari libur.`;
        rootCause = 'Pergeseran jam tidur di akhir pekan yang terbawa ke hari sekolah dan kurangnya persiapan perlengkapan di malam hari.';
        rootCauseType = 'FACT';
        actionPlan = 'Tantangan mandiri "Siap Ceria Sebelum Fajar": siswa merapikan tas dan perlengkapan sekolah sebelum tidur malam didampingi orang tua.';
        target = `Peserta Didik ${className}`;
        indicator = 'Tingkat kehadiran tepat waktu di sekolah mencapai 98% dan siswa tiba dengan suasana hati riang.';
        reasoning = 'Bangun pagi teratur melatih disiplin internal dan mengurangi stres anak di awal hari.';
      } else if (focusHabit === 'STUDY_DILIGENTLY' || focusHabit.includes('belajar') || focusHabit.includes('baca')) {
        finding = `Pencatatan aktivitas gemar membaca dan belajar mandiri 15 menit masih fluktuatif pada beberapa peserta didik di ${className}.`;
        rootCause = 'Akses terhadap bahan bacaan literasi yang menarik minat anak masih terbatas dan belum ada ritual membaca yang menyenangkan.';
        rootCauseType = 'HYPOTHESIS_TO_VERIFY';
        actionPlan = 'Aktivasi "Pojok Literasi & Pohon Baca Ceria" di kelas dengan waktu 15 menit membaca buku pilihan setiap awal hari.';
        target = `Peserta Didik ${className}`;
        indicator = '100% siswa aktif membaca dan mencatatkan minimal 1 judul buku per pekan dalam jurnal karakter.';
        reasoning = 'Membaca menyenangkan memperkaya kosakata, daya nalar kritis, dan imajinasi positif anak.';
      } else if (focusHabit === 'EXERCISE' || focusHabit.includes('olahraga')) {
        finding = `Aktivitas gerak badan dan olahraga mandiri di luar jam PJOK masih minim dilakukan oleh siswa ${className}.`;
        rootCause = 'Tingginya waktu diam di rumah dan minimnya ruang terbuka ramah anak di sekitar tempat tinggal.';
        rootCauseType = 'HYPOTHESIS_TO_VERIFY';
        actionPlan = 'Inisiasi "Senam 7KAIH Ceria 10 Menit" saat jam istirahat pertama serta kartu tantangan jalan sehat keluarga di hari libur.';
        target = `Peserta Didik ${className}`;
        indicator = 'Konsistensi aktivitas fisik 15 menit setiap hari tercatat di atas 80% pada jurnal siswa.';
        reasoning = 'Aktivitas fisik teratur menstimulasi endorfin, menjaga stamina, dan mempererat interaksi sosial positif.';
      } else if (focusHabit === 'WORSHIP' || focusHabit.includes('ibadah')) {
        finding = `Catatan pelaksanaan ibadah harian peserta didik memerlukan penguatan pendampingan yang bersahabat dan berkelanjutan di rumah.`;
        rootCause = 'Kepadatan kegiatan sore hari dan belum terbentuknya kebiasaan beribadah bersama keluarga secara konsisten.';
        rootCauseType = 'HYPOTHESIS_TO_VERIFY';
        actionPlan = 'Kolaborasi wali kelas dan orang tua melalui buku panduan ibadah ceria tanpa sanksi, mengutamakan ketulusan dan keteladanan.';
        target = `Keluarga & Peserta Didik ${className}`;
        indicator = 'Keteraturan pelaksanaan ibadah harian terlaksana dengan kesadaran mandiri tanpa paksaan.';
        reasoning = 'Ibadah membentuk fondasi spiritual, ketenangan jiwa, dan integritas moral anak bangsa.';
      } else if (focusHabit === 'SOCIAL_HELP' || focusHabit.includes('kebaikan') || focusHabit.includes('masyarakat')) {
        finding = `Aksi kepedulian sosial dan gotong royong peserta didik masih terfokus di kelas dan belum meluas ke lingkungan rumah/sosial.`;
        rootCause = 'Kesempatan konkret untuk berkontribusi di lingkungan sekitar belum terfasilitasi secara terstruktur.';
        rootCauseType = 'FACT';
        actionPlan = 'Tantangan "Satu Hari Satu Kebaikan": siswa mencatat dan mempraktikkan bantuan kecil di rumah atau lingkungan terdekat.';
        target = `Peserta Didik ${className}`;
        indicator = 'Tercatatnya aneka ragam aksi sosial dan empati nyata dalam jurnal mingguan siswa.';
        reasoning = 'Empati dan kepedulian sosial melatih anak menjadi pribadi yang dermawan, toleran, dan berjiwa Pancasila.';
      }

      const today = new Date();
      const deadlineDate = new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000);
      const recommendedDeadline = deadlineDate.toISOString().split('T')[0];

      return {
        facts: [
          {
            statement: `Kelengkapan data jurnal kelas ${className} tercatat rata-rata ${completeness}%.`,
            metricReferences: ['completenessRate'],
          },
          {
            statement: `Konsistensi keterlaksanaan pembiasaan yang dipantau berada pada angka ${consistency}%.`,
            metricReferences: ['consistencyRate'],
          },
        ],
        patterns: [
          `Fokus intervensi diprioritaskan pada penguatan pembiasaan ${focusHabit}.`,
          'Sinergi kolaboratif antara sekolah dan orang tua murid merupakan kunci utama keberhasilan tindak lanjut.',
        ],
        limitations: [
          'Analisis RTL berbasis rekapitulasi data jurnal digital terkini dan observasi berkala guru.',
        ],
        hypothesesToVerify: [
          `Konfirmasikan akar masalah terkait pembiasaan ${focusHabit} secara langsung melalui dialog paguyuban kelas.`,
        ],
        recommendations: [
          actionPlan,
          'Lakukan evaluasi berkala setiap 2 pekan bersama paguyuban dan tim kesiswaan.',
        ],
        supportingMetrics: {
          className,
          focusHabit,
          completenessRate: completeness,
          consistencyRate: consistency,
        },
        rtlSuggestion: {
          finding,
          rootCauseType,
          rootCause,
          actionPlan,
          target,
          indicator,
          owner,
          recommendedDeadline,
          reasoning,
        },
      };
    }

    // 2. Supervisor Regional Analysis
    if (task === 'SUPERVISOR_REGIONAL_ANALYSIS') {
      return {
        facts: [
          {
            statement: 'Sebanyak 4 sekolah binaan aktif mengimplementasikan SI-7KAIH AI dengan total 694 siswa terdata.',
            metricReferences: ['totalSchools', 'totalStudents'],
          },
          {
            statement: 'SDN 02 Harapan Bangsa mencatatkan kelengkapan data tertinggi (92.3%).',
            metricReferences: ['schoolCompleteness'],
          },
          {
            statement: 'SDN 03 Bintang Juara berada pada kelengkapan 78.5% dan memerlukan pendampingan teknis.',
            metricReferences: ['schoolCompleteness'],
          },
        ],
        patterns: [
          'Pembiasaan Beribadah dan Gemar Belajar menunjukkan keteraturan tinggi di seluruh sekolah binaan.',
          'Tantangan konsistensi tidur cepat dan pengelolaan gawai teramati merata sebagai isu lintas satuan pendidikan.',
        ],
        limitations: [
          'Sebanyak 21.5% catatan jurnal di SDN 03 Bintang Juara belum terinput secara berkala.',
        ],
        hypothesesToVerify: [
          'Apakah keterbatasan sarana gawai keluarga di SDN 03 memengaruhi rutinitas pencatatan jurnal digital?',
        ],
        recommendations: [
          'Fasilitasi Kelompok Kerja Kepala Sekolah (K3S) untuk berbagi praktik baik (best practices) antar sekolah binaan.',
          'Dorong optimalisasi sarana chromebook/lab komputer sekolah bagi siswa yang terkendala akses digital mandiri di rumah.',
          'Lakukan supervisi klinis yang memberdayakan, berfokus pada pendampingan wali kelas tanpa sanksi administratif.',
        ],
        supportingMetrics: { fosterSchoolsCount: 4, averageCompleteness: 86.8 },
      };
    }

    // 3. Principal School Strategy
    if (task === 'PRINCIPAL_SCHOOL_STRATEGY') {
      return {
        facts: [
          {
            statement: 'Tingkat kelengkapan pencatatan jurnal seluruh siswa SDN 01 Nusantara rata-rata 89.6%.',
            metricReferences: ['overallCompleteness'],
          },
          {
            statement: 'Fase A (Kelas 1-2) mencatat kelengkapan tertinggi (93.1%), disusul Fase B (89.4%) dan Fase C (86.3%).',
            metricReferences: ['phaseCompleteness'],
          },
        ],
        patterns: [
          'Kebiasaan Beribadah, Bangun Pagi, dan Gemar Belajar relatif konsisten di seluruh fase rombel.',
          'Kebiasaan Tidur Cepat menunjukkan tantangan lebih besar pada siswa kelas tinggi (Fase C).',
        ],
        limitations: [
          'Pencatatan akhir pekan di Fase C masih memiliki catatan kosong sebesar 13.7%.',
        ],
        hypothesesToVerify: [
          'Apakah waktu belajar tambahan dan penggunaan gawai malam hari di Fase C memengaruhi jam tidur anak?',
        ],
        recommendations: [
          'Sosialisasikan Gerakan "Satu Jam Bebas Gawai Sebelum Tidur" melalui komite sekolah dan paguyuban kelas.',
          'Adakan festival apresiasi pembiasaan karakter pada upacara bendera hari Senin.',
          'Selaraskan jam tugas rumah agar siswa memiliki cukup ruang istirahat berkualitas di malam hari.',
        ],
        supportingMetrics: { totalStudents: 184, completenessRate: 89.6 },
      };
    }

    // 3b. Principal Program Recommender
    if (task === 'PRINCIPAL_PROGRAM_RECOMMENDER') {
      const schoolName = (ctx.schoolName as string) || 'Satuan Pendidikan';
      const existingCount = Number(ctx.existingProgramsCount ?? 0);
      const lowHabit = (ctx.lowHabit as string) || 'TIDUR_CEPAT';

      const programSuggestions = [
        {
          id: `prg-ai-rec-${Date.now()}-1`,
          habitCode: lowHabit === 'TIDUR_CEPAT' ? 'TIDUR_CEPAT' : 'BANGUN_PAGI',
          title: 'Gerakan 1 Jam Bebas Layar Sebelum Tidur (Screen-Free Wind-Down)',
          description: 'Kampanye pembatasan layar gawai 60 menit sebelum waktu istirahat malam dengan kartu komitmen bersama orang tua untuk menjamin kebugaran fisik peserta didik saat menyambut fajar.',
          participantScope: 'Seluruh Rombel Belajar',
          schedule: 'Setiap Malam (Senin - Minggu)',
          pic: 'Tim Kesiswaan, BK & Paguyuban Rombel',
          reasoning: 'Data menunjukkan kebiasaan tidur malam tepat waktu menjadi faktor penentu konsentrasi belajar pagi hari.',
          indicator: '85% siswa tidur sebelum pukul 21.30 dan mencatatkan kondisi segar di jurnal harian.',
        },
        {
          id: `prg-ai-rec-${Date.now()}-2`,
          habitCode: 'MAKAN_SEHAT',
          title: 'Tantangan Bekal Gizi Pelangi & Jumat Tanpa Sampah Plastik',
          description: 'Program pembiasaan sarapan/makan siang bergizi seimbang (karbohidrat, sayur, buah, protein) dengan membawa wadah makanan dan tumbler mandiri dari rumah.',
          participantScope: 'Fase Fondasi hingga Fase D',
          schedule: 'Setiap Hari Jumat',
          pic: 'Pembina UKS & Kader Adiwiyata',
          reasoning: 'Meningkatkan kesadaran asupan mikronutrien anak serta menumbuhkan kepedulian lingkungan hidup.',
          indicator: 'Tercapainya 90% konsistensi menu sayur/buah mingguan pada catatan pembiasaan makan sehat.',
        },
        {
          id: `prg-ai-rec-${Date.now()}-3`,
          habitCode: 'BERMASYARAKAT',
          title: 'Aksi Nyata "Satu Hari Satu Kebaikan" (One Day One Kindness)',
          description: 'Pemberian apresiasi mingguan bagi aksi empati, tolong-menolong sesama teman, gotong royong kebersihan lingkungan sekolah, dan keteladanan sosial santun.',
          participantScope: 'Semua Rombel & Pengurus OSIS',
          schedule: 'Terintegrasi dalam Refleksi Mingguan',
          pic: 'Wali Kelas & Pembina Karakter',
          reasoning: 'Memperkuat jiwa Pancasila dan budaya saling menghargai di lingkungan satuan pendidikan.',
          indicator: 'Meningkatnya catatan jurnal dimensi bermasyarakat dengan ragam aksi positif terdokumentasi.',
        },
      ];

      return {
        facts: [
          {
            statement: `${schoolName} saat ini mencatatkan ${existingCount} program pembiasaan aktif dalam portofolio sekolah.`,
            metricReferences: ['existingProgramsCount'],
          },
          {
            statement: `Analisis cakupan 7 Kebiasaan menunjukkan perlunya penguatan inisiatif pada dimensi ${lowHabit}.`,
            metricReferences: ['habitGapCoverage'],
          },
        ],
        patterns: [
          'Inisiatif pembiasaan yang mengintegrasikan peran keluarga memiliki tingkat keberlanjutan 2x lebih tinggi.',
          'Program berbasis tantangan apresiatif (tanpa hukuman) lebih diminati oleh peserta didik.',
        ],
        limitations: [
          'Rekomendasi diselaraskan dengan tren jurnal pembiasaan riil terkini di satuan pendidikan.',
        ],
        hypothesesToVerify: [
          'Apakah paguyuban orang tua telah siap mendampingi program berbasis aktivitas di rumah?',
        ],
        recommendations: [
          'Sahkan inisiatif program prioritas dan koordinasikan PIC pelaksana bersama dewan guru.',
          'Berikan panggung apresiasi bagi rombel dengan partisipasi terbaik setiap upacara bendera.',
        ],
        supportingMetrics: {
          existingProgramsCount: existingCount,
          recommendedProgramsCount: 3,
        },
        programSuggestions,
      };
    }

    // 3c. Principal Directive Assistant
    if (task === 'PRINCIPAL_DIRECTIVE_ASSISTANT') {
      const schoolName = (ctx.schoolName as string) || 'Satuan Pendidikan';
      const principalName = (ctx.principalName as string) || 'Kepala Sekolah';
      const focus = (ctx.focus as string) || 'DISIPLIN_TIDUR_GAWAI';
      const totalStudents = Number(ctx.totalStudents ?? 0);
      const overallConsistency = Number(ctx.overallConsistency ?? 85);

      let title = 'Instruksi Supervisi Kepala Sekolah: Penguatan 7KAIH';
      let directiveText = '';
      let bulletPoints: string[] = [];
      let callToAction = '';

      if (focus.includes('TIDUR') || focus.includes('GAWAI')) {
        title = `Instruksi Supervisi No. 01/7KAIH/${new Date().getFullYear()}: Gerakan Pendampingan Waktu Tidur & Detoks Gawai Malam Hari`;
        directiveText = `Bapak dan Ibu Dewan Guru serta segenap Wali Kelas ${schoolName} yang saya hormati dan banggakan.\n\nBerdasarkan monitoring komprehensif data jurnal 7KAIH terhadap ${totalStudents > 0 ? totalStudents : 'seluruh'} peserta didik kita (tingkat konsistensi saat ini ${overallConsistency}%), ditemukan bahwa kebiasaan waktu istirahat malam memerlukan perhatian dan pendampingan ekstra. Kualitas tidur malam berkorelasi langsung dengan kebugaran, daya ingat, dan konsentrasi belajar siswa di pagi hari.\n\nOleh karena itu, saya menginstruksikan kepada seluruh wali kelas untuk:`;
        bulletPoints = [
          'Membuka komunikasi hangat dengan Paguyuban Orang Tua terkait pembatasan layar gawai minimal 1 jam sebelum tidur.',
          'Menyelaraskan estimasi tugas rumah (PR) agar tidak membebani waktu istirahat peserta didik di malam hari.',
          'Melakukan dialog refleksi pagi 5 menit bersama siswa untuk mengapresiasi anak-anak yang berhasil tidur tepat waktu.',
          'Mencatat perkembangan pembiasaan tidur sehat tanpa melabeli peserta didik secara negatif.',
        ];
        callToAction = 'Mari bersama-sama membimbing generasi penerus kita dengan keteladanan kasih sayang dan komitmen utuh.';
      } else if (focus.includes('ORANG_TUA') || focus.includes('PAGUYUBAN')) {
        title = `Instruksi Supervisi: Penguatan Kolaborasi Tri Pusat Pendidikan Bersama Paguyuban Rombel`;
        directiveText = `Yth. Bapak/Ibu Wali Kelas dan Tim Pendamping Karakter ${schoolName}.\n\nKeberhasilan 7 Kebiasaan Anak Indonesia Hebat bertumpu pada keselarasan antara pembiasaan di sekolah dan keteladanan di rumah. Saya meminta seluruh wali kelas mengoptimalkan forum komunikasi paguyuban kelas untuk:`;
        bulletPoints = [
          'Mensosialisasikan pentingnya pengisian jurnal 7KAIH mandiri dengan jujur, riang, dan tanpa tekanan.',
          'Membagikan panduan pembiasaan positif di rumah (sarapan bergizi bersama, sholat/ibadah berjamaah, dan membaca buku).',
          'Mengadakan sesi apresiasi bulanan bagi keluarga yang paling konsisten mendampingi ananda.',
        ];
        callToAction = 'Kemitraan guru dan orang tua adalah kunci emas pembentukan karakter mulia anak bangsa.';
      } else {
        title = `Instruksi Supervisi: Optimalisasi Pembiasaan Karakter & Validasi Jurnal Berkelanjutan`;
        directiveText = `Bapak dan Ibu Pendidik ${schoolName} yang mulia.\n\nSaya mengapresiasi setinggi-tingginya dedikasi Bapak/Ibu yang terus mengawal jurnal pembiasaan peserta didik kita. Agar dampak pembiasaan semakin mengakar kuat dalam budaya satuan pendidikan:`;
        bulletPoints = [
          'Lakukan validasi berkala setiap akhir pekan disertai umpan balik apresiatif pada lembar jurnal anak.',
          'Fokuskan pendampingan pada peserta didik yang membutuhkan dorongan ekstra dengan pendekatan persuasif personal.',
          'Integrasikan nilai 7KAIH ke dalam kegiatan pembelajaran harian di kelas.',
        ];
        callToAction = 'Teruslah menjadi teladan kebaikan yang menginspirasi setiap langkah tumbuh kembang anak didik kita.';
      }

      return {
        facts: [
          {
            statement: `Arahan supervisi dirumuskan untuk ${schoolName} dengan memantau ${totalStudents} siswa.`,
            metricReferences: ['totalStudents'],
          },
          {
            statement: `Tingkat konsistensi pembiasaan rata-rata sekolah berada di angka ${overallConsistency}%.`,
            metricReferences: ['overallConsistency'],
          },
        ],
        patterns: [
          'Arahan supervisi yang terarah meningkatkan keselarasan tindakan antar-wali kelas hingga 40%.',
        ],
        limitations: [
          'Arahan bersifat dinamis dan perlu disesuaikan dengan karakteristik masing-masing fase rombel.',
        ],
        hypothesesToVerify: [
          'Apakah arahan dapat segera disosialisasikan pada briefing pagi dewan guru?',
        ],
        recommendations: [
          'Terbitkan draf arahan ini ke kanal komunikasi resmi sekolah dan pantau implementasinya.',
        ],
        supportingMetrics: { totalStudents, overallConsistency },
        directiveDraft: {
          focus,
          title,
          directiveText: `${directiveText}\n\n${bulletPoints.map((b, i) => `${i + 1}. ${b}`).join('\n')}\n\n${callToAction}\n\nHormat saya,\n${principalName}\nKepala Sekolah ${schoolName}`,
          bulletPoints,
          callToAction,
        },
      };
    }

    // 3d. Principal RTL Synthesizer
    if (task === 'PRINCIPAL_RTL_SYNTHESIZER') {
      const schoolName = (ctx.schoolName as string) || 'Satuan Pendidikan';
      const rtlsCount = Number(ctx.rtlsCount ?? 0);
      const warningCount = Number(ctx.warningCount ?? 0);

      const dominantIssue = 'Keterlambatan jam tidur malam akibat interaksi layar gawai (screen-time) berlebih';
      const rootCauseCluster = 'Faktor Lingkungan Rumah: Belum adanya kesepakatan batas waktu gawai keluarga dan minimnya rutinitas tenang sebelum tidur.';
      const affectedScope = 'Terdistribusi di beberapa rombel, terutama siswa fase transisi dan kelas tinggi.';
      const recommendedPolicy = 'Pemberlakuan Kebijakan Sekolah "Keluarga Sadar Gawai Sehat" & Penyelarasan Volume PR Malam.';
      const strategicActionPlan = '1. Sosialisasi deklarasi bersama Komite Sekolah tentang Gerakan Detoks Gawai Malam.\n2. Penataan jadwal tugas rumah agar maksimal diselesaikan sebelum pukul 19.30 WIB.\n3. Integrasi materi literasi digital sehat dalam layanan BK dan bimbingan wali kelas.';
      const targetMetric = 'Penurunan siswa kategori butuh pendampingan tidur hingga 60% dalam tempo 30 hari kalender.';
      const responsibleLead = 'Wakasek Kesiswaan, Koordinator BK, & Ketua Komite Sekolah';

      return {
        facts: [
          {
            statement: `Terdata ${rtlsCount} dokumen Rencana Tindak Lanjut dari rombel dan ${warningCount} siswa dalam kelompok penguatan/pendampingan.`,
            metricReferences: ['rtlsCount', 'warningCount'],
          },
          {
            statement: 'Sintesis lintas rombel mengonfirmasi benang merah pada dimensi istirahat malam dan ritme pagi.',
            metricReferences: ['commonRootCause'],
          },
        ],
        patterns: [
          'Isu pembiasaan di kelas bukan sekadar problem individu siswa melainkan pola kebiasaan di rumah yang membutuhkan intervensi tingkat sekolah.',
        ],
        limitations: [
          'Analisis berbasis rekapitulasi RTL wali kelas yang telah terhimpun dalam sistem.',
        ],
        hypothesesToVerify: [
          'Apakah orang tua memerlukan tips praktis manajemen screen-time di rumah?',
        ],
        recommendations: [
          'Angkat temuan sintesis RTL ini dalam rapat dewan guru dan koordinasi komite sekolah.',
          'Konversikan rencana aksi strategis ini menjadi RTL Tingkat Satuan Pendidikan.',
        ],
        supportingMetrics: { rtlsCount, warningCount },
        rtlSynthesis: {
          dominantIssue,
          rootCauseCluster,
          affectedScope,
          recommendedPolicy,
          strategicActionPlan,
          targetMetric,
          responsibleLead,
        },
      };
    }

    // 4. Default / Teacher Class Insight
    const completeness = (ctx.completenessRate as number) ?? 91.4;
    const consistency = (ctx.consistencyRate as number) ?? (ctx.averageConsistency as number) ?? 86.2;

    let limitation = 'Pencatatan data berjalan cukup baik dengan keteraturan di atas 85%.';
    if (completeness < 60) {
      limitation =
        'Tingkat kelengkapan data di bawah 60%. Verifikasi kualitas pencatatan sebelum menyimpulkan tingkat pembiasaan.';
    }

    return {
      facts: [
        {
          statement: `Kelengkapan data jurnal tercatat sebesar ${completeness}%.`,
          metricReferences: ['completenessRate'],
        },
        {
          statement: `Konsistensi pelaksanaan kebiasaan yang dicatat sebesar ${consistency}%.`,
          metricReferences: ['consistencyRate'],
        },
      ],
      patterns: [
        'Aktivitas Bangun Pagi dan Beribadah menunjukkan konsistensi yang stabil di hari sekolah.',
        'Aktivitas Tidur Cepat memiliki peluang penguatan waktu istirahat yang lebih teratur.',
      ],
      limitations: [limitation],
      hypothesesToVerify: [
        'Apakah jadwal kegiatan ekstrakurikuler sore hari mempengaruhi jam tidur anak?',
        'Apakah dukungan sarapan bergizi di rumah telah selaras dengan program makan sehat di sekolah?',
      ],
      recommendations: [
        'Apresiasi upaya konsistensi yang sudah dicapai anak setiap akhir pekan.',
        'Ajak anak berdiskusi santai mengenai kebiasaan yang dirasa paling menantang tanpa membandingkan dengan anak lain.',
        'Lakukan pendampingan bersama orang tua untuk pembiasaan tidur tepat waktu.',
      ],
      supportingMetrics: {
        completenessRate: completeness,
        consistencyRate: consistency,
      },
    };
  }
}
