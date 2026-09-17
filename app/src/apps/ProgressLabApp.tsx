import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ProgressLabApp() {
  const { user } = useAuth();
  const [progressList, setProgressList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    axios.get(`/api/progress/${user.id}`)
      .then(res => setProgressList(res.data.progress || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Progress Lab & Learning Loop Resolution</h2>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Transparent before-and-after evidence comparison demonstrating verifiable conceptual mastery gain.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading verified progress records...
        </div>
      ) : progressList.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          No reassessed progress records yet. Complete an intervention practice set and reassessment to close the learning loop.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {progressList.map((prog) => {
            const delta = typeof prog.delta === 'string' ? JSON.parse(prog.delta) : prog.delta;
            return (
              <div
                key={prog.id}
                className="glass-panel"
                style={{
                  borderRadius: 16,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {/* Milestone Banner */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>🏆</span>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800 }}>{prog.concept} Learning Loop Closed</h3>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        Reassessment Completed: {new Date(prog.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="badge badge-resolved">Loop Resolved</span>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        fontWeight: 800,
                        fontSize: 14,
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                      }}
                    >
                      +{delta?.accuracy_gain_pct || 0}% Accuracy Gain
                    </span>
                  </div>
                </div>

                {/* Before / After Evidence Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {/* Before Evidence */}
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: 12,
                      padding: 14,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#f87171', textTransform: 'uppercase' }}>
                        Baseline Evidence ({delta?.before_total || 0} attempts)
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#f87171' }}>
                        {delta?.before_accuracy_pct || 0}% Accuracy
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {prog.before_evidence && prog.before_evidence.map((ev: any, i: number) => (
                        <div key={i} style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          • {ev.statement || 'Practice attempt'} — <span style={{ color: ev.result === 'correct' ? '#34d399' : '#f87171' }}>{ev.result}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* After Evidence */}
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: 12,
                      padding: 14,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                        Post-Intervention Evidence ({delta?.after_total || 0} attempts)
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#34d399' }}>
                        {delta?.after_accuracy_pct || 0}% Accuracy
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {prog.after_evidence && prog.after_evidence.map((ev: any, i: number) => (
                        <div key={i} style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          • {ev.statement || 'Reassessment attempt'} — <span style={{ color: ev.result === 'correct' ? '#34d399' : '#f87171' }}>{ev.result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
