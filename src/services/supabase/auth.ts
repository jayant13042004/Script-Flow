import { supabase, isSupabaseConfigured } from './client';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

let authStateListeners: ((user: User | null) => void)[] = [];

// Local Mock Implementation
const LOCAL_USER_KEY = 'scriptflow_mock_user';

const getMockUser = (): User | null => {
  try {
    const val = localStorage.getItem(LOCAL_USER_KEY);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
};

const setMockUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_USER_KEY);
  }
  notifyListeners(user);
};

const notifyListeners = (user: User | null) => {
  authStateListeners.forEach(listener => listener(user));
};

/**
 * Extract a clean User object from a Supabase auth user.
 * Handles Google OAuth metadata (full_name, avatar_url) and email fallback.
 */
const mapSupabaseUser = (supabaseUser: any): User => {
  const meta = supabaseUser.user_metadata || {};
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    displayName:
      meta.full_name ||
      meta.name ||
      meta.display_name ||
      supabaseUser.email?.split('@')[0] ||
      'User',
    avatarUrl: meta.avatar_url || meta.picture || undefined,
  };
};

// ─── Email/Password Auth ───────────────────────────────────────

export const signUp = async (
  email: string,
  password: string,
  displayName?: string
): Promise<{ user: User | null; error: any }> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split('@')[0] },
      },
    });
    return {
      user: data.user ? mapSupabaseUser(data.user) : null,
      error,
    };
  } else {
    // Mock signUp
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      displayName: displayName || email.split('@')[0],
    };
    setMockUser(newUser);
    return { user: newUser, error: null };
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: any }> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return {
      user: data.user ? mapSupabaseUser(data.user) : null,
      error,
    };
  } else {
    // Mock signIn
    const user: User = {
      id: crypto.randomUUID(),
      email,
      displayName: email.split('@')[0],
    };
    setMockUser(user);
    return { user, error: null };
  }
};

// ─── Google OAuth ──────────────────────────────────────────────

export const signInWithGoogle = async (): Promise<{ error: any }> => {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error };
  } else {
    // Mock Google sign-in: create a mock Google user
    const mockGoogleUser: User = {
      id: crypto.randomUUID(),
      email: 'user@gmail.com',
      displayName: 'Google User',
      avatarUrl: undefined,
    };
    setMockUser(mockGoogleUser);
    return { error: null };
  }
};

// ─── Sign Out ──────────────────────────────────────────────────

export const signOut = async () => {
  if (isSupabaseConfigured() && supabase) {
    await supabase.auth.signOut();
  } else {
    setMockUser(null);
  }
};

// ─── Session Management ────────────────────────────────────────

export const getCurrentUser = async (): Promise<User | null> => {
  if (isSupabaseConfigured() && supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user ? mapSupabaseUser(session.user) : null;
  } else {
    return getMockUser();
  }
};

export const onAuthStateChange = (
  callback: (user: User | null) => void
) => {
  authStateListeners.push(callback);

  if (isSupabaseConfigured() && supabase) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ? mapSupabaseUser(session.user) : null;
      callback(user);
    });
    return () => {
      subscription.unsubscribe();
      authStateListeners = authStateListeners.filter((l) => l !== callback);
    };
  } else {
    // Init call for mock
    callback(getMockUser());
    return () => {
      authStateListeners = authStateListeners.filter((l) => l !== callback);
    };
  }
};
