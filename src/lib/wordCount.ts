import { estimateSpeakingTime } from './utils';

export function countWords(text: string): number {
  if (!text) return 0;
  const normalizedText = text.replace(/[\n\r]/g, ' ').trim();
  if (!normalizedText) return 0;
  return normalizedText.split(/\s+/).filter((word) => word.length > 0).length;
}

export function countCharacters(text: string): number {
  if (!text) return 0;
  return text.length;
}

export function estimateDuration(wordCount: number): number {
  return estimateSpeakingTime(wordCount);
}

export function getPlainTextFromHtml(html: string): string {
  if (!html) return '';
  // Basic HTML tag stripping
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
