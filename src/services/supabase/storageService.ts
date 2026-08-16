import { supabase } from './client';
import type { Script, Folder, ScriptVersion, Hook } from '../../types';

// ─── Row shape coming back from Supabase ──────────────────────────────────────

interface ScriptRow {
  id: string;
  user_id: string;
  folder_id: string | null;
  title: string;
  content: any;
  plain_text: string;
  platform: string | null;
  content_type: string | null;
  tone: string | null;
  language: string;
  word_count: number;
  character_count: number;
  estimated_duration: number;
  production_plan: any;
  structure: any;
  is_archived: boolean;
  status?: string | null;
  is_public?: boolean | null;
  share_token?: string | null;
  created_at: string;
  updated_at: string;
}

interface FolderRow {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

interface VersionRow {
  id: string;
  script_id: string;
  content: any;
  plain_text: string;
  word_count: number;
  version_number: number;
  created_at: string;
}

interface CustomHookRow {
  id: string;
  user_id: string;
  text: string;
  category: string;
  example: string | null;
  created_at: string;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

const mapScript = (row: ScriptRow): Script => ({
  id: row.id,
  userId: row.user_id,
  folderId: row.folder_id,
  title: row.title,
  content: row.content,
  plainText: row.plain_text ?? '',
  platform: row.platform as any,
  contentType: row.content_type as any,
  tone: row.tone as any,
  language: row.language ?? 'en',
  wordCount: row.word_count ?? 0,
  characterCount: row.character_count ?? 0,
  estimatedDuration: row.estimated_duration ?? 0,
  productionPlan: row.production_plan ?? null,
  structure: row.structure ?? null,
  isArchived: row.is_archived ?? false,
  status: (row.status as any) || 'draft',
  isPublic: row.is_public ?? false,
  shareToken: row.share_token ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapFolder = (row: FolderRow): Folder => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  color: row.color,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapVersion = (row: VersionRow): ScriptVersion => ({
  id: row.id,
  scriptId: row.script_id,
  content: row.content,
  plainText: row.plain_text ?? '',
  wordCount: row.word_count ?? 0,
  versionNumber: row.version_number,
  createdAt: row.created_at,
});

const mapHook = (row: CustomHookRow): Hook => ({
  id: row.id,
  text: row.text,
  category: row.category as any,
  example: row.example ?? '',
  isCustom: true,
  userId: row.user_id,
});

// ─── SupabaseStorageService ───────────────────────────────────────────────────

export class SupabaseStorageService {
  // ── Scripts ────────────────────────────────────────────────────────────────

  async getScripts(userId: string): Promise<Script[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as ScriptRow[]).map(mapScript);
  }

  async getScript(id: string): Promise<Script | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return mapScript(data as ScriptRow);
  }

  async createScript(userId: string, partial: Partial<Script>): Promise<Script> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('scripts')
      .insert({
        user_id: userId,
        folder_id: partial.folderId ?? null,
        title: partial.title ?? 'Untitled Script',
        content: partial.content ?? null,
        plain_text: partial.plainText ?? '',
        platform: partial.platform ?? null,
        content_type: partial.contentType ?? null,
        tone: partial.tone ?? null,
        language: partial.language ?? 'en',
        word_count: partial.wordCount ?? 0,
        character_count: partial.characterCount ?? 0,
        estimated_duration: partial.estimatedDuration ?? 0,
        production_plan: partial.productionPlan ?? null,
        structure: partial.structure ?? null,
        is_archived: false,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapScript(data as ScriptRow);
  }

  async updateScript(id: string, updates: Partial<Script>): Promise<Script | null> {
    if (!supabase) return null;
    const dbUpdates: Record<string, any> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.plainText !== undefined) dbUpdates.plain_text = updates.plainText;
    if (updates.folderId !== undefined) dbUpdates.folder_id = updates.folderId;
    if (updates.platform !== undefined) dbUpdates.platform = updates.platform;
    if (updates.contentType !== undefined) dbUpdates.content_type = updates.contentType;
    if (updates.tone !== undefined) dbUpdates.tone = updates.tone;
    if (updates.language !== undefined) dbUpdates.language = updates.language;
    if (updates.wordCount !== undefined) dbUpdates.word_count = updates.wordCount;
    if (updates.characterCount !== undefined) dbUpdates.character_count = updates.characterCount;
    if (updates.estimatedDuration !== undefined) dbUpdates.estimated_duration = updates.estimatedDuration;
    if (updates.productionPlan !== undefined) dbUpdates.production_plan = updates.productionPlan;
    if (updates.structure !== undefined) dbUpdates.structure = updates.structure;
    if (updates.isArchived !== undefined) dbUpdates.is_archived = updates.isArchived;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;
    if (updates.shareToken !== undefined) dbUpdates.share_token = updates.shareToken;

    const { data, error } = await supabase
      .from('scripts')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapScript(data as ScriptRow);
  }

  async getScriptByShareToken(token: string): Promise<Script | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('share_token', token)
      .single();

    if (error || !data) return null;
    return mapScript(data as ScriptRow);
  }

