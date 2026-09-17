import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOSStore } from './store/useOSStore';
import { useOSSettings } from './store/useOSSettings';
import MenuBar from './MenuBar';
import Dock from './Dock';
import WindowManager from './WindowManager';
import ConsoleDebugger from './components/ConsoleDebugger';
import AssessmentStudioModal from './components/AssessmentStudioModal';

export default function Desktop() {
  const { user } = useAuth();
  const { openWindow, windows } = useOSStore();
  const { wallpaper } = useOSSettings();
  const [showDebugger, setShowDebugger] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (user && !initialized.current && windows.length === 0) {
      initialized.current = true;
      if (user.role === 'teacher') {
        openWindow('student-intelligence');
      } else {
        openWindow('my-learning');
      }
    }

    const handleOpenStudio = () => setShowTestModal(true);
    window.addEventListener('akademiya-open-test-studio', handleOpenStudio);
    return () => {
      window.removeEventListener('akademiya-open-test-studio', handleOpenStudio);
      useOSStore.getState().closeAll();
    };
  }, [user]);

  const desktopBgStyle = useMemo<React.CSSProperties>(() => {
    if (!wallpaper || wallpaper === 'var(--bg-desktop)') {
      return { background: 'var(--bg-desktop)' };
    }
    if (
      wallpaper.startsWith('http://') ||
      wallpaper.startsWith('https://') ||
      wallpaper.startsWith('data:image')
    ) {
      return {
        backgroundImage: `linear-gradient(rgba(10, 12, 20, 0.45), rgba(10, 12, 20, 0.65)), url("${wallpaper}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    return { background: wallpaper };
  }, [wallpaper]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        transition: 'background 0.35s ease, background-image 0.35s ease',
        ...desktopBgStyle,
      }}
    >
      {/* Top MenuBar */}
      <MenuBar
        isDebuggerOpen={showDebugger}
        onToggleDebugger={() => setShowDebugger((prev) => !prev)}
        onOpenCreateTest={() => setShowTestModal(true)}
      />

      {/* Main Desktop Space */}
      <div
        style={{
          position: 'absolute',
          top: 32,
          bottom: 0,
          left: 0,
          right: 0,
          overflow: 'hidden',
        }}
      >
        <WindowManager />
      </div>

      {/* Floating Bottom Dock */}
      <Dock />

      {/* Live Floating Terminal & Console Debugger */}
      <ConsoleDebugger
        isOpen={showDebugger}
        onClose={() => setShowDebugger(false)}
      />

      {/* Assessment Studio & Test Authoring Modal */}
      <AssessmentStudioModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
      />
    </div>
  );
}
