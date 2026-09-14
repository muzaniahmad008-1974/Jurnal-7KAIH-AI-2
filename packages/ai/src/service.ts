// ============================================================================
// SI-7KAIH AI - Centralized AI Service Facade
// Selects provider based on environment configuration with resilient fallback
// ============================================================================

import { AIProvider, AIAnalysisRequest } from './types';
import { GeminiAIProvider } from './providers/gemini';
import { OpenAIAIProvider } from './providers/openai';
import { CustomAIProvider } from './providers/custom';
import { AIAnalysisResult } from '../../types/src/index';

export class AIService {
  private provider: AIProvider;

  constructor(providerName?: string) {
    const selected = providerName || process.env.AI_PROVIDER || 'gemini';
    switch (selected) {
      case 'openai':
        this.provider = new OpenAIAIProvider();
        break;
      case 'custom':
        this.provider = new CustomAIProvider();
        break;
      case 'gemini':
      default:
        this.provider = new GeminiAIProvider();
        break;
    }
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    try {
      return await this.provider.generateStructured(request);
    } catch (err) {
      console.log(`[AI Service] Fallback to deterministic provider (${err instanceof Error ? err.message : String(err)})`);
      // Fallback to custom deterministic provider
      const fallback = new CustomAIProvider();
      return fallback.generateStructured(request);
    }
  }
}

export const defaultAIService = new AIService();
