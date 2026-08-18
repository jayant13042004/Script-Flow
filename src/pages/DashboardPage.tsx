import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Plus, Search, FolderOpen, FileText, MoreHorizontal,
  Trash2, Copy, PenLine, Clock, Type, Timer,
  FolderPlus, LogOut, ChevronRight, Archive, Edit3, BarChart2,
  Lightbulb, Sparkles, Layers, ListPlus, ArrowLeft
} from 'lucide-react';
import { useScriptStore } from '../stores/scriptStore';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { formatRelativeTime, formatDuration } from '../lib/utils';
import { ScriptStatusBadge } from '../components/dashboard/ScriptStatusBadge';
import { ScriptAnalyticsModal } from '../components/dashboard/ScriptAnalyticsModal';
import { VideoIdeasModal } from '../components/ai/VideoIdeasModal';
import { PlaylistModal } from '../components/playlist/PlaylistModal';
import { AddToPlaylistModal } from '../components/playlist/AddToPlaylistModal';
import { AddScriptsToPlaylistModal } from '../components/playlist/AddScriptsToPlaylistModal';
import { exportToPdf } from '../lib/exportImport';
import type { Script, Folder, ScriptStatus, Playlist } from '../types';

function ScriptCard({
  script,
  playlists,
  onOpen,
  onDelete,
  onDuplicate,
  onShowAnalytics,
  onAddToPlaylist,
}: {
  script: Script;
  playlists: Playlist[];
  onOpen: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onShowAnalytics: () => void;
  onAddToPlaylist: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const playlist = script.playlistId ? playlists.find((p) => p.id === script.playlistId) : null;

  return (
    <div
      className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
      onClick={onOpen}
    >
      <div>
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-900 transition-colors flex-shrink-0">
              <FileText className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{script.title || 'Untitled Script'}</h3>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
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
                title="More Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
                  <div className="absolute right-0 top-8 z-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 animate-scale-in">
                    <button
                      onClick={(e) => { e.stopPropagation(); onAddToPlaylist(); setShowMenu(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{script.playlistId ? 'Change Series / Playlist' : 'Add to Series / Playlist'}</span>
                    </button>
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
                    <div className="border-t border-gray-100 my-1" />
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

        {/* Series / Playlist Badge */}
        {playlist && (
          <div className="mb-2.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: playlist.color || '#6366f1' }}
              />
              <span className="truncate max-w-[140px]">{playlist.name}</span>
              {script.episodeNumber ? (
                <span className="text-indigo-400 font-mono text-[10px]">Ep {script.episodeNumber}</span>
              ) : null}
            </span>
          </div>
        )}

        {script.plainText && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
            {script.plainText.slice(0, 150)}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100/60 mt-2">
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
    scripts, folders, playlists, searchQuery, activeFolderId, activePlaylistId,
    loadScripts, loadFolders, loadPlaylists, createScript, updateScript, deleteScript,
    duplicateScript, setSearchQuery, setActiveFolderId, setActivePlaylistId,
    createFolder, deleteFolder, createPlaylist, deletePlaylist, filteredScripts
  } = useScriptStore();

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [selectedAnalyticsScript, setSelectedAnalyticsScript] = useState<Script | null>(null);
  const [showIdeasModal, setShowIdeasModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [scriptForPlaylist, setScriptForPlaylist] = useState<Script | null>(null);
  const [showAddScriptsToActivePlaylist, setShowAddScriptsToActivePlaylist] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadScripts(user.id);
      loadFolders(user.id);
      loadPlaylists(user.id);
    }
  }, [user?.id]);

  const handleNewScript = async () => {
    if (!user?.id) return;
    const script = await createScript(user.id, 'Untitled Script', activeFolderId, activePlaylistId);
    navigate(`/editor/${script.id}`);
  };

  const handleSelectIdea = async (idea: import('../types/ai').VideoIdea) => {
    if (!user?.id) return;
    setShowIdeasModal(false);
    const newScript = await createScript(user.id, idea.title, activeFolderId, activePlaylistId);
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

  const handleSaveScriptToPlaylist = async (scriptId: string, playlistId: string | null, episodeNumber?: number | null) => {
    await updateScript(scriptId, {
      playlistId,
      episodeNumber: episodeNumber ?? null,
    });
  };

  const handleBatchAddScriptsToPlaylist = async (scriptIds: string[], playlistId: string) => {
    for (const scriptId of scriptIds) {
      await updateScript(scriptId, { playlistId });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayedScripts = filteredScripts();
  const activePlaylist = activePlaylistId ? playlists.find((p) => p.id === activePlaylistId) : null;
  const activeFolder = activeFolderId ? folders.find((f) => f.id === activeFolderId) : null;

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
                className="w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              />
            </div>

            <button
              onClick={handleNewScript}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Script</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-60 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-8">
            <nav className="space-y-1">
              <button
                onClick={() => {
                  setActiveFolderId(null);
                  setActivePlaylistId(null);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                  !activeFolderId && !activePlaylistId
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4 text-gray-500" />
                <span>All Scripts</span>
                <span className="ml-auto text-xs text-gray-400">{scripts.length}</span>
              </button>
            </nav>

            {/* Folders */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Folders</h2>
                <button
                  onClick={() => setShowNewFolder(!showNewFolder)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="New Folder"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <nav className="space-y-0.5">
                {folders.map((folder) => (
                  <div key={folder.id} className="group relative">
                    <button
                      onClick={() => {
                        setActiveFolderId(folder.id);
                        setActivePlaylistId(null);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                        activeFolderId === folder.id
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <FolderOpen className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{folder.name}</span>
                      <span className="ml-auto text-xs text-gray-400">
                        {scripts.filter((s) => s.folderId === folder.id).length}
                      </span>
                    </button>
                  </div>
                ))}
              </nav>
            </div>

            {/* Sidebar - Video Series & Playlists */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" /> Series / Playlists
                </h2>
                <button
                  onClick={() => setShowPlaylistModal(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Manage Playlists"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <nav className="space-y-0.5">
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => {
                      setActivePlaylistId(pl.id);
                      setActiveFolderId(null);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                      activePlaylistId === pl.id
                        ? 'bg-indigo-50 text-indigo-900 font-semibold border border-indigo-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: pl.color || '#6366f1' }}
                    />
                    <span className="truncate">{pl.name}</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {scripts.filter((s) => s.playlistId === pl.id).length}
                    </span>
                  </button>
                ))}
                {playlists.length === 0 && (
                  <button
                    onClick={() => setShowPlaylistModal(true)}
                    className="w-full text-left px-3 py-2 text-xs text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
                  >
                    <ListPlus className="w-3.5 h-3.5" /> + New Series Playlist
                  </button>
                )}
              </nav>
            </div>

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
          {/* Active Playlist Hero Banner (If viewing a playlist) */}
          {activePlaylist && (
            <div
              className="mb-6 p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              style={{
                backgroundColor: `${activePlaylist.color || '#6366f1'}10`,
                borderColor: `${activePlaylist.color || '#6366f1'}35`,
              }}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: activePlaylist.color || '#6366f1' }}
                >
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-white/80 px-2 py-0.5 rounded-md border border-indigo-200">
                      Video Series Playlist
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {displayedScripts.length} Episode{displayedScripts.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mt-1">{activePlaylist.name}</h2>
                  {activePlaylist.description && (
                    <p className="text-xs text-gray-600 mt-0.5 max-w-xl">{activePlaylist.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  onClick={() => setShowAddScriptsToActivePlaylist(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Scripts to Series</span>
                </button>
                <button
                  onClick={() => setActivePlaylistId(null)}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
                  title="View All Scripts"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> All Scripts
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {activePlaylist
                  ? activePlaylist.name
                  : activeFolder
                  ? activeFolder.name
                  : 'All Scripts'}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {displayedScripts.length} {displayedScripts.length === 1 ? 'script' : 'scripts'}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>
          </div>

          {displayedScripts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-gray-200 rounded-2xl p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
                <FileText className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery
                  ? 'No scripts found'
                  : activePlaylist
                  ? `No scripts in "${activePlaylist.name}" yet`
                  : 'No scripts yet'}
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs">
                {searchQuery
                  ? 'Try a different search term'
                  : activePlaylist
                  ? 'Add your existing scripts to this series or write a new episode!'
                  : 'Create your first script and start writing'}
              </p>
              <div className="flex items-center gap-3">
                {activePlaylist && (
                  <button
                    onClick={() => setShowAddScriptsToActivePlaylist(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Add Existing Scripts
                  </button>
                )}
                <button
                  onClick={handleNewScript}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Script
                </button>
              </div>
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
                .sort((a, b) => {
                  // If viewing playlist with episode numbers, sort by episode number first
                  if (activePlaylistId && a.episodeNumber && b.episodeNumber) {
                    return a.episodeNumber - b.episodeNumber;
                  }
                  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                })
                .map((script) => (
                  <ScriptCard
                    key={script.id}
                    script={script}
                    playlists={playlists}
                    onOpen={() => handleOpenScript(script.id)}
                    onShowAnalytics={() => setSelectedAnalyticsScript(script)}
                    onAddToPlaylist={() => setScriptForPlaylist(script)}
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

      {/* Add / Move Script to Playlist Modal */}
      <AddToPlaylistModal
        isOpen={Boolean(scriptForPlaylist)}
        onClose={() => setScriptForPlaylist(null)}
        script={scriptForPlaylist}
        playlists={playlists}
        onSave={handleSaveScriptToPlaylist}
        onCreatePlaylist={async (name, desc, color) => {
          if (user?.id) {
            return await createPlaylist(user.id, name, desc, color);
          }
          throw new Error('User not found');
        }}
      />

      {/* Batch Add Scripts to Active Playlist Modal */}
      <AddScriptsToPlaylistModal
        isOpen={showAddScriptsToActivePlaylist}
        onClose={() => setShowAddScriptsToActivePlaylist(false)}
        playlist={activePlaylist || null}
        allScripts={scripts}
        onAddScripts={handleBatchAddScriptsToPlaylist}
      />

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

      {/* Video Series & Playlists Manager Modal */}
      <PlaylistModal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        playlists={playlists}
        onCreatePlaylist={async (name, desc, color) => {
          if (user?.id) await createPlaylist(user.id, name, desc, color);
        }}
        onDeletePlaylist={async (id) => {
          await deletePlaylist(id);
        }}
      />
    </div>
  );
}
