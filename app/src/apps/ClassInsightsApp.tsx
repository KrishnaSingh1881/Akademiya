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
      <div style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Class Intelligence & Concept Health</h2>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Real-time class-wide aggregation of emerging and confirmed conceptual gaps.
        </p>
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
