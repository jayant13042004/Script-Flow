import { create } from 'zustand';
import {
  signIn,
  signUp,
  signOut,
  signInWithGoogle,
  getCurrentUser,
  onAuthStateChange,
  type User,
} from '../services/supabase/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const { user, error } = await signIn(email, password);
    if (error) {
      throw new Error(error.message || 'Invalid email or password');
    }
    if (user) {
      set({ user, isAuthenticated: true });
    }
  },

  signup: async (email, password, displayName) => {
    const { user, error } = await signUp(email, password, displayName);
    if (error) {
      throw new Error(error.message || 'Could not create account');
    }
    if (user) {
      set({ user, isAuthenticated: true });
    }
  },

  loginWithGoogle: async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      throw new Error(error.message || 'Google sign-in failed');
    }
    // For real Supabase OAuth, the browser redirects to Google —
    // the auth state will be picked up by onAuthStateChange after redirect.
  },

  logout: async () => {
    await signOut();
    set({ user: null, isAuthenticated: false });
  },

  initAuth: () => {
    // First, check for an existing session
    getCurrentUser().then((user) => {
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    });

    // Then, listen for auth state changes (handles OAuth callbacks, tab focus, etc.)
    onAuthStateChange((user) => {
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    });
  },
}));
