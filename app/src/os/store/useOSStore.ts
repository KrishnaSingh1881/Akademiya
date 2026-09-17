import { create } from 'zustand';

export type AppType =
  | 'student-intelligence'
  | 'class-insights'
  | 'diagnostic-lab'
  | 'intervention-center'
  | 'my-learning'
  | 'learn'
  | 'practice-lab'
  | 'code-lab'
  | 'progress-lab'
  | 'settings';

export type ResponsiveMode = 'desktop' | 'tablet' | 'mobile';

export interface WindowState {
  id: string;
  appType: AppType;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  prevPosition?: { x: number; y: number };
  prevSize?: { width: number; height: number };
  appProps?: Record<string, unknown>;
}

interface OSStore {
  windows: WindowState[];
  focusedWindowId: string | null;
  nextZIndex: number;
  responsiveMode: ResponsiveMode;

  openWindow: (appType: AppType, appProps?: Record<string, unknown>) => string;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  unmaximizeWindow: (id: string) => void;
  updatePosition: (id: string, pos: { x: number; y: number }) => void;
  updateSize: (id: string, size: { width: number; height: number }) => void;
  closeAll: () => void;
  setResponsiveMode: (mode: ResponsiveMode) => void;
}

const APP_DEFAULTS: Record<AppType, { size: { width: number; height: number }; position: { x: number; y: number } }> = {
  'student-intelligence': { size: { width: 1040, height: 700 }, position: { x: 80, y: 50 } },
  'class-insights':        { size: { width: 980,  height: 660 }, position: { x: 100, y: 60 } },
  'diagnostic-lab':        { size: { width: 1000, height: 680 }, position: { x: 90, y: 55 } },
  'intervention-center':   { size: { width: 1020, height: 690 }, position: { x: 110, y: 65 } },
  'my-learning':           { size: { width: 940,  height: 640 }, position: { x: 95, y: 60 } },
  'learn':                 { size: { width: 1100, height: 740 }, position: { x: 75, y: 45 } },
  'practice-lab':          { size: { width: 1060, height: 720 }, position: { x: 70, y: 45 } },
  'code-lab':              { size: { width: 1120, height: 740 }, position: { x: 60, y: 40 } },
  'progress-lab':          { size: { width: 960,  height: 650 }, position: { x: 120, y: 70 } },
  'settings':              { size: { width: 680,  height: 520 }, position: { x: 140, y: 80 } },
};

const APP_TITLES: Record<AppType, string> = {
  'student-intelligence': 'Student Intelligence',
  'class-insights':        'Class Insights',
  'diagnostic-lab':        'Diagnostic Lab',
  'intervention-center':   'Intervention Center',
  'my-learning':           'My Learning',
  'learn':                 'Learn — CS Curriculum',
  'practice-lab':          'Practice Lab',
  'code-lab':              'Code Lab',
  'progress-lab':          'Progress Lab',
  'settings':              'Settings',
};

export const useOSStore = create<OSStore>((set, get) => ({
  windows: [],
  focusedWindowId: null,
  nextZIndex: 100,
  responsiveMode: 'desktop',

  openWindow: (appType: AppType, appProps?: Record<string, unknown>) => {
    const { windows, nextZIndex } = get();
    // Singleton apps: bring to front if already open
    const existing = windows.find((w) => w.appType === appType);
    if (existing) {
      set({
        windows: windows.map((w) =>
          w.id === existing.id
            ? { ...w, isMinimized: false, zIndex: nextZIndex, appProps: appProps ?? w.appProps }
            : w
        ),
        focusedWindowId: existing.id,
        nextZIndex: nextZIndex + 1,
      });
      return existing.id;
    }

    const id = `${appType}_${Date.now()}`;
    const defaults = APP_DEFAULTS[appType] || { size: { width: 800, height: 600 }, position: { x: 80, y: 60 } };

    // Cascade position slightly if multiple windows
    const cascadeOffset = (windows.length % 5) * 20;
    const newWindow: WindowState = {
      id,
      appType,
      title: APP_TITLES[appType] || appType,
      position: { x: defaults.position.x + cascadeOffset, y: defaults.position.y + cascadeOffset },
      size: { ...defaults.size },
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex,
      appProps,
    };

    set({
      windows: [...windows, newWindow],
      focusedWindowId: id,
      nextZIndex: nextZIndex + 1,
    });

    return id;
  },

  closeWindow: (id: string) => {
    const { windows, focusedWindowId } = get();
    const remaining = windows.filter((w) => w.id !== id);
    let nextFocused = focusedWindowId;
    if (focusedWindowId === id) {
      const topRemaining = remaining
        .filter((w) => !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex)[0];
      nextFocused = topRemaining ? topRemaining.id : null;
    }
    set({ windows: remaining, focusedWindowId: nextFocused });
  },

  focusWindow: (id: string) => {
    const { windows, nextZIndex, focusedWindowId } = get();
    if (focusedWindowId === id) return;
    set({
      windows: windows.map((w) =>
        w.id === id ? { ...w, zIndex: nextZIndex, isMinimized: false } : w
      ),
      focusedWindowId: id,
      nextZIndex: nextZIndex + 1,
    });
  },

  minimizeWindow: (id: string) => {
    const { windows } = get();
    const target = windows.find((w) => w.id === id);
    if (!target) return;
    set({
      windows: windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)),
      focusedWindowId: null,
    });
  },

  restoreWindow: (id: string) => {
    const { windows, nextZIndex } = get();
    set({
      windows: windows.map((w) =>
        w.id === id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w
      ),
      focusedWindowId: id,
      nextZIndex: nextZIndex + 1,
    });
  },

  maximizeWindow: (id: string) => {
    const { windows } = get();
    set({
      windows: windows.map((w) =>
        w.id === id
          ? {
              ...w,
              isMaximized: true,
              prevPosition: { ...w.position },
              prevSize: { ...w.size },
              position: { x: 0, y: 28 }, // below menu bar
              size: { width: window.innerWidth, height: window.innerHeight - 28 - 72 }, // above dock
            }
          : w
      ),
    });
  },

  unmaximizeWindow: (id: string) => {
    const { windows } = get();
    set({
      windows: windows.map((w) =>
        w.id === id && w.prevPosition && w.prevSize
          ? {
              ...w,
              isMaximized: false,
              position: { ...w.prevPosition },
              size: { ...w.prevSize },
            }
          : w
      ),
    });
  },

  updatePosition: (id: string, pos: { x: number; y: number }) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, position: pos } : w)),
    }));
  },

  updateSize: (id: string, size: { width: number; height: number }) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, size } : w)),
    }));
  },

  closeAll: () => set({ windows: [], focusedWindowId: null }),

  setResponsiveMode: (mode: ResponsiveMode) => set({ responsiveMode: mode }),
}));
