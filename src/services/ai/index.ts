import type { AiService } from './aiService';
import { MockAiService } from './mockAiService';

let instance: AiService | null = null;

export function getAiService(): AiService {
  if (!instance) {
    const provider = import.meta.env.VITE_AI_PROVIDER;
    switch (provider) {
      default:
        instance = new MockAiService();
        break;
    }
  }
  return instance;
}