  async deleteScript(id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('scripts').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  // ── Folders ────────────────────────────────────────────────────────────────

  async getFolders(userId: string): Promise<Folder[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return (data as FolderRow[]).map(mapFolder);
  }

  async createFolder(userId: string, name: string, color?: string): Promise<Folder> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('folders')
      .insert({ user_id: userId, name, color: color ?? null })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapFolder(data as FolderRow);
  }

  async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder | null> {
    if (!supabase) return null;
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.color !== undefined) dbUpdates.color = updates.color;

    const { data, error } = await supabase
      .from('folders')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapFolder(data as FolderRow);
  }

  async deleteFolder(id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('folders').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  // ── Versions ───────────────────────────────────────────────────────────────

  async getVersions(scriptId: string): Promise<ScriptVersion[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('script_versions')
      .select('*')
      .eq('script_id', scriptId)
      .order('version_number', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as VersionRow[]).map(mapVersion);
  }

  async createVersion(
    scriptId: string,
    content: any,
    plainText: string,
    wordCount: number
  ): Promise<ScriptVersion> {
    if (!supabase) throw new Error('Supabase not configured');

    // Get latest version number
    const { data: existing } = await supabase
      .from('script_versions')
      .select('version_number')
      .eq('script_id', scriptId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersion = existing && existing.length > 0 ? existing[0].version_number + 1 : 1;

    const { data, error } = await supabase
      .from('script_versions')
      .insert({
        script_id: scriptId,
        content,
        plain_text: plainText,
        word_count: wordCount,
        version_number: nextVersion,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapVersion(data as VersionRow);
  }

  // ── Custom Hooks ───────────────────────────────────────────────────────────

  async getCustomHooks(userId: string): Promise<Hook[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('custom_hooks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return (data as CustomHookRow[]).map(mapHook);
  }

  async createCustomHook(userId: string, hook: Omit<Hook, 'id' | 'isCustom'>): Promise<Hook> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('custom_hooks')
      .insert({
        user_id: userId,
        text: hook.text,
        category: hook.category,
        example: hook.example ?? '',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapHook(data as CustomHookRow);
  }

  async deleteCustomHook(id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('custom_hooks').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  // ── Hook Favorites ─────────────────────────────────────────────────────────

  async getFavoriteIds(userId: string): Promise<string[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('hook_favorites')
      .select('hook_id')
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return (data as { hook_id: string }[]).map((r) => r.hook_id);
  }

  async addFavorite(userId: string, hookId: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase
      .from('hook_favorites')
      .insert({ user_id: userId, hook_id: hookId });
    // Ignore duplicate key errors (upsert-like behaviour)
    if (error && !error.message.includes('duplicate')) throw new Error(error.message);
  }

  async removeFavorite(userId: string, hookId: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase
      .from('hook_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('hook_id', hookId);
    if (error) throw new Error(error.message);
  }
}

export const supabaseStorage = new SupabaseStorageService();
