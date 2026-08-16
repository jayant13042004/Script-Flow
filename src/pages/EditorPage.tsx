import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
  PenLine, ArrowLeft, Sparkles, Lightbulb, BarChart3,
  Clapperboard, Layout, RefreshCw, Maximize2, Minimize2,
  Plus, MoreHorizontal, Copy, Trash2, History, Download,
  ChevronDown
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import TextAlign from '@tiptap/extension-text-align';

import { EditorToolbar } from '../components/editor/EditorToolbar';
import { EditorStats } from '../components/editor/EditorStats';
import { FindReplace } from '../components/editor/FindReplace';
import { AiPanel } from '../components/ai/AiPanel';
import { AiGenerateForm } from '../components/ai/AiGenerateForm';
import { HookLibrary } from '../components/hooks/HookLibrary';
import { ProductionPlanner } from '../components/planner/ProductionPlanner';
import { ScriptStructure } from '../components/structure/ScriptStructure';
import { RepurposePanel } from '../components/repurpose/RepurposePanel';
import { Modal } from '../components/ui/Modal';
import { VoiceScriptModal } from '../components/ai/VoiceScriptModal';
import { TeleprompterModal } from '../components/teleprompter/TeleprompterModal';
import { ExportModal } from '../components/editor/ExportModal';
import { ImportModal } from '../components/editor/ImportModal';
import { ShareModal } from '../components/share/ShareModal';
import { AudioRecorder } from '../components/audio/AudioRecorder';
import { ScriptStatusBadge, ScriptStatus } from '../components/dashboard/ScriptStatusBadge';
import { ScriptAnalyticsModal } from '../components/dashboard/ScriptAnalyticsModal';
import { VideoIdeasModal } from '../components/ai/VideoIdeasModal';
import { exportToPdf, downloadFile } from '../lib/exportImport';
import { Mic, Tv, Share2, Upload, Volume2, BarChart2 } from 'lucide-react';

import { useEditorStore } from '../stores/editorStore';
import { useScriptStore } from '../stores/scriptStore';
import { useAuthStore } from '../stores/authStore';
import { useAutosave } from '../hooks/useAutosave';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { formatDuration, formatRelativeTime } from '../lib/utils';
import { countWords, countCharacters, estimateDuration, getPlainTextFromHtml } from '../lib/wordCount';
import type { ProductionSection, ScriptSection } from '../types';
import type { AiGenerateResponse } from '../types/ai';

type PanelType = 'ai' | 'hooks' | 'planner' | 'structure' | 'repurpose';

