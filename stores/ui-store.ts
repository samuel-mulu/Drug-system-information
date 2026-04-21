import { create } from 'zustand';

interface UIState {
  mobileNavOpen: boolean;
  desktopNavCollapsed: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
  toggleDesktopNav: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  mobileNavOpen: false,
  desktopNavCollapsed: false,
  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),
  toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),
  toggleDesktopNav: () => set((state) => ({ desktopNavCollapsed: !state.desktopNavCollapsed })),
}));
