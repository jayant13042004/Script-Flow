import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Plus, Search, FolderOpen, FileText, MoreHorizontal,
  Trash2, Copy, PenLine, Clock, Type, Timer,
  FolderPlus, LogOut, ChevronRight, Archive, Edit3, BarChart2,
  Lightbulb, Sparkles
} from 'lucide-react';
import { useScriptStore } from '../stores/scriptStore';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { formatRelativeTime, formatDuration } from '../lib/utils';
import { ScriptStatusBadge } from '../components/dashboard/ScriptStatusBadge';
import { ScriptAnalyticsModal } from '../components/dashboard/ScriptAnalyticsModal';
import { VideoIdeasModal } from '../components/ai/VideoIdeasModal';
import { exportToPdf } from '../lib/exportImport';
import type { Script, Folder, ScriptStatus } from '../types';

function ScriptCard({ script, onOpen, onDelete, onDuplicate, onShowAnalytics }: {
  script: Script;
  onOpen: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onShowAnalytics: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-900 transition-colors">
            <FileText className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
          </div>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{script.title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onShowAnalytics(); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"
            title="View Script Analytics"
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
                <div className="absolute right-0 top-8 z-20 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 animate-scale-in">
                  <button
                    onClick={(e) => { e.stopPropagation(); onShowAnalytics(); setShowMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-blue-600" /> Script Analytics
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDuplicate(); setShowMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" /> Duplicate
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {script.plainText && (
        <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {script.plainText.slice(0, 150)}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(script.updatedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Type className="w-3 h-3" />
            {script.wordCount} words
          </span>
          {script.estimatedDuration > 0 && (
            <span className="flex items-center gap-1">
              <Timer className="w-3 h-3" />
              {formatDuration(script.estimatedDuration)}
            </span>
          )}
        </div>
        <ScriptStatusBadge status={script.status || 'draft'} readOnly />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    scripts, folders, searchQuery, activeFolderId,
    loadScripts, loadFolders, createScript, updateScript, deleteScript,
    duplicateScript, setSearchQuery, setActiveFolderId,
    createFolder, deleteFolder, filteredScripts
  } = useScriptStore();

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [selectedAnalyticsScript, setSelectedAnalyticsScript] = useState<Script | null>(null);
  const [showIdeasModal, setShowIdeasModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadScripts(user.id);
      loadFolders(user.id);
    }
  }, [user?.id]);

  const handleNewScript = async () => {
    if (!user?.id) return;
    const script = await createScript(user.id, 'Untitled Script', activeFolderId);
    navigate(`/editor/${script.id}`);
  };

  const handleSelectIdea = async (idea: import('../types/ai').VideoIdea) => {
    if (!user?.id) return;
    setShowIdeasModal(false);
    const newScript = await createScript(user.id, idea.title, activeFolderId);
    if (newScript) {
      const initialText = idea.hook ? `[Hook]:\n${idea.hook}\n\n[Angle / Outline]:\n${idea.angle}\n\n` : '';
      await updateScript(newScript.id, {
        plainText: initialText,
        content: `<p><strong>[Hook]:</strong><br>${idea.hook || ''}</p><p><strong>[Angle / Outline]:</strong><br>${idea.angle || ''}</p><p></p>`,
      });
      navigate(`/editor/${newScript.id}`);
    }
  };

  const handleOpenScript = (scriptId: string) => {
    navigate(`/editor/${scriptId}`);
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim() && user?.id) {
      await createFolder(user.id, newFolderName.trim());
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayedScripts = filteredScripts();
  const hasFivePlusScripts = scripts.filter(s => s.plainText?.trim() || (s.title && s.title !== 'Untitled Script')).length >= 5;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-gray-900">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <PenLine className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">ScriptFlow</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scripts..."
                className="w-60 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* AI Video Ideas Button (Available when creator has 5+ scripts) */}
            {hasFivePlusScripts && (
              <button
                onClick={() => setShowIdeasModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all shadow-2xs"
                title="Generate video ideas from your 5+ past scripts"
              >
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span className="hidden sm:inline">💡 Niche Video Ideas</span>
              </button>
            )}

            <button
              onClick={handleNewScript}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              New Script
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar - Folders */}
        <aside className="w-56 flex-shrink-0">
          <div className="sticky top-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Folders</h2>
              <button
                onClick={() => setShowNewFolder(true)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="New folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            <nav className="space-y-0.5">
              <button
                onClick={() => setActiveFolderId(null)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeFolderId === null
                    ? 'bg-gray-200 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                All Scripts
                <span className="ml-auto text-xs text-gray-400">{scripts.length}</span>
              </button>

              {folders.map((folder) => (
                <div key={folder.id} className="group flex items-center">
                  <button
                    onClick={() => setActiveFolderId(folder.id)}
                    className={`flex-1 flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeFolderId === folder.id
                        ? 'bg-gray-200 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <FolderOpen className="w-4 h-4" style={folder.color ? { color: folder.color } : undefined} />
                    <span className="truncate">{folder.name}</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {scripts.filter(s => s.folderId === folder.id).length}
                    </span>
                  </button>
                  <button
                    onClick={async () => await deleteFolder(folder.id)}
                    className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete folder"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </nav>

            {showNewFolder && (
              <div className="mt-2 flex gap-1.5">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateFolder();
                    if (e.key === 'Escape') { setShowNewFolder(false); setNewFolderName(''); }
                  }}
                  placeholder="Folder name"
                  className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleCreateFolder}
                  className="px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800"
                >
                  Add
                </button>
              </div>
            )}

            {user && (
              <div className="mt-8 pt-4 border-t border-gray-200">
                <div className="px-3 flex items-center gap-3">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-gray-600">
                        {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.displayName}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {activeFolderId
                  ? folders.find(f => f.id === activeFolderId)?.name || 'Folder'
                  : 'All Scripts'
                }
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {displayedScripts.length} {displayedScripts.length === 1 ? 'script' : 'scripts'}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>
          </div>

          {displayedScripts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
                <FileText className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No scripts found' : 'No scripts yet'}
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Create your first script and start writing'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={handleNewScript}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Script
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* New Script card */}
              <button
                onClick={handleNewScript}
                className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center gap-3 min-h-[160px] text-gray-400 hover:border-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-all"
              >
                <Plus className="w-8 h-8" />
                <span className="text-sm font-medium">New Script</span>
              </button>

              {displayedScripts
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .map((script) => (
                  <ScriptCard
                    key={script.id}
                    script={script}
                    onOpen={() => handleOpenScript(script.id)}
                    onShowAnalytics={() => setSelectedAnalyticsScript(script)}
                    onDelete={async () => await deleteScript(script.id)}
                    onDuplicate={async () => {
                      if (!user?.id) return;
                      const dup = await duplicateScript(user.id, script.id);
                      if (dup) navigate(`/editor/${dup.id}`);
                    }}
                  />
                ))}
            </div>
          )}
        </main>
      </div>

      {/* Individual Script Analytics Modal */}
      <ScriptAnalyticsModal
        isOpen={Boolean(selectedAnalyticsScript)}
        onClose={() => setSelectedAnalyticsScript(null)}
        script={selectedAnalyticsScript}
        onOpenScript={(scriptId) => {
          setSelectedAnalyticsScript(null);
          navigate(`/editor/${scriptId}`);
        }}
        onExportPdf={(scriptToExport) => {
          exportToPdf(scriptToExport);
        }}
      />

      {/* AI Niche Video Ideas Modal (Unlocked with 5+ scripts) */}
      <VideoIdeasModal
        isOpen={showIdeasModal}
        onClose={() => setShowIdeasModal(false)}
        pastScripts={scripts}
        onSelectIdea={handleSelectIdea}
      />
    </div>
  );
}
