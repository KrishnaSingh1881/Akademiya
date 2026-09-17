import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useOSStore } from './store/useOSStore';

export default function MenuBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { windows, focusedWindowId } = useOSStore();
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
        padding: '0 16px',
        fontSize: 12,
        fontWeight: 500,
        zIndex: 500,
        color: 'var(--text-primary)',
      }}
    >
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
          <span style={{ fontSize: 16 }}>✨</span>
          <span
            style={{
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.02em',
            }}
          >
            Akademiya
          </span>
        </div>
        {activeWindow && (
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            / {activeWindow.title}
          </span>
        )}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{time}</span>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              className={`badge ${
                user.role === 'teacher' ? 'badge-active' : 'badge-emerging'
              }`}
            >
              {user.role}
            </span>
            <span style={{ fontWeight: 600 }}>{user.name}</span>
          </div>
        )}

        <button
          onClick={toggleTheme}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--panel-border)',
            borderRadius: 6,
            padding: '2px 8px',
            color: 'var(--text-primary)',
            fontSize: 11,
            cursor: 'pointer',
          }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>

        <button
          onClick={logout}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 6,
            padding: '2px 8px',
            color: '#f87171',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