const panelButtons: { id: PanelType; icon: React.ElementType; label: string }[] = [
  { id: 'ai', icon: Sparkles, label: 'AI Assistant' },
  { id: 'hooks', icon: Lightbulb, label: 'Hook Library' },
  { id: 'planner', icon: Clapperboard, label: 'B-Roll & Planner' },
  { id: 'structure', icon: Layout, label: 'Structure Frameworks' },
  { id: 'repurpose', icon: RefreshCw, label: 'Repurpose' },
];

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    title, setTitle, setContent, setSelectedText, plainText,
    wordCount, characterCount, estimatedDuration: duration,
    isDirty, lastSaved, isFullscreen, toggleFullscreen,
    activePanel, setActivePanel, togglePanel, showFindReplace,
    toggleFindReplace, setScriptId, setIsDirty, setLastSaved, reset
  } = useEditorStore();

  const {
    scripts, loadScripts, loadScript, updateScript, deleteScript, duplicateScript,
    createVersion, getVersions
  } = useScriptStore();

  const { user } = useAuthStore();

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showIdeasModal, setShowIdeasModal] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentScriptObj, setCurrentScriptObj] = useState<any>(null);
  const [productionPlan, setProductionPlan] = useState<ProductionSection[]>([]);
  const [structure, setStructure] = useState<ScriptSection[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      Placeholder.configure({
        placeholder: 'Start writing your script...',
      }),
      CharacterCount,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const json = editor.getJSON();
      const text = editor.getText();
      setContent(json, html, text);
      setIsDirty(true);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        setSelectedText(selectedText);
      } else {
        setSelectedText('');
      }
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
  });

  // Load script on mount
  useEffect(() => {
    if (user?.id && scripts.length === 0) {
      loadScripts(user.id);
    }
    if (id) {
      setScriptId(id);
      loadScript(id).then((script) => {
        if (script) {
          setCurrentScriptObj(script);
          setTitle(script.title);
          if (script.content && editor) {
            editor.commands.setContent(script.content);
            const html = editor.getHTML();
            const text = editor.getText();
            setContent(script.content, html, text);
          }
          if (script.productionPlan) setProductionPlan(script.productionPlan);
          if (script.structure) setStructure(script.structure);
          setIsDirty(false);
          setLastSaved(script.updatedAt);
          setIsInitialized(true);
        } else {
          navigate('/dashboard');
        }
      });
    }

    return () => {
      reset();
    };
  }, [id]);

  // Set content when editor becomes available after script loaded async
  useEffect(() => {
    if (editor && id && !isInitialized) {
      loadScript(id).then((script) => {
        if (script?.content) {
          editor.commands.setContent(script.content);
          const html = editor.getHTML();
          const text = editor.getText();
          setContent(script.content, html, text);
          setIsDirty(false);
          setIsInitialized(true);
        }
      });
    }
  }, [editor, id, isInitialized]);

  // Autosave / Manual Save
  const saveScript = useCallback(async () => {
    if (!id || !editor) return;
    const json = editor.getJSON();
    const text = editor.getText();
    const html = editor.getHTML();
    const words = countWords(text);

    // If script has nothing written and is untitled, do not save
    const isUntouched = (!title.trim() || title === 'Untitled Script') && !text.trim() && productionPlan.length === 0 && structure.length === 0;
    if (isUntouched) {
      return;
    }

    await updateScript(id, {
      title,
      content: json,
      plainText: text,
      wordCount: words,
      characterCount: countCharacters(text),
      estimatedDuration: estimateDuration(words),
      productionPlan: productionPlan.length > 0 ? productionPlan : null,
      structure: structure.length > 0 ? structure : null,
    });
    setIsDirty(false);
    setLastSaved(new Date().toISOString());
  }, [id, editor, title, productionPlan, structure]);

  useAutosave();

  // Keyboard shortcuts
  useKeyboardShortcuts();

  // Title change with autosave
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsDirty(true);
  };

  // AI Replace/Insert handlers
  const handleAiReplace = useCallback((text: string) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from !== to) {
      editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, text).run();
    }
  }, [editor]);

  const handleAiInsert = useCallback((text: string) => {
    if (!editor) return;
    const { to } = editor.state.selection;
    editor.chain().focus().insertContentAt(to, '\n' + text).run();
  }, [editor]);

  // Hook insert handler
  const handleInsertHook = useCallback((text: string) => {
    if (!editor) return;
    // Insert at cursor position or at the beginning
    const pos = editor.state.selection.from;
    editor.chain().focus().insertContentAt(pos, text + '\n\n').run();
  }, [editor]);

  // AI Generate handler
  const handleGenerated = useCallback((result: AiGenerateResponse) => {
    if (!editor) return;
    // Build the full generated content
    let content = '';
    if (result.hooks.length > 0) {
      content += result.hooks[0] + '\n\n';
    }
    content += result.script;
    if (result.cta) {
      content += '\n\n' + result.cta;
    }

    // Insert at current cursor or replace all
    if (editor.getText().trim().length === 0) {
      editor.commands.setContent(`<p>${content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`);
    } else {
      const pos = editor.state.selection.from;
      editor.chain().focus().insertContentAt(pos, content).run();
    }
    setShowGenerateModal(false);
  }, [editor]);

  // Version history (loaded async)
  const [versions, setVersions] = React.useState<any[]>([]);
  useEffect(() => {
    if (id) getVersions(id).then(setVersions);
  }, [id]);

  // Duplicate
  const handleDuplicate = async () => {
    if (!id || !user?.id) return;
    saveScript();
    const dup = await duplicateScript(user.id, id);
    if (dup) navigate(`/editor/${dup.id}`);
  };

  // Fullscreen toggle with native browser API
  const handleToggleFullscreen = () => {
    toggleFullscreen();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      if (isFs !== isFullscreen) {
        toggleFullscreen();
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [isFullscreen, toggleFullscreen]);

  const editorContainerClasses = isFullscreen
    ? 'fixed inset-0 z-50 bg-white overflow-y-auto'
    : 'min-h-screen bg-white';

  return (
    <div className={editorContainerClasses}>
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 no-print">
        <div className="px-4 h-14 flex items-center justify-between gap-4 relative z-20">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={async () => {
                const text = editor ? editor.getText().trim() : '';
                const isUntouched = (!title.trim() || title === 'Untitled Script') && !text && productionPlan.length === 0 && structure.length === 0;
                if (isUntouched && id) {
                  await deleteScript(id);
                } else {
                  await saveScript();
                }
                navigate('/dashboard');
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="text-base font-semibold text-gray-900 bg-transparent border-none outline-none focus:outline-none min-w-0 flex-1 placeholder-gray-400"
              placeholder="Script title..."
            />
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Status Dropdown */}
            {currentScriptObj && (
              <ScriptStatusBadge
                status={currentScriptObj.status || 'draft'}
                onChange={async (newStatus) => {
                  if (id) {
                    await updateScript(id, { status: newStatus });
                    setCurrentScriptObj((prev: any) => prev ? { ...prev, status: newStatus } : prev);
                  }
                }}
              />
            )}

            {/* Voice Mode Dictation */}
            <button
              onClick={() => setShowVoiceModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
              title="Voice Mode Dictation"
            >
              <Mic className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
              <span className="hidden sm:inline">Voice Mode</span>
            </button>

            {/* Teleprompter Button */}
            <button
              onClick={() => setShowTeleprompter(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
              title="Teleprompter Mode"
            >
              <Tv className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Teleprompter</span>
            </button>

            {/* AI Niche Ideas Button (when creator has 5+ past scripts) */}
            {scripts.filter(s => s.plainText?.trim() || (s.title && s.title !== 'Untitled Script')).length >= 5 && (
              <button
                onClick={() => setShowIdeasModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
                title="Generate video ideas tailored to your niche (5+ scripts detected)"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Video Ideas</span>
              </button>
            )}

            {/* AI Generate Button */}
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              title="Generate with AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">AI Generate</span>
            </button>

            {/* Audio Voice Recorder */}
            <button
              onClick={() => setShowAudioRecorder(!showAudioRecorder)}
              className={`p-2 rounded-lg transition-colors ${
                showAudioRecorder ? 'bg-amber-100 text-amber-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Audio Voice Recorder"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Share Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share Public Link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Export Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export Script (PDF, MD, Word, TXT)"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Import Button */}
            <button
              onClick={() => setShowImportModal(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Import Script File"
            >
              <Upload className="w-4 h-4" />
            </button>

            {/* Panel toggles */}
            <div className="flex items-center border-l border-gray-200 ml-2 pl-2 gap-0.5">
              {panelButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => togglePanel(btn.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    activePanel === btn.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title={btn.label}
                >
                  <btn.icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            <div className="border-l border-gray-200 ml-1 pl-1 flex items-center gap-0.5">
              <button
                onClick={handleToggleFullscreen}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* More menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-10 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 animate-scale-in">
                      <button
                        onClick={() => { setShowAnalyticsModal(true); setShowMenu(false); }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <BarChart2 className="w-3.5 h-3.5 text-blue-600" /> Script Analytics & Stats
                      </button>
                      <button
                        onClick={() => { handleDuplicate(); setShowMenu(false); }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Copy className="w-3.5 h-3.5" /> Duplicate Script
                      </button>
                      <button
                        onClick={() => {
                          if (id) createVersion(id);
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <History className="w-3.5 h-3.5" /> Save Version
                      </button>
                      <button
                        onClick={() => { setShowVersions(true); setShowMenu(false); }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <History className="w-3.5 h-3.5" /> Version History ({versions.length})
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={() => {
                          if (id) { deleteScript(id); navigate('/dashboard'); }
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Script
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Editor Toolbar */}
        <EditorToolbar editor={editor} />
      </header>

      {/* Find & Replace */}
      {showFindReplace && (
        <FindReplace
          editor={editor}
          isOpen={showFindReplace}
          onClose={toggleFindReplace}
        />
      )}

      {/* Main Area */}
      <div className="flex">
        {/* Editor */}
        <div className={`flex-1 transition-all duration-300 ${activePanel ? 'mr-0' : ''}`}>
          <div className="max-w-[720px] mx-auto px-6 sm:px-10 lg:px-16 pb-32">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Side Panel */}
        {activePanel && (
          <aside className="w-[400px] flex-shrink-0 border-l border-gray-200 bg-gray-50 h-[calc(100vh-7.5rem)] sticky top-[7.5rem] overflow-y-auto animate-slide-in-right no-print">
            {activePanel === 'ai' && (
              <AiPanel
                isOpen={true}
                onClose={() => setActivePanel(null)}
                onReplace={handleAiReplace}
                onInsert={handleAiInsert}
              />
            )}
            {activePanel === 'hooks' && (
              <HookLibrary
                isOpen={true}
                onClose={() => setActivePanel(null)}
                onInsert={handleInsertHook}
              />
            )}
            {activePanel === 'planner' && (
              <ProductionPlanner
                isOpen={true}
                onClose={() => setActivePanel(null)}
                sections={productionPlan}
                onChange={(sections) => {
                  setProductionPlan(sections);
                  setIsDirty(true);
                }}
              />
            )}
            {activePanel === 'structure' && (
              <ScriptStructure
                isOpen={true}
                onClose={() => setActivePanel(null)}
                sections={structure}
                onChange={(sections) => {
                  setStructure(sections);
                  setIsDirty(true);
                }}
              />
            )}
            {activePanel === 'repurpose' && (
              <RepurposePanel
                isOpen={true}
                onClose={() => setActivePanel(null)}
                scriptContent={plainText}
                scriptTitle={title}
              />
            )}
          </aside>
        )}
      </div>

      {/* Editor Stats Bar */}
      <div className="fixed bottom-0 left-0 right-0 no-print">
        <EditorStats
          wordCount={wordCount}
          characterCount={characterCount}
          estimatedDuration={duration}
          lastSaved={lastSaved}
          isDirty={isDirty}
        />
      </div>

      {/* Generate Script Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Script with AI"
        size="lg"
      >
        <AiGenerateForm
          onGenerated={handleGenerated}
          onClose={() => setShowGenerateModal(false)}
        />
      </Modal>

      {/* Version History Modal */}
      <Modal
        isOpen={showVersions}
        onClose={() => setShowVersions(false)}
        title="Version History"
        size="md"
      >
        <div className="p-4">
          {versions.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No versions saved yet</p>
              <p className="text-xs text-gray-400 mt-1">Versions are saved automatically as you write</p>
            </div>
          ) : (
            <div className="space-y-2">
              {versions
                .sort((a, b) => b.versionNumber - a.versionNumber)
                .map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">Version {version.versionNumber}</p>
                      <p className="text-xs text-gray-500">
                        {formatRelativeTime(version.createdAt)} · {version.wordCount} words
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (editor && version.content) {
                          editor.commands.setContent(version.content);
                          setIsDirty(true);
                          setShowVersions(false);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Audio Voice Recorder Drawer */}
      {showAudioRecorder && (
        <div className="fixed bottom-12 right-6 z-40 w-96 shadow-2xl rounded-2xl overflow-hidden animate-slide-in-up no-print">
          <AudioRecorder
            onSaveAudio={(url, name) => {
              console.log('Audio recorded:', url, name);
            }}
          />
        </div>
      )}

      {/* Voice Mode Dictation Modal */}
      <VoiceScriptModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onInsert={(scriptText) => {
          if (editor) {
            const pos = editor.state.selection.from;
            editor.chain().focus().insertContentAt(pos, scriptText + '\n\n').run();
          }
          setShowVoiceModal(false);
        }}
      />

      {/* Teleprompter Modal */}
      <TeleprompterModal
        isOpen={showTeleprompter}
        onClose={() => setShowTeleprompter(false)}
        title={title}
        plainText={plainText}
      />

      {/* Export Modal */}
      {currentScriptObj && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          script={{
            ...currentScriptObj,
            title,
            plainText,
            wordCount,
            estimatedDuration: duration,
          }}
        />
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={(importedTitle, importedText) => {
          setTitle(importedTitle);
          if (editor) {
            editor.commands.setContent(`<p>${importedText.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`);
          }
          setIsDirty(true);
          setShowImportModal(false);
        }}
      />

      {/* Share Public Link Modal */}
      {currentScriptObj && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          script={{
            ...currentScriptObj,
            title,
          }}
          onUpdateScript={async (updates) => {
            if (id) {
              await updateScript(id, updates);
              setCurrentScriptObj((prev: any) => prev ? { ...prev, ...updates } : prev);
            }
          }}
        />
      )}

      {/* Script Analytics Modal */}
      {currentScriptObj && (
        <ScriptAnalyticsModal
          isOpen={showAnalyticsModal}
          onClose={() => setShowAnalyticsModal(false)}
          script={{
            ...currentScriptObj,
            title,
            plainText,
            wordCount,
            estimatedDuration: duration,
            productionPlan,
          }}
          onExportPdf={() => {
            setShowAnalyticsModal(false);
            setShowExportModal(true);
          }}
        />
      )}

      {/* AI Niche Video Ideas Modal */}
      <VideoIdeasModal
        isOpen={showIdeasModal}
        onClose={() => setShowIdeasModal(false)}
        pastScripts={scripts}
        onSelectIdea={(idea) => {
          setTitle(idea.title);
          if (editor) {
            const hookBlock = idea.hook ? `<strong>[Hook]:</strong><br>${idea.hook}<br><br>` : '';
            const angleBlock = idea.angle ? `<strong>[Angle / Outline]:</strong><br>${idea.angle}<br><br>` : '';
            editor.commands.setContent(`<p>${hookBlock}${angleBlock}</p>`);
          }
          setIsDirty(true);
          setShowIdeasModal(false);
        }}
      />
    </div>
  );
}
