export type ScriptStatus = 'draft' | 'in-production' | 'filmed' | 'published';

export interface Script {
  id: string;
  userId: string;
  folderId: string | null;
  playlistId?: string | null;
  episodeNumber?: number | null;
  title: string;
  content: any; // TipTap JSON document
  plainText: string;
  platform: Platform | null;
  contentType: ContentType | null;
  tone: Tone | null;
  language: string;
  wordCount: number;
  characterCount: number;
  estimatedDuration: number; // seconds
  productionPlan: ProductionSection[] | null;
  structure: ScriptSection[] | null;
  isArchived: boolean;
  status: ScriptStatus;
  isPublic: boolean;
  shareToken: string | null;
  audioRecordings?: AudioRecording[];
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AudioRecording {
  id: string;
  scriptId: string;
  name: string;
  audioUrl: string;
  duration: number; // seconds
  createdAt: string;
}

export interface ScriptVersion {
  id: string;
  scriptId: string;
  content: any;
  plainText: string;
  wordCount: number;
  versionNumber: number;
  createdAt: string;
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionSection {
  id: string;
  voiceover: string;
  onScreenText: string;
  visual: string;
  duration: number; // seconds
  order: number;
}

export interface ScriptSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export type Platform = 'youtube' | 'youtube-shorts' | 'instagram-reels' | 'tiktok' | 'podcast' | 'x' | 'linkedin' | 'other';
export type ContentType = 'educational' | 'storytelling' | 'commentary' | 'tutorial' | 'review' | 'entertainment' | 'business' | 'personal-story' | 'news' | 'other' | 'custom';
export type Tone = 'educational' | 'conversational' | 'funny' | 'serious' | 'emotional' | 'authoritative' | 'controversial' | 'inspirational' | 'storytelling' | 'custom';
export type RepurposeFormat = 'youtube-short' | 'instagram-reel' | 'tiktok' | 'x-thread' | 'linkedin-post' | 'instagram-carousel' | 'short-teaser' | 'email-newsletter';
