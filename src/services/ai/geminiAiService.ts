import type {
  AiService,
  ImproveTextParams,
  GenerateScriptParams,
  RepurposeParams,
  AskParams,
  AiTextResponse,
  AiGenerateResponse
} from '../../types/ai';
import { MockAiService } from './mockAiService';

export class GeminiAiService implements AiService {
  private apiKey: string;
  private fallbackService: MockAiService;
  private modelName: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_AI_API_KEY || '';
    this.modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
    this.fallbackService = new MockAiService();
  }

  private async callGemini(prompt: string, jsonMode: boolean = false): Promise<string> {
    if (!this.apiKey) {
      console.warn('Gemini API key is not configured. Falling back to mock AI service.');
      return '';
    }

    // Try primary model (gemini-2.5-flash), fallback to gemini-2.0-flash / gemini-1.5-flash if needed
    const modelsToTry = [this.modelName, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    
    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
        
        const payload: any = {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
          }
        };

        if (jsonMode) {
          payload.generationConfig.responseMimeType = 'application/json';
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Gemini API call failed for model ${model} (${response.status}):`, errText);
          continue; // try next model fallback
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) return text.trim();
      } catch (err) {
        console.warn(`Error calling Gemini model ${model}:`, err);
      }
    }

    return '';
  }

  async improveText(params: ImproveTextParams): Promise<AiTextResponse> {
    if (!this.apiKey) {
      return this.fallbackService.improveText(params);
    }

    const prompt = `You are ScriptFlow, a professional AI scriptwriting assistant for content creators.
Selected text to improve: "${params.selectedText}"
Full script context: "${params.fullScriptContext || 'N/A'}"
Instruction: ${params.instruction}

Rewrite or improve the selected text according to the instruction.
Maintain creator tone, high engagement, and clear flow.
Return ONLY the revised text. Do not include quotes, preamble, markdown code blocks, or extra commentary.`;

    const resultText = await this.callGemini(prompt);
    if (!resultText) {
      return this.fallbackService.improveText(params);
    }

    return { result: resultText.replace(/^["']|["']$/g, '') };
  }

  async generateScript(params: GenerateScriptParams): Promise<AiGenerateResponse> {
    if (!this.apiKey) {
      return this.fallbackService.generateScript(params);
    }

    const prompt = `You are ScriptFlow, an expert content creation AI.
Generate a complete, high-performing video/content script based on the following specifications:
- Topic/Idea: ${params.topic}
- Platform: ${params.platform}
- Content Type: ${params.contentType}
- Duration: ${params.duration}
- Tone: ${params.tone}
- Language: ${params.language || 'English'}
- Custom Instructions: ${params.customInstructions || 'None'}

Return a valid JSON object matching this exact schema:
{
  "hooks": ["hook option 1", "hook option 2", "hook option 3"],
  "script": "full complete written script text with section markers if appropriate",
  "onScreenText": ["on-screen text 1", "on-screen text 2", "on-screen text 3"],
  "visualSuggestions": ["B-roll / visual cue 1", "B-roll / visual cue 2", "B-roll / visual cue 3"],
  "cta": "strong call to action text"
}`;

    const jsonText = await this.callGemini(prompt, true);
    if (jsonText) {
      try {
        const cleaned = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          hooks: Array.isArray(parsed.hooks) ? parsed.hooks : [],
          script: parsed.script || '',
          onScreenText: Array.isArray(parsed.onScreenText) ? parsed.onScreenText : [],
          visualSuggestions: Array.isArray(parsed.visualSuggestions) ? parsed.visualSuggestions : [],
          cta: parsed.cta || ''
        };
      } catch (err) {
        console.error('Failed to parse Gemini JSON script generation response:', err);
      }
    }

    return this.fallbackService.generateScript(params);
  }

  async repurpose(params: RepurposeParams): Promise<AiTextResponse> {
    if (!this.apiKey) {
      return this.fallbackService.repurpose(params);
    }

    const prompt = `You are ScriptFlow, a multi-platform content repurposing expert.
Original Script Title: "${params.scriptTitle}"
Original Script Content:
"${params.scriptContent}"

Target Format: ${params.targetFormat}

Repurpose this script into the target format (e.g. if X thread: numbered tweets; if LinkedIn: professional post; if Reel/Short/TikTok: timed hook & script; if Carousel: slide-by-slide text; if Email: newsletter style).
Return ONLY the formatted, ready-to-publish content without extra commentary.`;

    const resultText = await this.callGemini(prompt);
    if (!resultText) {
      return this.fallbackService.repurpose(params);
    }

    return { result: resultText };
  }

  async askAboutScript(params: AskParams): Promise<AiTextResponse> {
    if (!this.apiKey) {
      return this.fallbackService.askAboutScript(params);
    }

    const prompt = `You are ScriptFlow, a senior script editor and YouTube content strategist.
Script Context:
"${params.scriptContext}"

User Question: "${params.question}"

Provide a concise, direct, and actionable answer focusing on retention, pacing, hook strength, and overall script quality.`;

    const resultText = await this.callGemini(prompt);
    if (!resultText) {
      return this.fallbackService.askAboutScript(params);
    }

    return { result: resultText };
  }
}
