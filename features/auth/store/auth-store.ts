import { create } from 'zustand';
import { CurrentUser, authApi } from '../api';

const AUTH_HYDRATE_TIMEOUT_MS = 8000;

interface AuthState {
  user: CurrentUser | null;
  isLoading: boolean;
  isHydrated: boolean;
  hydrateError: string | null;
  setUser: (user: CurrentUser) => void;
  clearAuth: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isHydrated: false,
  hydrateError: null,
  setUser: (user) => {
    set({ user, isLoading: false, isHydrated: true, hydrateError: null });
  },
  clearAuth: () => {
    set({ user: null, isLoading: false, isHydrated: true, hydrateError: null });
  },
  hydrate: async () => {
    if (get().isLoading) return;

    if (get().user) {
      set({ isHydrated: true, isLoading: false });
      return;
    }

    set({ isLoading: true, hydrateError: null });
    try {
      const user = await Promise.race([
        authApi.me(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timed out')), AUTH_HYDRATE_TIMEOUT_MS)
        ),
      ]);
      set({ user, isLoading: false, isHydrated: true, hydrateError: null });
    } catch (error) {
      console.error('Failed to hydrate session:', error);
      const hydrateError =
        error instanceof Error && error.message === 'Auth check timed out'
          ? 'Server is waking up. Please retry.'
          : 'Unable to verify your session right now. Please retry.';

      set({ user: null, isLoading: false, isHydrated: true, hydrateError });
    }
  },
}));
