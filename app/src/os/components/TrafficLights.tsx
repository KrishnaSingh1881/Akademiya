import React from 'react';
import { AppX, AppMinus, AppPlus } from '@keyline-icons/react';
import { useOSStore } from '../store/useOSStore';

interface TrafficLightsProps {
  windowId: string;
  isMaximized: boolean;
}

export default function TrafficLights({ windowId, isMaximized }: TrafficLightsProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, unmaximizeWindow } = useOSStore();

  return (
    <div className="traffic-lights-container">
      {/* Close (Red) -> AppX */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          closeWindow(windowId);
        }}
        title="Close"
        className="traffic-light traffic-light-red"
        aria-label="Close Window"
      >
        <span className="traffic-light-icon">
          <AppX width={13} height={13} strokeWidth={2.2} className="keyline-theme-icon" />
        </span>
      </button>

      {/* Minimize (Yellow) -> AppMinus */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          minimizeWindow(windowId);
        }}
        title="Minimize"
        className="traffic-light traffic-light-yellow"
        aria-label="Minimize Window"
      >
        <span className="traffic-light-icon">
          <AppMinus width={13} height={13} strokeWidth={2.2} className="keyline-theme-icon" />
        </span>
      </button>

      {/* Maximize/Restore (Green) -> AppPlus */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isMaximized) unmaximizeWindow(windowId);
          else maximizeWindow(windowId);
        }}
        title={isMaximized ? 'Restore' : 'Maximize'}
        className="traffic-light traffic-light-green"
        aria-label={isMaximized ? 'Restore Window' : 'Maximize Window'}
      >
        <span className="traffic-light-icon">
          <AppPlus width={13} height={13} strokeWidth={2.2} className="keyline-theme-icon" />
        </span>
      </button>
    </div>
  );
}


