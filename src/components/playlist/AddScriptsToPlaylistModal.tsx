import React, { useState, useMemo } from 'react';
import { Search, Check, Plus, Film, Clock, Type, CheckSquare, Square } from 'lucide-react';
import { Modal, Button } from '../ui';
import { formatRelativeTime } from '../../lib/utils';
import type { Script, Playlist } from '../../types';

interface AddScriptsToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Playlist | null;
  allScripts: Script[];
  onAddScripts: (scriptIds: string[], playlistId: string) => Promise<void>;
}

export function AddScriptsToPlaylistModal({
  isOpen,
  onClose,
  playlist,
  allScripts,
  onAddScripts,
}: AddScriptsToPlaylistModalProps) {
  const [search, setSearch] = useState('');
  const [selectedScriptIds, setSelectedScriptIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter scripts: exclude ones already in this playlist, apply search
  const availableScripts = useMemo(() => {
    if (!playlist) return [];
    return allScripts.filter((s) => {
      const isNotCurrent = s.playlistId !== playlist.id;
      const matchesSearch =
        !search.trim() ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        (s.plainText && s.plainText.toLowerCase().includes(search.toLowerCase()));
      return isNotCurrent && matchesSearch;
    });
  }, [allScripts, playlist, search]);

  if (!isOpen || !playlist) return null;

  const toggleSelect = (id: string) => {
    const next = new Set(selectedScriptIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedScriptIds(next);
  };

  const selectAll = () => {
    if (selectedScriptIds.size === availableScripts.length) {
      setSelectedScriptIds(new Set());
    } else {
      setSelectedScriptIds(new Set(availableScripts.map((s) => s.id)));
    }
  };

  const handleSave = async () => {
    if (selectedScriptIds.size === 0) return;
    setIsSubmitting(true);
    try {
      await onAddScripts(Array.from(selectedScriptIds), playlist.id);
      setSelectedScriptIds(new Set());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Existing Scripts to "${playlist.name}"`} size="lg">
      <div className="space-y-4">
        {/* Playlist Banner */}
        <div
          className="p-3.5 rounded-xl border flex items-center gap-3"
          style={{ backgroundColor: `${playlist.color || '#6366f1'}15`, borderColor: `${playlist.color || '#6366f1'}40` }}
        >
          <span
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: playlist.color || '#6366f1' }}
          />
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-gray-900 truncate">{playlist.name}</h4>
            <p className="text-xs text-gray-500 truncate">
              {playlist.description || 'Select scripts from your library below to add them to this series.'}
            </p>
          </div>
        </div>

        {/* Search & Selection Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scripts to add..."
              className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          {availableScripts.length > 0 && (
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1.5 shrink-0 px-2 py-1 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              {selectedScriptIds.size === availableScripts.length ? (
                <>
                  <CheckSquare className="w-4 h-4" /> Deselect All
                </>
              ) : (
                <>
                  <Square className="w-4 h-4" /> Select All ({availableScripts.length})
                </>
              )}
            </button>
          )}
        </div>

        {/* Scripts Checklist */}
        <div className="max-h-72 overflow-y-auto space-y-2 border border-gray-100 rounded-xl p-2 bg-gray-50/50">
          {availableScripts.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              {search ? 'No scripts match your search.' : 'All your existing scripts are already in this series!'}
            </div>
          ) : (
            availableScripts.map((script) => {
              const isChecked = selectedScriptIds.has(script.id);
              return (
                <div
                  key={script.id}
                  onClick={() => toggleSelect(script.id)}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 cursor-pointer transition-all ${
                    isChecked
                      ? 'border-indigo-500 bg-indigo-50/70 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(script.id)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h5 className="text-xs font-bold text-gray-900 truncate">
                        {script.title || 'Untitled Script'}
                      </h5>
                      {script.playlistId && (
                        <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          In other series
                        </span>
                      )}
                    </div>

                    {script.plainText && (
                      <p className="text-[11px] text-gray-400 line-clamp-1 mb-1.5">
                        {script.plainText}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(script.updatedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Type className="w-3 h-3" />
                        {script.wordCount || 0} words
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium">
            {selectedScriptIds.size} script{selectedScriptIds.size === 1 ? '' : 's'} selected
          </span>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={selectedScriptIds.size === 0 || isSubmitting}
              isLoading={isSubmitting}
            >
              Add to Playlist ({selectedScriptIds.size})
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
