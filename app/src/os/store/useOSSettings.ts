import { create } from 'zustand';

export type FontSize = 'small' | 'medium' | 'large';

interface OSSettingsState {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  dockAutohide: boolean;
  toggleDockAutohide: () => void;
}

const initialFontSize = (localStorage.getItem('akademiya_font_size') as FontSize) || 'medium';

// Ensure the initial data attribute is immediately placed on document root
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-font-scale', initialFontSize);
}

export const useOSSettings = create<OSSettingsState>((set) => ({
  fontSize: initialFontSize,
  setFontSize: (size) => {
    localStorage.setItem('akademiya_font_size', size);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-font-scale', size);
    }
    set({ fontSize: size });
  },
  dockAutohide: false,
  toggleDockAutohide: () => set((state) => ({ dockAutohide: !state.dockAutohide })),
}));

