import type { Script, Folder, ScriptVersion, Hook, Playlist } from '../../types';

export interface StorageService {
  // Scripts
  getScripts(): Script[];
  getScript(id: string): Script | null;
  createScript(script: Partial<Script>): Script;
  updateScript(id: string, updates: Partial<Script>): Script;
  deleteScript(id: string): void;
  
  // Folders
  getFolders(): Folder[];
  createFolder(name: string, color?: string): Folder;
  updateFolder(id: string, updates: Partial<Folder>): Folder;
  deleteFolder(id: string): void;

  // Playlists / Series
  getPlaylists(): Playlist[];
  createPlaylist(name: string, description?: string, color?: string): Playlist;
  updatePlaylist(id: string, updates: Partial<Playlist>): Playlist;
  deletePlaylist(id: string): void;
  
  // Versions
  getVersions(scriptId: string): ScriptVersion[];
  createVersion(scriptId: string, content: any, plainText: string, wordCount: number): ScriptVersion;
  
  // Hook Favorites
  getFavorites(): string[];
  toggleFavorite(hookId: string): boolean;
  
  // Custom Hooks
  getCustomHooks(): Hook[];
  createCustomHook(hook: Omit<Hook, 'id' | 'isCustom'>): Hook;
  deleteCustomHook(id: string): void;
}

