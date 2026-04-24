import { create } from 'zustand';
import { CurrentUser, authApi } from '../api';
import { ApiError } from '@/lib/api-client';

const AUTH_HYDRATE_TIMEOUT_MS = 8000;
const AUTH_TIMEOUT_MESSAGE = 'Server is waking up. Please retry.';
const AUTH_UNAVAILABLE_MESSAGE = 'Server/database unavailable. Please retry.';
const AUTH_GENERIC_MESSAGE = 'Unable to verify your session right now. Please retry.';

function getHydrateFailureState(error: unknown): {
  hydrateError: string | null;
  needsReauth: boolean;
} {
  if (error instanceof ApiError) {
    if (error.status === 408) {
      return {
        hydrateError: AUTH_TIMEOUT_MESSAGE,
        needsReauth: false,
      };
    }

    if (error.status === 503) {
      return {
        hydrateError: AUTH_UNAVAILABLE_MESSAGE,
        needsReauth: false,
      };
    }
  }

  if (error instanceof Error && error.message === 'Auth check timed out') {
    return {
      hydrateError: AUTH_TIMEOUT_MESSAGE,
      needsReauth: false,
    };
  }

  return {
    hydrateError: AUTH_GENERIC_MESSAGE,
    needsReauth: false,
  };
}

async function resolveHydrateFailure(error: unknown): Promise<{
  hydrateError: string | null;
  needsReauth: boolean;
}> {
  if (error instanceof ApiError && error.status === 401) {
    try {
      await authApi.logout();
    } catch (logoutError) {
      console.error('Failed to clear invalid session cookie:', logoutError);
    }

    return {
      hydrateError: null,
      needsReauth: true,
    };
  }

  return getHydrateFailureState(error);
}

interface AuthState {
  user: CurrentUser | null;
  isLoading: boolean;
  isHydrated: boolean;
  hydrateError: string | null;
  needsReauth: boolean;
  setUser: (user: CurrentUser) => void;
  clearAuth: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isHydrated: false,
  hydrateError: null,
  needsReauth: false,
  setUser: (user) => {
    set({ user, isLoading: false, isHydrated: true, hydrateError: null, needsReauth: false });
  },
  clearAuth: () => {
    set({ user: null, isLoading: false, isHydrated: true, hydrateError: null, needsReauth: false });
  },
  hydrate: async () => {
    if (get().isLoading) return;

    if (get().user) {
      set({ isHydrated: true, isLoading: false, needsReauth: false });
      return;
    }

    set({ isLoading: true, hydrateError: null, needsReauth: false });
    try {
      const user = await Promise.race([
        authApi.me(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timed out')), AUTH_HYDRATE_TIMEOUT_MS)
        ),
      ]);
      set({ user, isLoading: false, isHydrated: true, hydrateError: null, needsReauth: false });
    } catch (error) {
      console.error('Failed to hydrate session:', error);
      const { hydrateError, needsReauth } = await resolveHydrateFailure(error);

      set({ user: null, isLoading: false, isHydrated: true, hydrateError, needsReauth });
    }
  },
}));
