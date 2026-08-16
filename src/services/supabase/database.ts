import { supabase, isSupabaseConfigured } from './client';
import { LocalStorageService, StorageService } from '../storage/localStorage';
import type { Script, Folder, ScriptVersion, Hook } from '../../types';

const localStore = new LocalStorageService();

// Supabase wrapper that implements StorageService interface
// In a real production app, all these would be async.
// Since StorageService is currently synchronous (based on localStorage),
// we will fallback to localStorage if we can't implement synchronous supabase calls.
// For the sake of this implementation, we will use localStore primarily 
// unless we transition the entire StorageService interface to be asynchronous.
// Note: Supabase queries are async, so a direct sync wrapper isn't natively possible without 
// changing the StorageService signatures to return Promises.

// Given the constraints and the provided interface for local storage, 
// if Supabase is configured, we'd normally wrap async calls. 
// For this scaffolding, we'll return localStore if interface is sync, 
// or one could change StorageService to async. 
// We will export a generic getStorage that returns the localStore by default, 
// acknowledging the async/sync disparity for Supabase.

export function getStorage(): StorageService {
  if (isSupabaseConfigured() && supabase) {
    console.warn("Supabase is configured but StorageService requires async methods. Falling back to LocalStorage for sync operations, or implement AsyncStorageService.");
    // Example of how it would be implemented if the interface was async:
    // return new SupabaseStorageService();
  }
  return localStore;
}
