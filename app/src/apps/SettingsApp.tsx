import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useOSSettings, type FontSize } from '../os/store/useOSSettings';

export default function SettingsApp() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { fontSize, setFontSize } = useOSSettings();
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('/api/settings/profile', { name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update profile');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 520, margin: '0 auto' }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>System Settings</h2>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Account and environment preferences</p>
      </div>

      {/* Account Info */}
      <div className="glass-panel" style={{ borderRadius: 14, padding: 18 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Account Profile</h3>
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                background: 'var(--input-bg)',
                border: '1px solid var(--panel-border)',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(0,0,0,0.1)',
                border: '1px solid var(--panel-border)',
                color: 'var(--text-muted)',
                fontSize: 13,
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button type="submit" className="btn-primary" style={{ padding: '6px 16px', fontSize: 12 }}>
              Save Name
            </button>
            {saved && <span style={{ fontSize: 12, color: '#34d399' }}>✓ Profile updated!</span>}
          </div>
        </form>
      </div>

      {/* Appearance & Font Settings */}
      <div className="glass-panel" style={{ borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700 }}>Appearance & Display</h3>

        {/* Theme Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Theme Mode</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Toggle between Liquid Glass Dark and Clean Light</div>
          </div>
          <button onClick={toggleTheme} className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>
            {theme === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
          </button>
        </div>

        {/* Font Size Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Global Font Scale</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Adjust display typography size</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['small', 'medium', 'large'] as FontSize[]).map((sz) => (
              <button
                key={sz}
                onClick={() => setFontSize(sz)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: fontSize === sz ? '1px solid rgb(var(--accent))' : '1px solid var(--panel-border)',
                  background: fontSize === sz ? 'rgba(var(--accent), 0.2)' : 'transparent',
                  color: fontSize === sz ? 'var(--accent-light)' : 'var(--text-primary)',
                  fontSize: 11,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
