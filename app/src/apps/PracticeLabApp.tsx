import React from 'react';

export default function PracticeLabApp() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Practice Lab</h2>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Interactive MCQ & conceptual practice.
        </p>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          gap: 8,
          minHeight: 200,
        }}
      >
        <p style={{ fontSize: 13 }}>Practice Lab is currently under development.</p>
      </div>
    </div>
  );
}
