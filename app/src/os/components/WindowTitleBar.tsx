import React from 'react';
import TrafficLights from './TrafficLights';

interface WindowTitleBarProps {
  windowId: string;
  title: string;
  isMaximized: boolean;
  onDoubleClick: () => void;
}

export default function WindowTitleBar({ windowId, title, isMaximized, onDoubleClick }: WindowTitleBarProps) {
  return (
    <div
      onDoubleClick={onDoubleClick}
      className="window-titlebar flex items-center justify-between px-3 py-2 select-none cursor-move"
      style={{
        background: 'var(--window-header)',
        borderBottom: '1px solid var(--panel-border)',
        height: 38,
      }}
    >
      <div className="flex items-center gap-3">
        <TrafficLights windowId={windowId} isMaximized={isMaximized} />
      </div>
      <div
        className="text-xs font-semibold tracking-wide truncate max-w-[60%]"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </div>
      <div style={{ width: 48 }} /> {/* Balancer */}
    </div>
  );
}
