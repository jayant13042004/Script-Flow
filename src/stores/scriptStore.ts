import { create } from 'zustand';
import type { Script, Folder, ScriptVersion } from '../types';
import { supabaseStorage } from '../services/supabase/storageService';
import { LocalStorageService } from '../services/storage/localStorage';
import { isSupabaseConfigured } from '../services/supabase/client';

const localStorage = new LocalStorageService();

// Helper: pick the right backend
const useSupabase = () => isSupabaseConfigured();

interface ScriptState {
  scripts: Script[];
  folders: Folder[];
  currentScript: Script | null;
  isLoading: boolean;
  searchQuery: string;
  activeFolderId: string | null;

  // Scripts
  loadScripts: (userId: string) => Promise<void>;
  createScript: (userId: string, title?: string, folderId?: string | null) => Promise<Script>;
  updateScript: (id: string, updates: Partial<Script>) => Promise<void>;
  deleteScript: (id: string) => Promise<void>;
  duplicateScript: (userId: string, id: string) => Promise<Script>;
  setCurrentScript: (script: Script | null) => void;
  loadScript: (id: string) => Promise<Script | null>;

  // Folders
  loadFolders: (userId: string) => Promise<void>;
  createFolder: (userId: string, name: string, color?: string) => Promise<void>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  setActiveFolderId: (id: string | null) => void;

  // Search
  setSearchQuery: (query: string) => void;

  // Versions
  getVersions: (scriptId: string) => Promise<ScriptVersion[]>;
  createVersion: (scriptId: string) => Promise<void>;

  // Computed
  filteredScripts: () => Script[];
}

export const useScriptStore = create<ScriptState>((set, get) => ({
  scripts: [],
  folders: [],
  currentScript: null,
  isLoading: false,
  searchQuery: '',
  activeFolderId: null,

  // ── Scripts ─────────────────────────────────────────────────────────────────

  loadScripts: async (userId) => {
    set({ isLoading: true });
    try {
      const scripts = useSupabase()
        ? await supabaseStorage.getScripts(userId)
        : localStorage.getScripts();
      set({ scripts, isLoading: false });
    } catch (e) {
      console.error('loadScripts error:', e);
      set({ isLoading: false });
    }
  },

  createScript: async (userId, title = 'Untitled Script', folderId = null) => {
    const script = useSupabase()
      ? await supabaseStorage.createScript(userId, { title, folderId })
      : localStorage.createScript({ title, folderId, userId });
    set((state) => ({ scripts: [script, ...state.scripts] }));
    return script;
  },

  updateScript: async (id, updates) => {
    const updated = useSupabase()
      ? await supabaseStorage.updateScript(id, updates)
      : localStorage.updateScript(id, updates);
    if (updated) {
      set((state) => ({
        scripts: state.scripts.map((s) => (s.id === id ? updated : s)),
        currentScript: state.currentScript?.id === id ? updated : state.currentScript,
      }));
    }
  },

  deleteScript: async (id) => {
    if (useSupabase()) {
      await supabaseStorage.deleteScript(id);
    } else {
      localStorage.deleteScript(id);
    }
    set((state) => ({
      scripts: state.scripts.filter((s) => s.id !== id),
      currentScript: state.currentScript?.id === id ? null : state.currentScript,
    }));
  },

  duplicateScript: async (userId, id) => {
    const source = useSupabase()
      ? await supabaseStorage.getScript(id)
      : localStorage.getScript(id);
    if (!source) throw new Error('Script not found');

    const newScript = useSupabase()
      ? await supabaseStorage.createScript(userId, {
          title: `${source.title} (Copy)`,
          content: source.content,
          plainText: source.plainText,
          folderId: source.folderId,
          platform: source.platform,
          contentType: source.contentType,
          tone: source.tone,
          language: source.language,
        })
      : localStorage.createScript({
          title: `${source.title} (Copy)`,
          content: source.content,
          plainText: source.plainText,
          folderId: source.folderId,
          userId,
        });

    set((state) => ({ scripts: [newScript, ...state.scripts] }));
    return newScript;
  },

  setCurrentScript: (script) => set({ currentScript: script }),

  loadScript: async (id) => {
    const script = useSupabase()
      ? await supabaseStorage.getScript(id)
      : localStorage.getScript(id);
    if (script) set({ currentScript: script });
    return script;
  },

  // ── Folders ─────────────────────────────────────────────────────────────────

  loadFolders: async (userId) => {
    try {
      const folders = useSupabase()
        ? await supabaseStorage.getFolders(userId)
        : localStorage.getFolders();
      set({ folders });
    } catch (e) {
      console.error('loadFolders error:', e);
    }
  },

  createFolder: async (userId, name, color) => {
    const folder = useSupabase()
      ? await supabaseStorage.createFolder(userId, name, color)
      : localStorage.createFolder(name, color);
    set((state) => ({ folders: [...state.folders, folder] }));
  },

  updateFolder: async (id, updates) => {
    const updated = useSupabase()
      ? await supabaseStorage.updateFolder(id, updates)
      : localStorage.updateFolder(id, updates);
    if (updated) {
      set((state) => ({
        folders: state.folders.map((f) => (f.id === id ? updated : f)),
      }));
    }
  },

  deleteFolder: async (id) => {
    if (useSupabase()) {
      await supabaseStorage.deleteFolder(id);
    } else {
      localStorage.deleteFolder(id);
    }
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
      activeFolderId: state.activeFolderId === id ? null : state.activeFolderId,
    }));
  },

  setActiveFolderId: (id) => set({ activeFolderId: id }),

  // ── Search ──────────────────────────────────────────────────────────────────

  setSearchQuery: (query) => set({ searchQuery: query }),

  // ── Versions ────────────────────────────────────────────────────────────────

  getVersions: async (scriptId) => {
    return useSupabase()
      ? await supabaseStorage.getVersions(scriptId)
      : localStorage.getVersions(scriptId);
  },

  createVersion: async (scriptId) => {
    const script = useSupabase()
      ? await supabaseStorage.getScript(scriptId)
      : localStorage.getScript(scriptId);
    if (!script) return;
    if (useSupabase()) {
      await supabaseStorage.createVersion(scriptId, script.content, script.plainText, script.wordCount ?? 0);
    } else {
      localStorage.createVersion(scriptId, script.content, script.plainText, script.wordCount ?? 0);
    }
  },

  // ── Computed ────────────────────────────────────────────────────────────────

  filteredScripts: () => {
    const { scripts, activeFolderId, searchQuery } = get();
    return scripts.filter((script) => {
      const matchesFolder = activeFolderId ? script.folderId === activeFolderId : true;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        script.title.toLowerCase().includes(q) ||
        (script.plainText && script.plainText.toLowerCase().includes(q));
      return matchesFolder && matchesSearch;
    });
  },
}));
