import { create } from 'zustand';

export type FontSize = 'small' | 'medium' | 'large';

interface OSSettingsState {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  dockAutohide: boolean;
  toggleDockAutohide: () => void;
}

export const useOSSettings = create<OSSettingsState>((set) => ({
  fontSize: 'medium',
  setFontSize: (size) => set({ fontSize: size }),
  dockAutohide: false,
  toggleDockAutohide: () => set((state) => ({ dockAutohide: !state.dockAutohide })),
}));
