import React, { useState } from 'react';
import { Layers, Plus, X, Trash2, Edit2, Check } from 'lucide-react';
import { Modal, Button, Input, Textarea } from '../ui';
import type { Playlist } from '../../types';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  onCreatePlaylist: (name: string, description?: string, color?: string) => Promise<any>;
  onDeletePlaylist: (id: string) => Promise<void>;
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

export function PlaylistModal({
  isOpen,
  onClose,
  playlists,
  onCreatePlaylist,
  onDeletePlaylist,
}: PlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreatePlaylist(name.trim(), description.trim(), color);
      setName('');
      setDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Video Series & Playlists Manager" size="md">
      <div className="space-y-6">
        {/* Create New Series Form */}
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-blue-600" /> Create New Series / Course
          </h4>

          <Input
            label="Series Name"
            placeholder="e.g. Python 30-Day Mastery, Cold Email Crash Course"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Short Description / Audience"
            placeholder="e.g. 5-part beginner series on modern Python automation"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <Button type="submit" size="sm" disabled={!name.trim() || isSubmitting} isLoading={isSubmitting}>
              Add Series
            </Button>
          </div>
        </form>

        {/* Existing Playlists List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Your Video Playlists ({playlists.length})
          </h4>

          {playlists.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">
              No series created yet. Add your first video series above to group your episodes!
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: pl.color || '#3b82f6' }}
                    />
                    <div>
                      <h5 className="text-xs font-bold text-gray-900">{pl.name}</h5>
                      {pl.description && <p className="text-[11px] text-gray-400">{pl.description}</p>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeletePlaylist(pl.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
