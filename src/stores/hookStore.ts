import { create } from 'zustand';
import { hookLibrary } from '../data/hookLibrary';
import type { Hook, HookCategory } from '../types';
import { supabaseStorage } from '../services/supabase/storageService';
import { LocalStorageService } from '../services/storage/localStorage';
import { isSupabaseConfigured } from '../services/supabase/client';

const localStorage = new LocalStorageService();
const useSupabase = () => isSupabaseConfigured();

interface HookState {
  hooks: Hook[];
  favoriteIds: string[];
  searchQuery: string;
  activeCategory: HookCategory | 'all' | 'favorites';

  loadHooks: (userId: string) => Promise<void>;
  addCustomHook: (userId: string, hook: Omit<Hook, 'id'>) => Promise<void>;
  deleteCustomHook: (id: string) => Promise<void>;
  toggleFavorite: (userId: string, hookId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: HookCategory | 'all' | 'favorites') => void;
  filteredHooks: () => Hook[];
}

export const useHookStore = create<HookState>((set, get) => ({
  hooks: [],
  favoriteIds: [],
  searchQuery: '',
  activeCategory: 'all',

  loadHooks: async (userId) => {
    try {
      const [customHooks, favoriteIds] = await Promise.all([
        useSupabase()
          ? supabaseStorage.getCustomHooks(userId)
          : localStorage.getCustomHooks(),
        useSupabase()
          ? supabaseStorage.getFavoriteIds(userId)
          : Promise.resolve(localStorage.getFavorites()),
      ]);
      set({ hooks: [...hookLibrary, ...customHooks], favoriteIds });
    } catch (e) {
      console.error('loadHooks error:', e);
      // Fallback: load built-in hooks
      set({ hooks: [...hookLibrary], favoriteIds: [] });
    }
  },

  addCustomHook: async (userId, hook) => {
    const newHook = useSupabase()
      ? await supabaseStorage.createCustomHook(userId, hook)
      : localStorage.createCustomHook(hook);
    set((state) => ({ hooks: [...state.hooks, newHook] }));
  },

  deleteCustomHook: async (id) => {
    if (useSupabase()) {
      await supabaseStorage.deleteCustomHook(id);
    } else {
      localStorage.deleteCustomHook(id);
    }
    set((state) => ({ hooks: state.hooks.filter((h) => h.id !== id) }));
  },

  toggleFavorite: async (userId, hookId) => {
    const { favoriteIds } = get();
    const isFav = favoriteIds.includes(hookId);

    if (useSupabase()) {
      if (isFav) {
        await supabaseStorage.removeFavorite(userId, hookId);
      } else {
        await supabaseStorage.addFavorite(userId, hookId);
      }
    } else {
      // LocalStorageService uses toggleFavorite which handles add/remove
      localStorage.toggleFavorite(hookId);
    }

    set({
      favoriteIds: isFav
        ? favoriteIds.filter((id) => id !== hookId)
        : [...favoriteIds, hookId],
    });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveCategory: (category) => set({ activeCategory: category }),

  filteredHooks: () => {
    const { hooks, favoriteIds, activeCategory, searchQuery } = get();
    let filtered = hooks;

    if (activeCategory === 'favorites') {
      filtered = hooks.filter((h) => favoriteIds.includes(h.id));
    } else if (activeCategory !== 'all') {
      filtered = hooks.filter((h) => h.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (h) => h.text.toLowerCase().includes(q) || h.example.toLowerCase().includes(q)
      );
    }

    return filtered;
  },
}));
