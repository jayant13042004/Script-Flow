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

/**
 * Bulletproof JSON Parser according to Gemini API integration best practices
 */
export function safeParseJSON<T>(rawText: string, isArray: boolean = false): T {
  if (!rawText || rawText.trim() === '') {
    throw new Error('Input text is empty');
  }
  let cleaned = rawText.trim();

  // 1. Strip markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, '');
    cleaned = cleaned.replace(/\n?```$/i, '');
  }
  cleaned = cleaned.trim();

  // 2. Isolate the JSON boundaries
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';

  const startIdx = cleaned.indexOf(openBracket);
  const endIdx = cleaned.lastIndexOf(closeBracket);
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  // 3. Attempt JSON parse
  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.warn('Initial JSON parse failed. Attempting fallback parse...', error);
    try {
      const escapedCleaned = cleaned.replace(/(?<!\\)"/g, '\\"');
      return JSON.parse(escapedCleaned) as T;
    } catch {
      throw new Error(`JSON parsing failed: ${(error as Error).message}`);
    }
  }
}

export class GeminiAiService implements AiService {
  private apiKey: string;
  private fallbackService: MockAiService;
  private modelName: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_AI_API_KEY || '';
    this.modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.6-flash';
    this.fallbackService = new MockAiService();
  }

  private async callGemini(prompt: string, jsonMode: boolean = false): Promise<string> {
    if (!this.apiKey) {
      console.warn('Gemini API key is not configured. Falling back to mock AI service.');
      return '';
    }

    // Supported active production models (primary to cost-effective/reasoning fallbacks)
    const modelsToTry = [
      this.modelName,
      'gemini-3.6-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-pro',
      'gemini-2.5-flash',
      'gemini-2.0-flash'
    ].filter((value, index, self) => self.indexOf(value) === index); // unique array

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
          continue;
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

CRITICAL RULES:
1. Rewrite or improve the selected text strictly adhering to the instruction.
2. Maintain natural creator tone, high retention, and engaging pacing.
3. Return ONLY the revised text. Do NOT include quotes, preambles, markdown code blocks, or extra commentary.`;

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
Analyze the input data and return a structured script response.

INPUT SPECIFICATIONS:
- Topic/Idea: ${params.topic}
- Platform: ${params.platform}
- Content Type: ${params.contentType}
- Duration: ${params.duration}
- Tone: ${params.tone}
- Language: ${params.language || 'English'}
- Custom Instructions: ${params.customInstructions || 'None'}

CRITICAL FORMATTING RULES:
1. Output ONLY a valid JSON object matching the schema below.
2. Do NOT wrap your output in markdown code blocks (e.g. do not use \`\`\`json ... \`\`\`).
3. Do NOT include any additional conversational preamble or postscript text.
4. CRITICAL JSON ESCAPING: Any double quotes inside JSON string values MUST be escaped (use \\" instead of "). Never output unescaped double quotes inside string fields.
5. Do NOT leave trailing commas at the end of lists or objects.

Output JSON Schema:
{
  "hooks": ["hook option 1", "hook option 2", "hook option 3"],
  "script": "full complete written script text with logical section markers",
  "onScreenText": ["on-screen text 1", "on-screen text 2", "on-screen text 3"],
  "visualSuggestions": ["B-roll / visual cue 1", "B-roll / visual cue 2", "B-roll / visual cue 3"],
  "cta": "strong call to action text"
}`;

    const jsonText = await this.callGemini(prompt, true);
    if (jsonText) {
      try {
        const parsed = safeParseJSON<any>(jsonText, false);
        return {
          hooks: Array.isArray(parsed.hooks) ? parsed.hooks : [],
          script: parsed.script || '',
          onScreenText: Array.isArray(parsed.onScreenText) ? parsed.onScreenText : [],
          visualSuggestions: Array.isArray(parsed.visualSuggestions) ? parsed.visualSuggestions : [],
          cta: parsed.cta || ''
        };
      } catch (err) {
        console.error('Failed to parse Gemini script response with safeParseJSON:', err);
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

CRITICAL RULES:
1. Transform this script into the target format (e.g., X thread: numbered posts; LinkedIn: professional breakdown; Reel/Short/TikTok: timed hook & body; IG Carousel: slide text).
2. Return ONLY the formatted, ready-to-publish content without extra commentary.`;

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

Provide a concise, direct, and actionable response focusing on retention, pacing, hook strength, and overall script quality.`;

    const resultText = await this.callGemini(prompt);
    if (!resultText) {
      return this.fallbackService.askAboutScript(params);
    }

    return { result: resultText };
  }
}
