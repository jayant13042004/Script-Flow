import { create } from 'zustand';
import { Hook, HookCategory } from '../types';
import { hookLibrary as builtInHooks } from '../data/hookLibrary';
import { LocalStorageService } from '../services/storage/localStorage';
import { generateId } from '../lib/utils';

const storage = new LocalStorageService();

interface HookState {
  hooks: Hook[]; // built-in + custom
  favorites: string[]; // hook IDs
  searchQuery: string;
  activeCategory: HookCategory | 'all' | 'favorites';
  
  loadHooks: () => void;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: HookCategory | 'all' | 'favorites') => void;
  toggleFavorite: (hookId: string) => void;
  addCustomHook: (text: string, category: HookCategory, example: string) => void;
  deleteCustomHook: (id: string) => void;
  filteredHooks: () => Hook[];
}

export const useHookStore = create<HookState>((set, get) => ({
  hooks: [],
  favorites: [],
  searchQuery: '',
  activeCategory: 'all',

  loadHooks: () => {
    const customHooks = storage.getCustomHooks();
    const favorites = storage.getFavorites();
    set({ 
      hooks: [...builtInHooks, ...customHooks],
      favorites
    });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setActiveCategory: (category) => set({ activeCategory: category }),
  
  toggleFavorite: (hookId) => {
    storage.toggleFavorite(hookId);
    set({ favorites: storage.getFavorites() });
  },
  
  addCustomHook: (text, category, example) => {
    const newHook = storage.createCustomHook({
      text,
      category,
      example
    });
    set((state) => ({ hooks: [...state.hooks, newHook] }));
  },
  
  deleteCustomHook: (id) => {
    storage.deleteCustomHook(id);
    set((state) => ({ hooks: state.hooks.filter(h => h.id !== id) }));
  },
  
  filteredHooks: () => {
    const { hooks, searchQuery, activeCategory, favorites } = get();
    
    return hooks.filter(hook => {
      const matchesSearch = hook.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (hook.example && hook.example.toLowerCase().includes(searchQuery.toLowerCase()));
      
      let matchesCategory = true;
      if (activeCategory === 'favorites') {
        matchesCategory = favorites.includes(hook.id);
      } else if (activeCategory !== 'all') {
        matchesCategory = hook.category === activeCategory;
      }
      
      return matchesSearch && matchesCategory;
    });
  }
}));
