import React, { useState, useEffect } from 'react';
import { Lightbulb, Search, X, Plus } from 'lucide-react';
import { useHookStore } from '../../stores/hookStore';
import { useAuthStore } from '../../stores/authStore';
import { HookCard } from './HookCard';
import { Button, Input, Textarea, Select, Modal } from '../ui';
import { HOOK_CATEGORIES } from '../../lib/constants';
import type { HookCategory } from '../../types';

interface HookLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
}

export const HookLibrary: React.FC<HookLibraryProps> = ({ isOpen, onClose, onInsert }) => {
  const {
    hooks,
    favoriteIds,
    searchQuery,
    activeCategory,
    loadHooks,
    setSearchQuery,
    setActiveCategory,
    toggleFavorite,
    addCustomHook,
    deleteCustomHook,
    filteredHooks
  } = useHookStore();

  const { user } = useAuthStore();

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Custom Hook Form State
  const [newHookText, setNewHookText] = useState('');
  const [newHookExample, setNewHookExample] = useState('');
  const [newHookCategory, setNewHookCategory] = useState<HookCategory>('curiosity');

  useEffect(() => {
    if (user?.id) loadHooks(user.id);
  }, [user?.id]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleAddCustomHook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHookText.trim() || !user?.id) return;

    await addCustomHook(user.id, {
      text: newHookText.trim(),
      category: newHookCategory,
      example: newHookExample.trim(),
      isCustom: true,
    });

    setNewHookText('');
    setNewHookExample('');
    setIsAddModalOpen(false);
  };

  const activeHooks = filteredHooks();
  const displayHooks = showFavoritesOnly
    ? activeHooks.filter(h => (favoriteIds ?? []).includes(h.id))
    : activeHooks;

  return (
    <div className="w-full bg-gray-50 border-l border-gray-200 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <Lightbulb className="text-amber-500" size={20} />
          <h2>Hook Library</h2>
        </div>
        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-4 bg-white border-b border-gray-200 flex flex-col gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search hooks or examples..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={showFavoritesOnly}
              onChange={(e) => setShowFavoritesOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show favorites only
          </label>
        </div>

        <div className="flex overflow-x-auto pb-1 gap-1.5 scrollbar-thin">
          <button
            onClick={() => setActiveCategory('all')}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeCategory === 'all' 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {HOOK_CATEGORIES.map(cat => {
            const count = hooks.filter(h => h.category === cat.value).length;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value as HookCategory)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeCategory === cat.value 
                    ? 'bg-blue-100 text-blue-700 font-semibold' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeCategory === cat.value ? 'bg-blue-200' : 'bg-gray-200'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {displayHooks.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No hooks found matching your criteria.
          </div>
        ) : (
          displayHooks.map(hook => (
            <HookCard
              key={hook.id}
              hook={hook}
              isFavorite={(favoriteIds ?? []).includes(hook.id)}
              onToggleFavorite={() => user?.id && toggleFavorite(user.id, hook.id)}
              onCopy={() => handleCopy(hook.text)}
              onInsert={() => onInsert(hook.text)}
              onDelete={() => user?.id && deleteCustomHook(hook.id)}
            />
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <Button className="w-full gap-2" variant="secondary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          Add Custom Hook
        </Button>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Custom Hook">
        <form onSubmit={handleAddCustomHook} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hook Template *</label>
            <Textarea 
              value={newHookText}
              onChange={(e) => setNewHookText(e.target.value)}
              placeholder="e.g., 3 mistakes you're making with [Topic]"
              required
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <Select 
              value={newHookCategory} 
              onChange={(e) => setNewHookCategory(e.target.value as HookCategory)}
            >
              {HOOK_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Example usage</label>
            <Textarea 
              value={newHookExample}
              onChange={(e) => setNewHookExample(e.target.value)}
              placeholder="e.g., 3 mistakes you're making with React hooks"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Hook</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
