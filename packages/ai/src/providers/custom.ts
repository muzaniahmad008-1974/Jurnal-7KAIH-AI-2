// ============================================================================
// SI-7KAIH AI - Custom / Local Rule-based Provider Abstraction
// ============================================================================

import { AIProvider, AIAnalysisRequest } from '../types';
import { AIAnalysisResult } from '../../../types/src/index';

export class CustomAIProvider implements AIProvider {
  name = 'custom' as const;

  async generateStructured(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    const completeness = Number(request.context.completenessRate ?? 80);
    const consistency = Number(request.context.consistencyRate ?? 85);

    return {
      facts: [
        {
          statement: `Rasio pencatatan harian mencapai ${completeness}%.`,
          metricReferences: ['completenessRate'],
        },
        {
          statement: `Tingkat konsistensi pelaksanaan kebiasaan yang tercatat sebesar ${consistency}%.`,
          metricReferences: ['consistencyRate'],
        },
      ],
      patterns: [
        'Anak menunjukkan ketertarikan tinggi pada aktivitas sosial dan belajar mandiri.',
        'Keteraturan berolahraga dan makan bergizi terpelihara dengan baik.',
      ],
      limitations: [
        completeness < 70
          ? 'Tingkat kelengkapan data perlu ditingkatkan sebelum menarik kesimpulan menyeluruh.'
          : 'Data pencatatan memadai untuk evaluasi bulanan.',
      ],
      hypothesesToVerify: [
        'Apakah variasi menu makanan sehat di rumah mendukung minat makan buah/sayur?',
      ],
      recommendations: [
        'Lanjutkan tradisi refleksi keluarga setiap akhir pekan.',
        'Berikan pujian atas proses usaha anak, bukan sekadar hasil.',
      ],
      supportingMetrics: {
        completenessRate: completeness,
        consistencyRate: consistency,
      },
    };
  }
}
