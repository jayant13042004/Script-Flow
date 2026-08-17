import { marked } from 'marked';

// Configure marked options for clean editor integration
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Checks if a plain text string contains markdown syntax
 */
export function isMarkdownText(text: string): boolean {
  if (!text || typeof text !== 'string') return false;

  // Check for common markdown indicators
  const hasHeadings = /^#{1,6}\s+/m.test(text);
  const hasBold = /\*\*[^*]+\*\*|__[^_]+__/.test(text);
  const hasItalic = /(?<!\*)\*[^*]+\*(?!\*)|(?<!_)_[^_]+_(?!_)/.test(text);
  const hasBulletList = /^[\*\-\+]\s+[^\*\-\+]/m.test(text);
  const hasNumberedList = /^\d+\.\s+/m.test(text);
  const hasBlockquote = /^>\s+/m.test(text);
  const hasDivider = /^(\-{3,}|\*{3,}|_{3,})$/m.test(text);
  const hasCodeBlock = /```[\s\S]*?```|`[^`]+`/.test(text);

  return (
    hasHeadings ||
    hasBold ||
    hasItalic ||
    hasBulletList ||
    hasNumberedList ||
    hasBlockquote ||
    hasDivider ||
    hasCodeBlock
  );
}

/**
 * Converts Markdown string into TipTap-compatible HTML
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  // Clean trailing word count metadata if copied from UI
  const cleanedMarkdown = markdown
    .replace(/\n+\d+\s+words\s*·\s*\d+\s+characters\s*·\s*~?\d+m\s*\d*s?\s*speaking\s*time.*$/gi, '')
    .trim();

  try {
    const rawHtml = marked.parse(cleanedMarkdown);
    if (typeof rawHtml === 'string') {
      return rawHtml;
    }
    // Handle Promise return if async
    return String(rawHtml);
  } catch (err) {
    console.error('Failed to parse markdown:', err);
    return markdown;
  }
}
