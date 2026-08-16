import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Plus, Search, FolderOpen, FileText, MoreHorizontal,
  Trash2, Copy, PenLine, Clock, Type, Timer,
  FolderPlus, LogOut, ChevronRight, Archive, Edit3
} from 'lucide-react';
import { useScriptStore } from '../stores/scriptStore';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { formatRelativeTime, formatDuration } from '../lib/utils';
import type { Script, Folder } from '../types';

function ScriptCard({ script, onOpen, onDelete, onDuplicate }: {
  script: Script;
  onOpen: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
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

      {script.plainText && (
        <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {script.plainText.slice(0, 150)}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-400">
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
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    scripts, folders, searchQuery, activeFolderId,
    loadScripts, loadFolders, createScript, deleteScript,
    duplicateScript, setSearchQuery, setActiveFolderId,
    createFolder, deleteFolder, filteredScripts
  } = useScriptStore();

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    loadScripts();
    loadFolders();
  }, []);

  const handleNewScript = () => {
    const script = createScript('Untitled Script', activeFolderId);
    navigate(`/editor/${script.id}`);
  };

  const handleOpenScript = (scriptId: string) => {
    navigate(`/editor/${scriptId}`);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayedScripts = filteredScripts();

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

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scripts..."
                className="w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
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
                    onClick={() => deleteFolder(folder.id)}
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
                    onDelete={() => deleteScript(script.id)}
                    onDuplicate={() => {
                      const dup = duplicateScript(script.id);
                      if (dup) navigate(`/editor/${dup.id}`);
                    }}
                  />
                ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
