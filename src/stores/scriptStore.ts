import { create } from 'zustand';
import type { Script, Folder, ScriptVersion, Playlist } from '../types';
import { supabaseStorage } from '../services/supabase/storageService';
import { LocalStorageService } from '../services/storage/localStorage';
import { isSupabaseConfigured } from '../services/supabase/client';

const localStorage = new LocalStorageService();

// Helper: pick the right backend
const useSupabase = () => isSupabaseConfigured();

interface ScriptState {
  scripts: Script[];
  folders: Folder[];
  playlists: Playlist[];
  currentScript: Script | null;
  isLoading: boolean;
  searchQuery: string;
  activeFolderId: string | null;
  activePlaylistId: string | null;

  // Scripts
  loadScripts: (userId: string) => Promise<void>;
  createScript: (userId: string, title?: string, folderId?: string | null, playlistId?: string | null) => Promise<Script>;
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

  // Playlists / Series
  loadPlaylists: (userId: string) => Promise<void>;
  createPlaylist: (userId: string, name: string, description?: string, color?: string) => Promise<Playlist>;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  setActivePlaylistId: (id: string | null) => void;

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
  playlists: [],
  currentScript: null,
  isLoading: false,
  searchQuery: '',
  activeFolderId: null,
  activePlaylistId: null,

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

  createScript: async (userId, title = 'Untitled Script', folderId = null, playlistId = null) => {
    let newScript: Script;
    if (useSupabase()) {
      newScript = await supabaseStorage.createScript(userId, {
        title,
        folderId,
        playlistId,
        content: null,
        plainText: '',
      });
    } else {
      newScript = localStorage.createScript({
        title,
        folderId,
        playlistId,
        content: null,
        plainText: '',
        userId,
      });
    }
    set((state) => ({ scripts: [newScript, ...state.scripts] }));
    return newScript;
  },

  updateScript: async (id, updates) => {
    if (useSupabase()) {
      await supabaseStorage.updateScript(id, updates);
    } else {
      localStorage.updateScript(id, updates);
    }
    set((state) => ({
      scripts: state.scripts.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      currentScript:
        state.currentScript?.id === id
          ? { ...state.currentScript, ...updates }
          : state.currentScript,
    }));
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
    const original = useSupabase()
      ? await supabaseStorage.getScript(id)
      : localStorage.getScript(id);
    const title = original ? `${original.title} (Copy)` : 'Untitled Script (Copy)';
    let dup: Script;
    if (useSupabase()) {
      dup = await supabaseStorage.createScript(userId, {
        ...original,
        title,
      });
    } else {
      dup = localStorage.createScript({
        ...original,
        title,
        userId,
      });
    }
    set((state) => ({ scripts: [dup, ...state.scripts] }));
    return dup;
  },

  setCurrentScript: (script) => set({ currentScript: script }),

  loadScript: async (id) => {
    const script = useSupabase()
      ? await supabaseStorage.getScript(id)
      : localStorage.getScript(id);
    if (script) {
      set({ currentScript: script });
    }
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
    let folder: Folder;
    if (useSupabase()) {
      folder = await supabaseStorage.createFolder(userId, name, color);
    } else {
      folder = localStorage.createFolder(name, color);
    }
    set((state) => ({ folders: [...state.folders, folder] }));
  },

  updateFolder: async (id, updates) => {
    let updated: Folder | null = null;
    if (useSupabase()) {
      updated = await supabaseStorage.updateFolder(id, updates);
    } else {
      updated = localStorage.updateFolder(id, updates);
    }
    if (updated) {
      set((state) => ({
        folders: state.folders.map((f) => (f.id === id ? updated! : f)),
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

  setActiveFolderId: (id) => set({ activeFolderId: id, activePlaylistId: null }),

  // ── Playlists / Series ───────────────────────────────────────────────────────

  loadPlaylists: async (userId) => {
    try {
      const playlists = localStorage.getPlaylists();
      set({ playlists });
    } catch (e) {
      console.error('loadPlaylists error:', e);
    }
  },

  createPlaylist: async (userId, name, description, color) => {
    const playlist = localStorage.createPlaylist(name, description, color);
    set((state) => ({ playlists: [...state.playlists, playlist] }));
    return playlist;
  },

  updatePlaylist: async (id, updates) => {
    const updated = localStorage.updatePlaylist(id, updates);
    set((state) => ({
      playlists: state.playlists.map((p) => (p.id === id ? updated : p)),
    }));
  },

  deletePlaylist: async (id) => {
    localStorage.deletePlaylist(id);
    set((state) => ({
      playlists: state.playlists.filter((p) => p.id !== id),
      activePlaylistId: state.activePlaylistId === id ? null : state.activePlaylistId,
      scripts: state.scripts.map((s) => s.playlistId === id ? { ...s, playlistId: null, episodeNumber: null } : s)
    }));
  },

  setActivePlaylistId: (id) => set({ activePlaylistId: id, activeFolderId: null }),

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
    const { scripts, activeFolderId, activePlaylistId, searchQuery } = get();
    return scripts.filter((script) => {
      const matchesFolder = activeFolderId ? script.folderId === activeFolderId : true;
      const matchesPlaylist = activePlaylistId ? script.playlistId === activePlaylistId : true;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        script.title.toLowerCase().includes(q) ||
        (script.plainText && script.plainText.toLowerCase().includes(q));
      return matchesFolder && matchesPlaylist && matchesSearch;
    });
  },
}));
