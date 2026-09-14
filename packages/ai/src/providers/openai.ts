// ============================================================================
// SI-7KAIH AI - OpenAI Provider Abstraction
// ============================================================================

import { AIProvider, AIAnalysisRequest } from '../types';
import { AIAnalysisResult } from '../../../types/src/index';

export class OpenAIAIProvider implements AIProvider {
  name = 'openai' as const;
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
  }

  async generateStructured(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    if (!this.apiKey) {
      // Return safe structured fallback if OpenAI key is not configured
      return {
        facts: [
          {
            statement: 'Analisis berbasis OpenAI siap diaktifkan saat API key tersedia.',
            metricReferences: [],
          },
        ],
        patterns: ['Pola kebiasaan terpantau stabil melalui jurnal harian.'],
        limitations: ['Menunggu konfigurasi OpenAI API key untuk analisis lanjutan.'],
        hypothesesToVerify: ['Verifikasi keteraturan pengisian jurnal bersama wali kelas.'],
        recommendations: [
          'Berikan motivasi positif harian kepada anak.',
          'Dukung rutinitas tidur dan sarapan sehat secara bertahap.',
        ],
        supportingMetrics: {},
      };
    }

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'Anda adalah asisten AI SI-7KAIH yang berlandaskan etika pendidikan karakter positif, tanpa menghakimi agama atau melabel anak.',
            },
            {
              role: 'user',
              content: JSON.stringify(request),
            },
          ],
        }),
      });
      const data = await res.json();
      return JSON.parse(data.choices[0].message.content) as AIAnalysisResult;
    } catch {
      return {
        facts: [{ statement: 'Analisis ringkasan alternatif aktif.', metricReferences: [] }],
        patterns: [],
        limitations: ['Gagal memanggil layanan OpenAI eksternal.'],
        hypothesesToVerify: [],
        recommendations: ['Tinjau pencatatan secara langsung pada dashboard.'],
        supportingMetrics: {},
      };
    }
  }
}
