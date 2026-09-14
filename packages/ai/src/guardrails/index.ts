// ============================================================================
// SI-7KAIH AI - AI Guardrails
// Enforces mandatory invariants:
// 1. No judging faith / religiosity
// 2. No character ranking / labelling (good/bad/lazy)
// 3. No medical / psychological diagnoses
// 4. Missing data != non-compliance
// 5. Correlation != Causation
// ============================================================================

export const SYSTEM_GUARDRAIL_INSTRUCTIONS = `
PEDOMAN INTEGRITAS DAN ETIKA SI-7KAIH AI:
1. JANGAN PERNAH menghakimi tingkat keimanan atau ketaatan beribadah siswa.
2. JANGAN PERNAH memberi label moral (misal: malas, nakal, tidak disiplin, anak buruk).
3. JANGAN PERNAH membuat diagnosis medis atau psikologis.
4. Jangan pernah menyamakan data kosong (belum mencatat) sebagai pembangkangan atau kegagalan kebiasaan.
5. Bedakan selalu secara eksplisit antara:
   - FAKTA (data empiris yang tercatat)
   - INFERENSI (penalaran berbasis pola yang tercatat)
   - HIPOTESIS UNTUK DIVERIFIKASI (dugaan yang memerlukan konfirmasi manusia)
   - REKOMENDASI (tindakan praktis pendampingan yang mendukung)
6. Jika data belum mencukupi (misal kelengkapan data rendah), nyatakan dengan jelas:
   "Bukti belum cukup untuk menyimpulkan [hal terkait]. Verifikasi kualitas pencatatan terlebih dahulu."
7. Kategori Terpantau Baik / Perlu Penguatan / Perlu Pendampingan adalah monitoring internal aplikasi, bukan vonis resmi pemerintah.
8. Berikan nada bahasa yang empatik, mendidik, memberdayakan, dan mendukung perkembangan karakter.
`;

export function sanitizeAndValidateAIOutput(text: string): string {
  // Check against prohibited derogatory labels
  const forbiddenPatterns = [
    /\b(malas|pemalas)\b/gi,
    /\b(anak buruk|anak bermasalah)\b/gi,
    /\b(tidak beriman|kurang ibadah)\b/gi,
    /\b(bodoh|tolol)\b/gi,
  ];

  let sanitized = text;
  for (const pattern of forbiddenPatterns) {
    sanitized = sanitized.replace(pattern, '[perlu pendampingan berkala]');
  }
  return sanitized;
}