export class LocalStorageService implements StorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn(`Error parsing localStorage key ${key}`, e);
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error setting localStorage key ${key}`, e);
    }
  }

  private generateId(): string {
    return typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15);
  }

  // Scripts
  getScripts(): Script[] {
    return this.get<Script[]>('scriptflow_scripts', []);
  }

  getScript(id: string): Script | null {
    const scripts = this.getScripts();
    return scripts.find(s => s.id === id) || null;
  }

  createScript(script: Partial<Script>): Script {
    const scripts = this.getScripts();
    const newScript: Script = {
      id: this.generateId(),
      userId: script.userId || 'local-user',
      title: script.title || 'Untitled Script',
      content: script.content || '',
      plainText: script.plainText || '',
      folderId: script.folderId || null,
      platform: script.platform || null,
      contentType: script.contentType || null,
      tone: script.tone || null,
      language: script.language || 'en',
      wordCount: script.wordCount || 0,
      characterCount: script.characterCount || 0,
      estimatedDuration: script.estimatedDuration || 0,
      productionPlan: script.productionPlan || null,
      structure: script.structure || null,
      isArchived: script.isArchived || false,
      status: script.status || 'draft',
      isPublic: script.isPublic || false,
      shareToken: script.shareToken || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...script
    };
    
    this.set('scriptflow_scripts', [...scripts, newScript]);
    return newScript;
  }

  updateScript(id: string, updates: Partial<Script>): Script {
    const scripts = this.getScripts();
    const index = scripts.findIndex(s => s.id === id);
    
    if (index === -1) {
      throw new Error(`Script with id ${id} not found`);
    }
    
    const updatedScript = {
      ...scripts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    scripts[index] = updatedScript;
    this.set('scriptflow_scripts', scripts);
    return updatedScript;
  }

  deleteScript(id: string): void {
    const scripts = this.getScripts();
    this.set('scriptflow_scripts', scripts.filter(s => s.id !== id));
    
    // Cleanup versions
    const versions = this.get<ScriptVersion[]>('scriptflow_versions', []);
    this.set('scriptflow_versions', versions.filter(v => v.scriptId !== id));
  }
  
  // Folders
  getFolders(): Folder[] {
    return this.get<Folder[]>('scriptflow_folders', []);
  }

  createFolder(name: string, color?: string): Folder {
    const folders = this.getFolders();
    const newFolder: Folder = {
      id: this.generateId(),
      userId: 'local-user',
      name,
      color: color || '#3b82f6', // default blue
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.set('scriptflow_folders', [...folders, newFolder]);
    return newFolder;
  }

  updateFolder(id: string, updates: Partial<Folder>): Folder {
    const folders = this.getFolders();
    const index = folders.findIndex(f => f.id === id);
    
    if (index === -1) {
      throw new Error(`Folder with id ${id} not found`);
    }
    
    const updatedFolder = { ...folders[index], ...updates, updatedAt: new Date().toISOString() };
    folders[index] = updatedFolder;
    this.set('scriptflow_folders', folders);
    return updatedFolder;
  }

  deleteFolder(id: string): void {
    const folders = this.getFolders();
    this.set('scriptflow_folders', folders.filter(f => f.id !== id));
    
    // Unassign scripts from this folder
    const scripts = this.getScripts();
    const updatedScripts = scripts.map(s => 
      s.folderId === id ? { ...s, folderId: null } : s
    );
    this.set('scriptflow_scripts', updatedScripts);
  }

  // Playlists / Series
  getPlaylists(): import('../../types').Playlist[] {
    return this.get<import('../../types').Playlist[]>('scriptflow_playlists', []);
  }

  createPlaylist(name: string, description?: string, color?: string): import('../../types').Playlist {
    const playlists = this.getPlaylists();
    const newPlaylist: import('../../types').Playlist = {
      id: this.generateId(),
      userId: 'local-user',
      name,
      description: description || '',
      color: color || '#3b82f6',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.set('scriptflow_playlists', [...playlists, newPlaylist]);
    return newPlaylist;
  }

  updatePlaylist(id: string, updates: Partial<import('../../types').Playlist>): import('../../types').Playlist {
    const playlists = this.getPlaylists();
    const playlist = playlists.find(p => p.id === id);
    if (!playlist) throw new Error('Playlist not found');
    
    const updated = {
      ...playlist,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.set('scriptflow_playlists', playlists.map(p => p.id === id ? updated : p));
    return updated;
  }

  deletePlaylist(id: string): void {
    const playlists = this.getPlaylists();
    this.set('scriptflow_playlists', playlists.filter(p => p.id !== id));

    // Clear playlistId on scripts belonging to this playlist
    const scripts = this.getScripts();
    const updatedScripts = scripts.map(s => 
      s.playlistId === id ? { ...s, playlistId: null, episodeNumber: null } : s
    );
    this.set('scriptflow_scripts', updatedScripts);
  }
  
  // Versions
  getVersions(scriptId: string): ScriptVersion[] {
    const allVersions = this.get<ScriptVersion[]>('scriptflow_versions', []);
    return allVersions.filter(v => v.scriptId === scriptId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createVersion(scriptId: string, content: any, plainText: string, wordCount: number): ScriptVersion {
    const versions = this.get<ScriptVersion[]>('scriptflow_versions', []);
    const existingScriptVersions = this.getVersions(scriptId);
    const newVersionNumber = existingScriptVersions.length > 0 
      ? existingScriptVersions[0].versionNumber + 1 
      : 1;

    const newVersion: ScriptVersion = {
      id: this.generateId(),
      scriptId,
      content,
      plainText,
      wordCount,
      versionNumber: newVersionNumber,
      createdAt: new Date().toISOString()
    };
    
    this.set('scriptflow_versions', [...versions, newVersion]);
    return newVersion;
  }
  
  // Hook Favorites
  getFavorites(): string[] {
    return this.get<string[]>('scriptflow_favorites', []);
  }

  toggleFavorite(hookId: string): boolean {
    const favorites = this.getFavorites();
    const isFavorite = favorites.includes(hookId);
    
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter(id => id !== hookId);
    } else {
      newFavorites = [...favorites, hookId];
    }
    
    this.set('scriptflow_favorites', newFavorites);
    return !isFavorite;
  }
  
  // Custom Hooks
  getCustomHooks(): Hook[] {
    return this.get<Hook[]>('scriptflow_custom_hooks', []);
  }

  createCustomHook(hook: Omit<Hook, 'id' | 'isCustom'>): Hook {
    const hooks = this.getCustomHooks();
    const newHook: Hook = {
      ...hook,
      id: this.generateId(),
      isCustom: true,
      userId: hook.userId || 'local-user'
    };
    
    this.set('scriptflow_custom_hooks', [...hooks, newHook]);
    return newHook;
  }

  deleteCustomHook(id: string): void {
    const hooks = this.getCustomHooks();
    this.set('scriptflow_custom_hooks', hooks.filter(h => h.id !== id));
  }
}

export const localStore = new LocalStorageService();
