import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOSStore } from './store/useOSStore';
import MenuBar from './MenuBar';
import Dock from './Dock';
import WindowManager from './WindowManager';

export default function Desktop() {
  const { user } = useAuth();
  const { openWindow, windows } = useOSStore();
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
  }, [user]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-desktop)',
      }}
    >
      {/* Top MenuBar */}
      <MenuBar />

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
    </div>
  );
}
