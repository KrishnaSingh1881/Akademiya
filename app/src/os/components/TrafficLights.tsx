import React from 'react';
import { useOSStore } from '../store/useOSStore';

interface TrafficLightsProps {
  windowId: string;
  isMaximized: boolean;
}

export default function TrafficLights({ windowId, isMaximized }: TrafficLightsProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, unmaximizeWindow } = useOSStore();

  return (
    <div className="flex items-center gap-2 px-1">
      {/* Close (Red) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          closeWindow(windowId);
        }}
        title="Close"
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#ff5f56',
          border: '1px solid rgba(0,0,0,0.15)',
          cursor: 'pointer',
          outline: 'none'
        }}
      />
      {/* Minimize (Yellow) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          minimizeWindow(windowId);
        }}
        title="Minimize"
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#ffbd2e',
          border: '1px solid rgba(0,0,0,0.15)',
          cursor: 'pointer',
          outline: 'none'
        }}
      />
      {/* Maximize (Green) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isMaximized) unmaximizeWindow(windowId);
          else maximizeWindow(windowId);
        }}
        title={isMaximized ? 'Restore' : 'Maximize'}
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#27c93f',
          border: '1px solid rgba(0,0,0,0.15)',
          cursor: 'pointer',
          outline: 'none'
        }}
      />
    </div>
  );
}
