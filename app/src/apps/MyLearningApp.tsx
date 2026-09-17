import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LightbulbOn } from '@keyline-icons/react';
import { FileText, Code2, Search, Sparkles, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOSStore } from '../os/store/useOSStore';

export default function MyLearningApp() {
  const { user } = useAuth();
  const { openWindow } = useOSStore();
  const [gaps, setGaps] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      axios.get(`/api/gaps/${user.id}`),
      axios.get(`/api/interventions/student/${user.id}`),
      axios.get(`/api/progress/${user.id}`)
    ])
      .then(([gapsRes, intRes, progRes]) => {
        setGaps(gapsRes.data.gaps || []);
        setInterventions(intRes.data.interventions || []);
        setProgress(progRes.data.progress || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading your learning profile...</div>;
  }

  const activeGaps = gaps.filter(g => g.status !== 'resolved');
  const resolvedGaps = gaps.filter(g => g.status === 'resolved');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
      {/* Welcome Banner (Layer 2 Surface) */}
      <div
        className="glass-panel"
        style={{
          borderRadius: 16,
          padding: '22px 26px',
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.22) 0%, rgba(236, 72, 153, 0.14) 100%)',
          border: '1px solid rgba(167, 139, 250, 0.28)',
          boxShadow: '0 8px 30px rgba(124, 58, 237, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            }}
          >
            <LightbulbOn width={24} height={24} strokeWidth={2} className="keyline-theme-icon" />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>Welcome back, {user?.name}!</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
              Your personalized learning trajectory, grounded in transparent verifiable evidence.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => openWindow('practice-lab')} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FileText size={14} /> Open Practice Lab
          </button>
          <button onClick={() => openWindow('code-lab')} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Code2 size={14} /> Code Lab
          </button>
        </div>
      </div>

      {/* Main Grid (2-Column Layer 2 Panels) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flex: 1, minHeight: 0 }}>
        {/* Active Focus Areas & Gaps Panel */}
        <div
          className="glass-panel"
          style={{
            borderRadius: 16,
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            overflowY: 'auto',
            minHeight: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Search size={15} /> Conceptual Focus Areas
            </h3>
            <span className="badge badge-emerging">{activeGaps.length} Active</span>
          </div>

          {activeGaps.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed var(--card-border)',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Sparkles size={24} color="#818cf8" />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 }}>
                No active learning gaps!
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Great job maintaining full conceptual mastery across your curriculum.
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeGaps.map((gap) => (
                <div
                  key={gap.id}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{gap.concept}</span>
                    <span className={`badge badge-${gap.status}`}>{gap.status}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{gap.subconcept}</p>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Evidence: {gap.evidence?.length || 0} observations recorded
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Interventions Panel */}
        <div
          className="glass-panel"
          style={{
            borderRadius: 16,
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            overflowY: 'auto',
            minHeight: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Target size={15} /> Assigned Interventions
            </h3>
            <span className="badge badge-active">{interventions.length} Assigned</span>
          </div>

          {interventions.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed var(--card-border)',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Target size={24} color="#818cf8" />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 }}>
                No assigned remedial interventions
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                You are completely up to date with your assigned interventions.
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {interventions.map((int: any) => {
                const plan = typeof int.plan === 'string' ? JSON.parse(int.plan) : int.plan;
                return (
                  <div
                    key={int.id}
                    className="glass-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{plan.title || int.concept}</span>
                      <span className={`badge badge-${int.status}`}>{int.status}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{plan.description}</p>
                    <div style={{ marginTop: 4 }}>
                      <button
                        onClick={() => openWindow('practice-lab')}
                        className="btn-primary"
                        style={{
                          fontSize: 11,
                          padding: '6px 14px',
                          borderRadius: 7,
                        }}
                      >
                        Practice Assigned Questions →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

