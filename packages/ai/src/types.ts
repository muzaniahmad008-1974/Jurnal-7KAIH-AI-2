// ============================================================================
// SI-7KAIH AI - AI Types & Interfaces
// ============================================================================

import { AIAnalysisResult } from '../../types/src/index';

export type AIProviderName = 'gemini' | 'openai' | 'custom';

export interface AIServiceConfig {
  provider: AIProviderName;
  apiKey?: string;
  model?: string;
}

export interface AIAnalysisRequest {
  taskType:
    | 'StudentReflectionCoach'
    | 'TeacherClassInsight'
    | 'SchoolAnalysis'
    | 'SupervisorPortfolioAnalysis'
    | 'FollowUpGenerator'
    | 'TEACHER_RTL_GENERATOR'
    | 'AI_CHAT_ASSISTANT'
    | 'TEACHER_CLASS_INSIGHT'
    | 'TEACHER_CLASS_PROGRAM_RECOMMENDER'
    | 'PRINCIPAL_SCHOOL_STRATEGY'
    | 'PRINCIPAL_PROGRAM_RECOMMENDER'
    | 'PRINCIPAL_DIRECTIVE_ASSISTANT'
    | 'PRINCIPAL_RTL_SYNTHESIZER'
    | 'SUPERVISOR_REGIONAL_ANALYSIS';
  actorRole: string;
  context: Record<string, unknown>;
}

export interface AIProvider {
  name: AIProviderName;
  generateStructured(request: AIAnalysisRequest): Promise<AIAnalysisResult>;
}
