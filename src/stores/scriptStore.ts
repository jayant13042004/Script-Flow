import { create } from 'zustand';
import { Script, Folder, ScriptVersion } from '../types';
import { LocalStorageService } from '../services/storage/localStorage';

const storage = new LocalStorageService();

interface ScriptState {
  scripts: Script[];
  folders: Folder[];
  currentScript: Script | null;
  isLoading: boolean;
  searchQuery: string;
  activeFolderId: string | null;
  
  // Scripts
  loadScripts: () => void;
  createScript: (title?: string, folderId?: string | null) => Script;
  updateScript: (id: string, updates: Partial<Script>) => void;
  deleteScript: (id: string) => void;
  duplicateScript: (id: string) => Script;
  setCurrentScript: (script: Script | null) => void;
  loadScript: (id: string) => Script | null;
  
  // Folders
  loadFolders: () => void;
  createFolder: (name: string, color?: string) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  setActiveFolderId: (id: string | null) => void;
  
  // Search
  setSearchQuery: (query: string) => void;
  
  // Versions
  getVersions: (scriptId: string) => ScriptVersion[];
  createVersion: (scriptId: string) => void;
  
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

  loadScripts: () => {
    set({ isLoading: true });
    try {
      const scripts = storage.getScripts();
      set({ scripts, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  createScript: (title: string = 'Untitled Script', folderId: string | null = null) => {
    const script = storage.createScript({ title, folderId });
    set((state) => ({ scripts: [script, ...state.scripts] }));
    return script;
  },

  updateScript: (id, updates) => {
    const updatedScript = storage.updateScript(id, updates);
    if (updatedScript) {
      set((state) => ({
        scripts: state.scripts.map((s) => (s.id === id ? updatedScript : s)),
        currentScript: state.currentScript?.id === id ? updatedScript : state.currentScript,
      }));
    }
  },

  deleteScript: (id) => {
    storage.deleteScript(id);
    set((state) => ({
      scripts: state.scripts.filter((s) => s.id !== id),
      currentScript: state.currentScript?.id === id ? null : state.currentScript,
    }));
  },

  duplicateScript: (id) => {
    const scriptToDuplicate = storage.getScript(id);
    if (!scriptToDuplicate) throw new Error('Script not found');
    
    const newScript = storage.createScript({
      title: `${scriptToDuplicate.title} (Copy)`,
      content: scriptToDuplicate.content,
      plainText: scriptToDuplicate.plainText,
      folderId: scriptToDuplicate.folderId,
    });
    
    set((state) => ({ scripts: [newScript, ...state.scripts] }));
    return newScript;
  },

  setCurrentScript: (script) => {
    set({ currentScript: script });
  },

  loadScript: (id) => {
    const script = storage.getScript(id);
    if (script) {
      set({ currentScript: script });
      return script;
    }
    return null;
  },

  loadFolders: () => {
    const folders = storage.getFolders();
    set({ folders });
  },

  createFolder: (name, color) => {
    const folder = storage.createFolder(name, color);
    set((state) => ({ folders: [...state.folders, folder] }));
  },

  updateFolder: (id, updates) => {
    const updatedFolder = storage.updateFolder(id, updates);
    if (updatedFolder) {
      set((state) => ({
        folders: state.folders.map((f) => (f.id === id ? updatedFolder : f)),
      }));
    }
  },

  deleteFolder: (id) => {
    storage.deleteFolder(id);
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
      activeFolderId: state.activeFolderId === id ? null : state.activeFolderId,
    }));
  },

  setActiveFolderId: (id) => {
    set({ activeFolderId: id });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  getVersions: (scriptId) => {
    return storage.getVersions(scriptId);
  },

  createVersion: (scriptId) => {
    const script = storage.getScript(scriptId);
    if (script) {
      storage.createVersion(scriptId, script.content, script.plainText, script.wordCount || 0);
    }
  },

  filteredScripts: () => {
    const { scripts, activeFolderId, searchQuery } = get();
    return scripts.filter((script) => {
      const matchesFolder = activeFolderId ? script.folderId === activeFolderId : true;
      const matchesSearch = script.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (script.plainText && script.plainText.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFolder && matchesSearch;
    });
  },
}));
