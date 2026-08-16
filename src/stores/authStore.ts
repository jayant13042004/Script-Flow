import { create } from 'zustand';
import { generateId } from '../lib/utils';

interface User {
  id: string;
  email: string;
  displayName: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    // Mock login since we're using localStorage mode
    const storedUser = localStorage.getItem('scriptflow_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.email === email) {
        set({ user, isAuthenticated: true });
        return;
      }
    }
    // If not found but we want to allow login anyway for demo purposes
    const newUser = { id: generateId(), email, displayName: email.split('@')[0] };
    localStorage.setItem('scriptflow_user', JSON.stringify(newUser));
    set({ user: newUser, isAuthenticated: true });
  },

  signup: async (email, password, displayName) => {
    const newUser = { id: generateId(), email, displayName };
    localStorage.setItem('scriptflow_user', JSON.stringify(newUser));
    set({ user: newUser, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('scriptflow_user');
    set({ user: null, isAuthenticated: false });
  },

  initAuth: () => {
    try {
      const storedUser = localStorage.getItem('scriptflow_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (e) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
