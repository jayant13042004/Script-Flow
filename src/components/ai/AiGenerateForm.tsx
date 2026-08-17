import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Spinner } from '../ui/Spinner';
import { PLATFORMS, CONTENT_TYPES, DURATIONS, TONES } from '../../lib/constants';
import { languages } from '../../data/languages';
import { getAiService } from '../../services/ai';
import { AiGenerateResponse } from '../../types/ai';
import { Platform, ContentType, Tone } from '../../types/script';
import { Sparkles, Copy, Plus, X } from 'lucide-react';

interface AiGenerateFormProps {
  onGenerated: (result: AiGenerateResponse) => void;
  onClose: () => void;
}

export const AiGenerateForm: React.FC<AiGenerateFormProps> = ({ onGenerated, onClose }) => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>('youtube');
  const [contentType, setContentType] = useState<ContentType>('educational');
  const [duration, setDuration] = useState('60s');
  const [tone, setTone] = useState<Tone>('conversational');
  const [language, setLanguage] = useState('English');
  const [customInstructions, setCustomInstructions] = useState('');
  const [mode, setMode] = useState<'fast' | 'quality'>(() => {
    return (localStorage.getItem('scriptflow_ai_mode') as 'fast' | 'quality') || 'quality';
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AiGenerateResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    try {
      const response = await getAiService().generateScript({
        topic,
        platform,
        contentType,
        duration,
        tone,
        language,
        customInstructions,
        mode
      });
      setResult(response);
    } catch (error) {
      console.error('Failed to generate script', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">Generate Script with AI</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed vs Quality Mode Toggle */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-gray-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setMode('fast')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  mode === 'fast'
                    ? 'bg-amber-400 text-gray-950 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Fast Mode: Instant response (~300ms)"
              >
                ⚡ Fast Draft
              </button>
              <button
                type="button"
                onClick={() => setMode('quality')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                  mode === 'quality'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Quality Mode: In-depth reasoning & retention structure"
              >
                🎯 High Quality
              </button>
            </div>

            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-md text-gray-500 transition-colors ml-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!result && !isLoading ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic or Idea <span className="text-red-500">*</span></label>
                <Textarea
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., 5 productivity hacks for software engineers"
                  className="w-full h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <Select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className="w-full">
                    {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                  <Select value={contentType} onChange={(e) => setContentType(e.target.value as ContentType)} className="w-full">
                    {CONTENT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <Select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full">
                    {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
                  <Select value={tone} onChange={(e) => setTone(e.target.value as Tone)} className="w-full">
                    {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <Select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full">
                    {languages.map((l: { code: string; name: string }) => <option key={l.code} value={l.name}>{l.name}</option>)}
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Instructions (Optional)</label>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Any specific angles, phrases to include or avoid?"
                  className="w-full h-20"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={onClose} className="mr-3">Cancel</Button>
                <Button type="submit" disabled={!topic.trim()}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Script
                </Button>
              </div>
            </form>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner size="xl" />
              <h3 className="mt-6 text-lg font-medium text-gray-800">Crafting your script...</h3>
              <p className="text-gray-500 mt-2">Analyzing hooks, structuring content, and polishing the tone.</p>
            </div>
          ) : result ? (
            <div className="space-y-8">
              {result.hooks && result.hooks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Hook Options</h3>
                  <div className="space-y-3">
                    {result.hooks.map((hook, idx) => (
                      <div key={idx} className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg relative group">
                        <p className="text-gray-800 pr-8">{hook}</p>
                        <button 
                          onClick={() => handleCopy(hook)}
                          className="absolute right-3 top-3 p-1.5 bg-white text-gray-500 hover:text-indigo-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          title="Copy hook"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2 flex justify-between items-end">
                  <span>Full Script</span>
                  <button 
                    onClick={() => handleCopy(result.script)}
                    className="text-sm font-normal text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" /> Copy Full
                  </button>
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 whitespace-pre-wrap font-serif text-gray-800 leading-relaxed max-h-[400px] overflow-y-auto">
                  {result.script}
                </div>
              </div>

              {(result.visualSuggestions || result.onScreenText || result.cta) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.visualSuggestions && result.visualSuggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Visual Suggestions</h4>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        {result.visualSuggestions.map((v, i) => <li key={i}>{v}</li>)}
                      </ul>
                    </div>
                  )}
                  {result.onScreenText && result.onScreenText.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">On-Screen Text</h4>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        {result.onScreenText.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  )}
                  {result.cta && (
                    <div className="md:col-span-2">
                      <h4 className="font-medium text-gray-800 mb-2">Suggested CTA</h4>
                      <div className="p-3 bg-gray-50 rounded border text-sm text-gray-700">{result.cta}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button variant="secondary" onClick={() => setResult(null)}>
                  Regenerate
                </Button>
                <Button onClick={() => {
                  onGenerated(result);
                  onClose();
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Insert into Editor
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
