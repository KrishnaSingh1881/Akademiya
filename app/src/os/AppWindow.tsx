import React, { useRef } from 'react';
import { Rnd } from 'react-rnd';
import WindowTitleBar from './components/WindowTitleBar';
import { useOSStore, type WindowState } from './store/useOSStore';

interface AppWindowProps {
  window: WindowState;
  children: React.ReactNode;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class WindowErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Window application crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontWeight: 600, color: '#f87171', marginBottom: 8 }}>
            This application encountered an unexpected error.
          </p>
          <p style={{ fontSize: 12 }}>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
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
        className={`window-content custom-scrollbar window-content-${win.appType}`}
        style={{
          color: 'var(--text-primary)',
          ...(win.appType === 'code-lab'
            ? { padding: '10px 12px', overflow: 'hidden' }
            : {}),
        }}
      >
        <WindowErrorBoundary>
          {children}
        </WindowErrorBoundary>
      </div>
    </Rnd>
  );
}
