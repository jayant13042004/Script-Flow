import type { Platform, ContentType, Tone, RepurposeFormat } from './script';

export interface AiService {
  improveText(params: ImproveTextParams): Promise<AiTextResponse>;
  generateScript(params: GenerateScriptParams): Promise<AiGenerateResponse>;
  repurpose(params: RepurposeParams): Promise<AiTextResponse>;
  askAboutScript(params: AskParams): Promise<AiTextResponse>;
  generateVideoIdeas?(params: GenerateVideoIdeasParams): Promise<GenerateVideoIdeasResponse>;
  transcribeAudio?(params: TranscribeAudioParams): Promise<TranscribeAudioResponse>;
  generateThumbnailConcepts?(params: GenerateThumbnailsParams): Promise<GenerateThumbnailsResponse>;
  generateYoutubeMetadata?(params: GenerateYoutubeMetadataParams): Promise<YoutubeMetadataResponse>;
  generateSponsorBlock?(params: SponsorBlockParams): Promise<SponsorBlockResponse>;
  translateScript?(params: TranslateScriptParams): Promise<TranslateScriptResponse>;
  extractViralShorts?(params: ExtractShortsParams): Promise<ExtractShortsResponse>;
  convertHandwritingToText?(params: ConvertHandwritingParams): Promise<ConvertHandwritingResponse>;
}

export interface ConvertHandwritingParams {
  imageBase64: string;
}

export interface ConvertHandwritingResponse {
  recognizedText: string;
}

// 1. Thumbnail Concepts
export interface ThumbnailConcept {
  id: string;
  sceneDescription: string;
  subjectEmotion: string;
  colorContrast: string;
  textOverlay: string;
  visualTitle: string;
}

export interface GenerateThumbnailsParams {
  title: string;
  scriptContext: string;
}

export interface GenerateThumbnailsResponse {
  concepts: ThumbnailConcept[];
}

// 2. YouTube Metadata & Chapters
export interface YoutubeMetadataResponse {
  shortHookSummary: string;
  fullDescription: string;
  chapters: { timestamp: string; title: string }[];
  tags: string[];
  hashtags: string[];
}

export interface GenerateYoutubeMetadataParams {
  title: string;
  scriptContext: string;
}

// 3. Sponsor Segment
export interface SponsorBlockParams {
  brandName: string;
  sponsorUrl?: string;
  promoCode?: string;
  talkingPoints: string;
  placement: 'organic-bridge' | 'mid-roll' | 'problem-solution';
  currentScriptContext: string;
}

export interface SponsorBlockResponse {
  introTransition: string;
  sponsorRead: string;
  outroTransition: string;
  fullSponsorBlock: string;
}

// 4. Script Translation
export interface TranslateScriptParams {
  scriptText: string;
  targetLanguage: string;
  languageCode: string;
}

export interface TranslateScriptResponse {
  translatedText: string;
  targetLanguage: string;
  pronunciationNotes?: string;
}

// 5. Short / Reel Extraction
export interface ViralShortOption {
  id: string;
  title: string;
  hook: string;
  scriptText: string;
  visualCues: string;
  estimatedDuration: number;
}

export interface ExtractShortsParams {
  longScriptTitle: string;
  longScriptText: string;
}

export interface ExtractShortsResponse {
  shorts: ViralShortOption[];
}

// Existing Types
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

export type AiPerformanceMode = 'fast' | 'quality';

export interface ImproveTextParams {
  selectedText: string;
  instruction: string;
  fullScriptContext: string;
  mode?: AiPerformanceMode;
}

export interface GenerateScriptParams {
  topic: string;
  platform: Platform;
  contentType: ContentType;
  duration: string;
  tone: Tone;
  language: string;
  customInstructions?: string;
  mode?: AiPerformanceMode;
}

export interface RepurposeParams {
  scriptContent: string;
  targetFormat: RepurposeFormat;
  scriptTitle: string;
  mode?: AiPerformanceMode;
}

export interface AskParams {
  question: string;
  scriptContext: string;
  mode?: AiPerformanceMode;
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
