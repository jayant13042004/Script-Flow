import React, { useState, useEffect } from 'react';
import { Layers, Plus, Check, X, Film, Hash, Trash2 } from 'lucide-react';
import { Modal, Button, Input } from '../ui';
import type { Script, Playlist } from '../../types';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script | null;
  playlists: Playlist[];
  onSave: (scriptId: string, playlistId: string | null, episodeNumber?: number | null) => Promise<void>;
  onCreatePlaylist: (name: string, description?: string, color?: string) => Promise<Playlist>;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#6366f1', // indigo
];

export function AddToPlaylistModal({
  isOpen,
  onClose,
  script,
  playlists,
  onSave,
  onCreatePlaylist,
}: AddToPlaylistModalProps) {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [episodeNumber, setEpisodeNumber] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [newPlaylistColor, setNewPlaylistColor] = useState(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (script) {
      setSelectedPlaylistId(script.playlistId || null);
      setEpisodeNumber(script.episodeNumber ? String(script.episodeNumber) : '');
    }
  }, [script, isOpen]);

  if (!isOpen || !script) return null;

  const handleCreateNewPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await onCreatePlaylist(
        newPlaylistName.trim(),
        newPlaylistDesc.trim() || undefined,
        newPlaylistColor
      );
      if (created) {
        setSelectedPlaylistId(created.id);
        setIsCreatingNew(false);
        setNewPlaylistName('');
        setNewPlaylistDesc('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!script) return;
    setIsSubmitting(true);
    try {
      const epNum = episodeNumber.trim() ? parseInt(episodeNumber.trim(), 10) : null;
      await onSave(script.id, selectedPlaylistId, epNum && !isNaN(epNum) ? epNum : null);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Script to Series / Playlist" size="md">
      <div className="space-y-5">
        {/* Script Target Summary */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
            <Film className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 font-medium">Adding Script:</p>
            <h4 className="text-sm font-bold text-gray-900 truncate">{script.title || 'Untitled Script'}</h4>
          </div>
        </div>

        {/* Playlist Selector List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Select Series / Playlist
            </label>
            {!isCreatingNew && (
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> New Series
              </button>
            )}
          </div>

          {isCreatingNew ? (
            <form onSubmit={handleCreateNewPlaylist} className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Create New Playlist
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <Input
                label="Series / Playlist Name"
                placeholder="e.g. Masterclass Series 2026"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                required
                autoFocus
              />

              <Input
                label="Description (Optional)"
                placeholder="Short outline of the series"
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
              />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewPlaylistColor(c)}
                      className={`w-5 h-5 rounded-full transition-transform ${
                        newPlaylistColor === c ? 'scale-125 ring-2 ring-offset-2 ring-indigo-400' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreatingNew(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newPlaylistName.trim() || isSubmitting}
                    isLoading={isSubmitting}
                  >
                    Create & Select
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {/* Option: None / Standalone */}
              <button
                type="button"
                onClick={() => setSelectedPlaylistId(null)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  selectedPlaylistId === null
                    ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-500'
                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full border-2 border-gray-300 bg-white flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold">Standalone Script (No Playlist)</p>
                    <p className="text-[10px] text-gray-400">Regular standalone YouTube / social script</p>
                  </div>
                </div>
                {selectedPlaylistId === null && <Check className="w-4 h-4 text-indigo-600" />}
              </button>

              {/* Playlists List */}
              {playlists.map((pl) => {
                const isSelected = selectedPlaylistId === pl.id;
                return (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => setSelectedPlaylistId(pl.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-500'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: pl.color || '#6366f1' }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{pl.name}</p>
                        {pl.description && (
                          <p className="text-[10px] text-gray-400 truncate">{pl.description}</p>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 flex-shrink-0 ml-2" />}
                  </button>
                );
              })}

              {playlists.length === 0 && (
                <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center">
                  <p className="text-xs text-gray-400 mb-2">No playlists created yet.</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsCreatingNew(true)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Create Your First Playlist
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Optional Episode Number (shown only if playlist is selected) */}
        {selectedPlaylistId !== null && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5 animate-in fade-in">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-indigo-600" /> Episode Number (Optional)
            </label>
            <p className="text-[11px] text-gray-400">
              Set which part or episode this script is in the series (e.g. Episode 1, 2, 3...)
            </p>
            <input
              type="number"
              min="1"
              max="999"
              placeholder="e.g. 1"
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(e.target.value)}
              className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            {script.playlistId && (
              <button
                type="button"
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await onSave(script.id, null, null);
                    onClose();
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove from Series
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
