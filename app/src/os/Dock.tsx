import React from 'react';
import { useAuth } from '../context/AuthContext';
import { APP_REGISTRY } from './apps/registry';
import DockIcon from './components/DockIcon';
import { useOSStore } from './store/useOSStore';

export default function Dock() {
  const { user } = useAuth();
  const { windows, focusedWindowId, openWindow, focusWindow, restoreWindow } = useOSStore();

  if (!user) return null;

  // Filter apps permitted for user's role
  const permittedApps = APP_REGISTRY.filter((app) => app.allowedRoles.includes(user.role));

  const handleAppClick = (appId: string) => {
    const existing = windows.find((w) => w.appType === appId);
    if (!existing) {
      openWindow(appId as any);
    } else if (existing.isMinimized) {
      restoreWindow(existing.id);
    } else if (focusedWindowId === existing.id) {
      // already focused
    } else {
      focusWindow(existing.id);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 400,
      }}
    >
      <div
        className="liquid-dock"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 16px',
          borderRadius: 24,
        }}
      >
        {permittedApps.map((app) => {
          const win = windows.find((w) => w.appType === app.id);
          const isOpen = Boolean(win);
          const isActive = win?.id === focusedWindowId && !win?.isMinimized;

          return (
            <DockIcon
              key={app.id}
              app={app}
              isOpen={isOpen}
              isActive={isActive}
              onClick={() => handleAppClick(app.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
