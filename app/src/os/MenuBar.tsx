import React, { useState, useEffect } from 'react';
import { LightbulbOn } from '@keyline-icons/react';
import { Plus, Terminal, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useOSStore } from './store/useOSStore';
import academiyaLogo from '../media/academiya.webp';

interface MenuBarProps {
  isDebuggerOpen?: boolean;
  onToggleDebugger?: () => void;
  onOpenCreateTest?: () => void;
}

export default function MenuBar({ isDebuggerOpen, onToggleDebugger, onOpenCreateTest }: MenuBarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { windows, focusedWindowId, openWindow } = useOSStore();
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeWindow = windows.find((w) => w.id === focusedWindowId);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 32,
        background: 'rgba(10, 12, 20, 0.75)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--panel-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        fontSize: 12,
        fontWeight: 500,
        zIndex: 500,
        color: 'var(--text-primary)',
        overflowX: 'auto',
        userSelect: 'none',
      }}
    >
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700 }}>
          <img
            src={academiyaLogo}
            alt="Akademiya"
            style={{
              height: 20,
              width: 20,
              objectFit: 'contain',
              borderRadius: 4,
              display: 'block',
            }}
          />
          <span
            style={{
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.02em',
              fontSize: 13,
            }}
          >
            Akademiya
          </span>
        </div>
        {activeWindow && (
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 11 }}>
            / {activeWindow.title}
          </span>
        )}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: 11, marginRight: 4 }}>{time}</span>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 2, flexShrink: 0 }}>
            <span
              className={`badge ${
                user.role === 'teacher' ? 'badge-active' : 'badge-emerging'
              }`}
              style={{ fontSize: 10, padding: '2px 6px' }}
            >
              {user.role}
            </span>
            <span style={{ fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>{user.name}</span>
          </div>
        )}

        {user && (
          <button
            onClick={() => openWindow('my-learning')}
            className="my-learning-menu-btn"
            style={{ padding: '3px 8px', fontSize: 11, flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}
            title="Open My Learning Cockpit"
          >
            <LightbulbOn width={13} height={13} strokeWidth={2.2} className="keyline-theme-icon" />
            <span>My Learning</span>
          </button>
        )}

        {user?.role === 'teacher' && onOpenCreateTest && (
          <button
            onClick={onOpenCreateTest}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              border: 'none',
              borderRadius: 6,
              padding: '3px 8px',
              color: 'white',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(168, 85, 247, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              flexShrink: 0,
            }}
            title="Create or Generate Assessment / Test"
          >
            <Plus size={12} strokeWidth={2.5} />
            <span>Create Test</span>
          </button>
        )}

        <button
          onClick={onToggleDebugger}
          style={{
            background: isDebuggerOpen ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${isDebuggerOpen ? '#38bdf8' : 'var(--panel-border)'}`,
            borderRadius: 6,
            padding: '3px 8px',
            color: isDebuggerOpen ? '#38bdf8' : 'var(--text-primary)',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
          }}
          title="Toggle Live Console & Terminal Debugger"
        >
          <Terminal size={12} strokeWidth={2} />
          <span>Console</span>
        </button>

        <button
          onClick={toggleTheme}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--panel-border)',
            borderRadius: 6,
            padding: '3px 8px',
            color: 'var(--text-primary)',
            fontSize: 11,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
          }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={12} strokeWidth={2} /> : <Moon size={12} strokeWidth={2} />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        <button
          onClick={logout}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 6,
            padding: '3px 8px',
            color: '#f87171',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
          }}
        >
          <LogOut size={12} strokeWidth={2} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
