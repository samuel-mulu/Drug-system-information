import { useAuthStore } from '../store/auth-store';

export function useCurrentUser() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  return {
    data: user,
    isLoading: isLoading || !isHydrated,
  };
}
