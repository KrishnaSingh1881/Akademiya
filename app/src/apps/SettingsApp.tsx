import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Sun, Moon, Check, Upload, Image as ImageIcon, RotateCcw, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useOSSettings, WALLPAPER_PRESETS, type FontSize } from '../os/store/useOSSettings';

export default function SettingsApp() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { fontSize, setFontSize, wallpaper, setWallpaper, resetWallpaper } = useOSSettings();
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  // Compress and resize image to fit in localStorage cleanly
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1920;
        const maxHeight = 1080;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setWallpaper(readerEvent.target?.result as string, 'custom');
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setWallpaper(dataUrl, 'custom');
      };
      img.onerror = () => {
        setUploadError('Failed to parse uploaded image file.');
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!customUrlInput.trim()) return;
    setWallpaper(customUrlInput.trim(), 'custom');
    setCustomUrlInput('');
  };

  const previewStyle = useMemo<React.CSSProperties>(() => {
    if (!wallpaper || wallpaper === 'var(--bg-desktop)') {
      return { background: 'linear-gradient(135deg, #1e1b4b 0%, #090d16 100%)' };
    }
    if (
      wallpaper.startsWith('http://') ||
      wallpaper.startsWith('https://') ||
      wallpaper.startsWith('data:image')
    ) {
      return {
        backgroundImage: `linear-gradient(rgba(10, 12, 20, 0.35), rgba(10, 12, 20, 0.55)), url("${wallpaper}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    return { background: wallpaper };
  }, [wallpaper]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560, margin: '0 auto', overflowY: 'auto', paddingBottom: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>System Settings</h2>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
          Account profile, desktop wallpaper, and environment display preferences
        </p>
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
            {saved && (
              <span style={{ fontSize: 12, color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Check size={13} /> Profile updated!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Desktop Wallpaper Settings */}
      <div className="glass-panel" style={{ borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Desktop Wallpaper</h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Choose a preset or upload your own custom background wallpaper
            </p>
          </div>
          {wallpaper !== 'var(--bg-desktop)' && (
            <button
              type="button"
              onClick={resetWallpaper}
              className="btn-secondary"
              style={{ fontSize: 11, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 7 }}
              title="Reset desktop to original cosmic gradient"
            >
              <RotateCcw size={12} /> Reset to Default
            </button>
          )}
        </div>

        {/* Live Wallpaper Preview Card */}
        <div
          style={{
            height: 96,
            borderRadius: 10,
            border: '1px solid var(--panel-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.4)',
            transition: 'background 0.3s ease',
            ...previewStyle,
          }}
        >
          <div
            style={{
              padding: '5px 14px',
              borderRadius: 20,
              background: 'rgba(10, 12, 20, 0.75)',
              backdropFilter: 'blur(10px)',
              fontSize: 11,
              fontWeight: 600,
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <ImageIcon size={13} color="#38bdf8" />
            <span>Active Desktop Wallpaper</span>
          </div>
        </div>

        {/* Curated Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Curated Color &amp; Gradient Presets
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: 8 }}>
            {WALLPAPER_PRESETS.map((preset) => {
              const isSelected = wallpaper === preset.value;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setWallpaper(preset.value, 'preset')}
                  style={{
                    height: 54,
                    borderRadius: 8,
                    background: preset.preview,
                    border: isSelected ? '2px solid #38bdf8' : '1px solid var(--panel-border)',
                    boxShadow: isSelected ? '0 0 14px rgba(56, 189, 248, 0.5)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 4,
                    position: 'relative',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  title={preset.name}
                >
                  {isSelected && (
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'rgba(10, 12, 20, 0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #38bdf8',
                      }}
                    >
                      <Check size={12} color="#38bdf8" strokeWidth={2.5} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Image Upload & URL Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 6, borderTop: '1px solid var(--panel-border)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Custom Image Wallpaper
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* File Upload Button */}
            <label
              className="btn-secondary"
              style={{
                fontSize: 11,
                padding: '7px 14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 8,
                flexShrink: 0,
              }}
            >
              <Upload size={13} />
              <span>Choose Image File...</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>

            {/* URL Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: 200, display: 'flex', gap: 6 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <LinkIcon
                  size={12}
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="url"
                  placeholder="Or paste image URL (https://...)"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyUrl();
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 28px',
                    borderRadius: 8,
                    background: 'var(--input-bg)',
                    border: '1px solid var(--panel-border)',
                    color: 'var(--text-primary)',
                    fontSize: 11,
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={!customUrlInput.trim()}
                className="btn-primary"
                style={{
                  fontSize: 11,
                  padding: '6px 14px',
                  borderRadius: 8,
                  flexShrink: 0,
                  opacity: customUrlInput.trim() ? 1 : 0.5,
                  cursor: customUrlInput.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Apply
              </button>
            </div>
          </div>

          {uploadError && (
            <div style={{ fontSize: 11, color: '#f87171' }}>{uploadError}</div>
          )}
        </div>
      </div>

      {/* Appearance & Font Settings */}
      <div className="glass-panel" style={{ borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Display &amp; Font Scaling</h3>

        {/* Theme Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Theme Mode</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Toggle between Liquid Glass Dark and Clean Light</div>
          </div>
          <button onClick={toggleTheme} className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 8 }}>
            {theme === 'dark' ? <><Sun size={13} /> Switch to Light</> : <><Moon size={13} /> Switch to Dark</>}
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
                  padding: '4px 12px',
                  borderRadius: 6,
                  border: fontSize === sz ? '1px solid rgb(var(--accent))' : '1px solid var(--panel-border)',
                  background: fontSize === sz ? 'rgba(var(--accent), 0.2)' : 'transparent',
                  color: fontSize === sz ? 'var(--accent-light)' : 'var(--text-primary)',
                  fontSize: 11,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontWeight: fontSize === sz ? 700 : 500,
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
