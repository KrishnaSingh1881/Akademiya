import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOSStore } from '../os/store/useOSStore';

export default function ClassInsightsApp() {
  const { openWindow } = useOSStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/insights/class')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading class insights aggregation...</div>;
  }

  const summary = data?.summary || {};
  const concepts = data?.concepts || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--panel-border)', paddingBottom: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Class Intelligence & Concept Health</h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Real-time class-wide aggregation of emerging and confirmed conceptual gaps.
          </p>
        </div>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('akademiya-open-test-studio'))}
          className="btn-primary"
          style={{
            fontSize: 12,
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            border: 'none',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)',
          }}
        >
          <span>➕</span>
          <span>Create / Generate Test</span>
        </button>
      </div>

      {/* Assessment Integrity Quick-Audit Banner */}
      <div
        className="glass-panel"
        style={{
          borderRadius: 12,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Assessment Focus & Integrity Engine</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              Configure Anticheat on tests and inspect deterministic forensic audit trails.
            </div>
          </div>
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('akademiya-open-test-studio'))}
          className="btn-secondary"
          style={{ fontSize: 11, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span>🔍</span>
          <span>View Integrity & Assessments</span>
        </button>
      </div>

      {/* Summary KPI Cards */}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <div className="glass-panel" style={{ borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Gaps
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{summary.total_gaps || 0}</div>
        </div>
        <div className="glass-panel" style={{ borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>
            Emerging
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>{summary.emerging_gaps || 0}</div>
        </div>
        <div className="glass-panel" style={{ borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f87171', textTransform: 'uppercase' }}>
            Confirmed
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f87171', marginTop: 4 }}>{summary.confirmed_gaps || 0}</div>
        </div>
        <div className="glass-panel" style={{ borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
            Resolved
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#34d399', marginTop: 4 }}>{summary.resolved_gaps || 0}</div>
        </div>
      </div>

      {/* Concept Breakdown */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' }}>
          Concepts Needing Attention ({concepts.length})
        </h3>

        {concepts.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
            No class-wide learning gaps currently detected.
          </div>
        ) : (
          concepts.map((c: any, idx: number) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                borderRadius: 14,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700 }}>{c.concept}</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.subconcept}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge badge-emerging">{c.emerging_students_count} Emerging</span>
                  {parseInt(c.confirmed_students_count, 10) > 0 && (
                    <span className="badge badge-confirmed">{c.confirmed_students_count} Confirmed</span>
                  )}
                  {parseInt(c.resolved_students_count, 10) > 0 && (
                    <span className="badge badge-resolved">{c.resolved_students_count} Resolved</span>
                  )}
                </div>
              </div>

              {/* Student list for this concept */}
              <div
                style={{
                  background: 'var(--card-bg)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                  Students Affected:
                </span>
                {c.student_gaps && c.student_gaps.map((sg: any, sIdx: number) => (
                  <button
                    key={sIdx}
                    onClick={() => openWindow('student-intelligence', { studentId: sg.student_id })}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--panel-border)',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontSize: 11,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    👤 {sg.student_name} ({sg.status})
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
