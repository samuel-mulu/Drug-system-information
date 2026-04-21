import { create } from 'zustand';
import { CurrentUser, authApi } from '../api';

const AUTH_HYDRATE_TIMEOUT_MS = 8000;

interface AuthState {
  user: CurrentUser | null;
  isLoading: boolean;
  isHydrated: boolean;
  setUser: (user: CurrentUser) => void;
  clearAuth: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isHydrated: false,
  setUser: (user) => {
    set({ user, isLoading: false, isHydrated: true });
  },
  clearAuth: () => {
    set({ user: null, isLoading: false, isHydrated: true });
  },
  hydrate: async () => {
    if (get().isLoading) return;

    if (get().user) {
      set({ isHydrated: true, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await Promise.race([
        authApi.me(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timed out')), AUTH_HYDRATE_TIMEOUT_MS)
        ),
      ]);
      set({ user, isLoading: false, isHydrated: true });
    } catch (error) {
      console.error('Failed to hydrate session:', error);
      set({ user: null, isLoading: false, isHydrated: true });
    }
  },
}));
