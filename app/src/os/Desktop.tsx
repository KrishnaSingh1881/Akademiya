import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOSStore } from './store/useOSStore';
import MenuBar from './MenuBar';
import Dock from './Dock';
import WindowManager from './WindowManager';
import ConsoleDebugger from './components/ConsoleDebugger';
import AssessmentStudioModal from './components/AssessmentStudioModal';

export default function Desktop() {
  const { user } = useAuth();
  const { openWindow, windows } = useOSStore();
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
    return () => window.removeEventListener('akademiya-open-test-studio', handleOpenStudio);
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
