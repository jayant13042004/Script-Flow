import type { Platform, ContentType, Tone, RepurposeFormat } from './script';

export interface AiService {
  improveText(params: ImproveTextParams): Promise<AiTextResponse>;
  generateScript(params: GenerateScriptParams): Promise<AiGenerateResponse>;
  repurpose(params: RepurposeParams): Promise<AiTextResponse>;
  askAboutScript(params: AskParams): Promise<AiTextResponse>;
  generateVideoIdeas?(params: GenerateVideoIdeasParams): Promise<GenerateVideoIdeasResponse>;
  transcribeAudio?(params: TranscribeAudioParams): Promise<TranscribeAudioResponse>;
}

export interface VideoIdea {
  id: string;
  title: string;
  hook: string;
  angle: string;
  format: string;
}

export interface GenerateVideoIdeasParams {
  pastScripts: { title: string; plainText?: string; platform?: string; contentType?: string }[];
  count?: number;
}

export interface GenerateVideoIdeasResponse {
  detectedNiche: string;
  creatorStyle: string;
  ideas: VideoIdea[];
}

export interface TranscribeAudioParams {
  audioBase64: string;
  mimeType: string;
}

export interface TranscribeAudioResponse {
  transcript: string;
  structuredScript: string;
}

export interface ImproveTextParams {
  selectedText: string;
  instruction: string;
  fullScriptContext: string;
}

export interface GenerateScriptParams {
  topic: string;
  platform: Platform;
  contentType: ContentType;
  duration: string;
  tone: Tone;
  language: string;
  customInstructions?: string;
}

export interface RepurposeParams {
  scriptContent: string;
  targetFormat: RepurposeFormat;
  scriptTitle: string;
}

export interface AskParams {
  question: string;
  scriptContext: string;
}

export interface AiTextResponse {
  result: string;
  isLoading?: boolean;
}

export interface AiGenerateResponse {
  hooks: string[];
  script: string;
  onScreenText: string[];
  visualSuggestions: string[];
  cta: string;
}

export type AiAction = 
  | 'improve' | 'shorten' | 'clarify' | 'conversational'
  | 'improve-hook' | 'curiosity' | 'retention' | 'storytelling'
  | 'add-examples' | 'add-emotion' | 'add-cta' | 'fix-grammar'
  | 'change-tone' | 'translate' | 'generate-alternatives';
