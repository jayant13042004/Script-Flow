import type { AiService } from './aiService';
import { MockAiService } from './mockAiService';
import { GeminiAiService } from './geminiAiService';

let instance: AiService | null = null;

export function getAiService(): AiService {
  if (!instance) {
    const provider = (import.meta.env.VITE_AI_PROVIDER || '').toLowerCase();
    const hasGeminiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_AI_API_KEY);

    if (provider === 'gemini' || (hasGeminiKey && provider !== 'mock')) {
      instance = new GeminiAiService();
    } else {
      instance = new MockAiService();
    }
  }
  return instance;
}
