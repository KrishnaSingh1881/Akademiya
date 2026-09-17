import React, { useState } from 'react';
import type { AppDefinition } from '../apps/registry';

interface DockIconProps {
  app: AppDefinition;
  isOpen: boolean;
  isActive: boolean;
  onClick: () => void;
}

export default function DockIcon({ app, isOpen, isActive, onClick }: DockIconProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.9)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.15)',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          {app.name}
        </div>
      )}

      {/* Tile */}
      <button
        onClick={onClick}
        style={{
          width: 50,
          height: 50,
          borderRadius: 14,
          background: isActive
            ? 'rgba(255, 255, 255, 0.25)'
            : hovered
            ? 'rgba(255, 255, 255, 0.18)'
            : 'rgba(255, 255, 255, 0.08)',
          border: isActive
            ? '1px solid rgba(var(--accent), 0.8)'
            : '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          color: 'var(--text-primary)',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: hovered ? 'scale(1.18) translateY(-4px)' : 'scale(1)',
          boxShadow: isActive
            ? '0 0 14px rgba(var(--accent), 0.5)'
            : hovered
            ? '0 8px 18px rgba(0,0,0,0.3)'
            : 'none',
        }}
      >
        {app.icon}
      </button>

      {/* Active Dot */}
      <div
        style={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          marginTop: 4,
          backgroundColor: isOpen
            ? isActive
              ? 'rgb(var(--accent))'
              : 'rgba(255, 255, 255, 0.6)'
            : 'transparent',
          transition: 'all 0.2s ease',
        }}
      />
    </div>
  );
}
