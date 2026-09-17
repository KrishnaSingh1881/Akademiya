import React, { useRef } from 'react';
import { Rnd } from 'react-rnd';
import WindowTitleBar from './components/WindowTitleBar';
import { useOSStore, type WindowState } from './store/useOSStore';

interface AppWindowProps {
  window: WindowState;
  children: React.ReactNode;
}

export default function AppWindow({ window: win, children }: AppWindowProps) {
  const { focusWindow, updatePosition, updateSize, maximizeWindow, unmaximizeWindow } = useOSStore();
  const rndRef = useRef<Rnd>(null);

  if (win.isMinimized) {
    return null;
  }

  return (
    <Rnd
      ref={rndRef}
      size={{ width: win.size.width, height: win.size.height }}
      position={{ x: win.position.x, y: win.position.y }}
      onDragStart={() => focusWindow(win.id)}
      onDragStop={(_, d) => updatePosition(win.id, { x: d.x, y: d.y })}
      onResizeStart={() => focusWindow(win.id)}
      onResizeStop={(_, __, ref, ___, position) => {
        updateSize(win.id, {
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
        });
        updatePosition(win.id, position);
      }}
      minWidth={360}
      minHeight={260}
      bounds="parent"
      dragHandleClassName="window-titlebar"
      enableResizing={!win.isMaximized}
      disableDragging={win.isMaximized}
      style={{ zIndex: win.zIndex }}
      className="window-container"
      onMouseDown={() => focusWindow(win.id)}
    >
      <WindowTitleBar
        windowId={win.id}
        title={win.title}
        isMaximized={win.isMaximized}
        onDoubleClick={() => {
          if (win.isMaximized) unmaximizeWindow(win.id);
          else maximizeWindow(win.id);
        }}
      />
      <div
        className="flex-1 overflow-auto p-4"
        style={{
          background: 'var(--window-bg)',
          color: 'var(--text-primary)'
        }}
      >
        {children}
      </div>
    </Rnd>
  );
}
