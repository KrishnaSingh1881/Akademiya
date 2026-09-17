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
      className="window-titlebar"
    >
      <div style={{ display: 'flex', alignItems: 'center', width: 92, flexShrink: 0 }}>
        <TrafficLights windowId={windowId} isMaximized={isMaximized} />
      </div>
      <div className="window-title">
        {title}
      </div>
      <div style={{ width: 92, flexShrink: 0 }} />
    </div>
  );
}
