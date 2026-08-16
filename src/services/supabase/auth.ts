import { supabase, isSupabaseConfigured } from './client';

export interface User {
  id: string;
  email: string;
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

export const signUp = async (email: string, password: string):Promise<{user: User | null, error: any}> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { 
      user: data.user ? { id: data.user.id, email: data.user.email || email } : null, 
      error 
    };
  } else {
    // Mock signUp
    const newUser = { id: crypto.randomUUID(), email };
    setMockUser(newUser);
    return { user: newUser, error: null };
  }
};

export const signIn = async (email: string, password: string):Promise<{user: User | null, error: any}> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { 
      user: data.user ? { id: data.user.id, email: data.user.email || email } : null, 
      error 
    };
  } else {
    // Mock signIn
    const user = { id: crypto.randomUUID(), email };
    setMockUser(user);
    return { user, error: null };
  }
};

export const signOut = async () => {
  if (isSupabaseConfigured() && supabase) {
    await supabase.auth.signOut();
  } else {
    setMockUser(null);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (isSupabaseConfigured() && supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ? { id: session.user.id, email: session.user.email || '' } : null;
  } else {
    return getMockUser();
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  authStateListeners.push(callback);
  
  if (isSupabaseConfigured() && supabase) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ? { id: session.user.id, email: session.user.email || '' } : null;
      callback(user);
    });
    return () => {
      subscription.unsubscribe();
      authStateListeners = authStateListeners.filter(l => l !== callback);
    };
  } else {
    // Init call for mock
    callback(getMockUser());
    return () => {
      authStateListeners = authStateListeners.filter(l => l !== callback);
    };
  }
};
