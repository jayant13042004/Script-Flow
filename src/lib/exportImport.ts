import type { Script } from '../types';

/**
 * Download a file with the specified filename and MIME type.
 */
export function downloadFile(content: string | Blob, fileName: string, mimeType: string) {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export script as formatted Plain Text (.txt)
 */
export function exportToTxt(script: Script) {
  const title = script.title || 'Untitled Script';
  const text = `${title.toUpperCase()}\n${'='.repeat(title.length)}\n\n${script.plainText || ''}`;
  downloadFile(text, `${sanitizeFileName(title)}.txt`, 'text/plain;charset=utf-8');
}

/**
 * Export script as Markdown (.md)
 */
export function exportToMarkdown(script: Script) {
  const title = script.title || 'Untitled Script';
  let md = `# ${title}\n\n`;
  if (script.platform || script.contentType || script.tone) {
    md += `> **Platform**: ${script.platform || 'N/A'} | **Type**: ${script.contentType || 'N/A'} | **Tone**: ${script.tone || 'N/A'}\n\n`;
  }
  md += `${script.plainText || ''}\n`;
  downloadFile(md, `${sanitizeFileName(title)}.md`, 'text/markdown;charset=utf-8');
}

/**
 * Export script formatted for Microsoft Word / HTML (.docx format compatibility)
 */
export function exportToWordHtml(script: Script) {
  const title = script.title || 'Untitled Script';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 12pt; line-height: 1.6; color: #111827; margin: 1in; }
        h1 { font-size: 24pt; font-weight: bold; margin-bottom: 12pt; color: #0f172a; }
        .meta { color: #64748b; font-size: 10pt; margin-bottom: 24pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 12pt; }
        p { margin-bottom: 12pt; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      <div class="meta">
        <strong>Words:</strong> ${script.wordCount} &nbsp;|&nbsp;
        <strong>Duration:</strong> ~${Math.ceil(script.estimatedDuration / 60)} mins
      </div>
      <div>
        ${(script.plainText || '').split('\n\n').map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('')}
      </div>
    </body>
    </html>
  `;
  downloadFile(htmlContent, `${sanitizeFileName(title)}.doc`, 'application/msword;charset=utf-8');
}

/**
 * Export script as Final Draft / Teleprompter Script (.txt)
 */
export function exportToTeleprompterTxt(script: Script) {
  const title = script.title || 'Untitled Script';
  const lines = (script.plainText || '').split('\n').filter(l => l.trim().length > 0);
  const formatted = `*** TELEPROMPTER SCRIPT: ${title.toUpperCase()} ***\n\n` + lines.map(l => l.toUpperCase()).join('\n\n');
  downloadFile(formatted, `${sanitizeFileName(title)}_teleprompter.txt`, 'text/plain;charset=utf-8');
}

/**
 * Export script to Printable PDF (via print dialog with custom styling)
 */
export function exportToPdf(script: Script) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const title = script.title || 'Untitled Script';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${escapeHtml(title)} - ScriptFlow</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: 'Lora', Georgia, serif; font-size: 14pt; line-height: 1.8; color: #1e293b; padding: 20px; }
        h1 { font-family: 'Inter', sans-serif; font-size: 28pt; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
        .subtitle { font-family: 'Inter', sans-serif; font-size: 11pt; color: #64748b; margin-bottom: 32px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
        p { margin-bottom: 18px; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-family: 'Inter', sans-serif; font-size: 9pt; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 8px; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      <div class="subtitle">
        ScriptFlow Studio &nbsp;•&nbsp; ${script.wordCount} words &nbsp;•&nbsp; Estimated ${Math.ceil(script.estimatedDuration / 60)} min read
      </div>
      <div>
        ${(script.plainText || '').split('\n\n').map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('')}
      </div>
      <div class="footer">Created with ScriptFlow</div>
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() { window.close(); };
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Import file reader (.txt, .md, .html, .docx-raw)
 */
export async function parseImportedFile(file: File): Promise<{ title: string; text: string }> {
  const fileName = file.name.replace(/\.[^/.]+$/, '');
  const text = await file.text();

  // If Markdown, clean basic headers for raw text
  const cleanText = text
    .replace(/^#+\s+/gm, '') // Remove Markdown headers for plain text display
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold asterisks
    .replace(/\*(.*?)\*/g, '$1'); // Remove italic asterisks

  return {
    title: fileName,
    text: cleanText,
  };
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
