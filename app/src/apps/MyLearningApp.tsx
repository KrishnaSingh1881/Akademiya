import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          borderRadius: 16,
          padding: 20,
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(236, 72, 153, 0.15) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Welcome back, {user?.name}! 👋</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Your personalized learning trajectory, grounded in transparent verifiable evidence.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => openWindow('practice-lab')} className="btn-primary">
            📝 Open Practice Lab
          </button>
          <button onClick={() => openWindow('code-lab')} className="btn-secondary">
            💻 Code Lab
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1, overflowY: 'auto' }}>
        {/* Active Focus Areas & Gaps */}
        <div className="glass-panel" style={{ borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>🔍 Conceptual Focus Areas</h3>
            <span className="badge badge-emerging">{activeGaps.length} Active</span>
          </div>

          {activeGaps.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              ✨ No active learning gaps! Great job maintaining conceptual mastery.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeGaps.map((gap) => (
                <div
                  key={gap.id}
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{gap.concept}</span>
                    <span className={`badge badge-${gap.status}`}>{gap.status}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{gap.subconcept}</p>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    Evidence: {gap.evidence?.length || 0} observations recorded
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Interventions */}
        <div className="glass-panel" style={{ borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>🎯 Assigned Interventions</h3>
            <span className="badge badge-active">{interventions.length} Assigned</span>
          </div>

          {interventions.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No assigned remedial interventions at this time.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {interventions.map((int: any) => {
                const plan = typeof int.plan === 'string' ? JSON.parse(int.plan) : int.plan;
                return (
                  <div
                    key={int.id}
                    style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--card-border)',
                      borderRadius: 10,
                      padding: 12,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{plan.title || int.concept}</span>
                      <span className={`badge badge-${int.status}`}>{int.status}</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{plan.description}</p>
                    <button
                      onClick={() => openWindow('practice-lab')}
                      className="btn-secondary"
                      style={{ fontSize: 11, padding: '4px 8px', marginTop: 8 }}
                    >
                      Practice Assigned Questions →
                    </button>
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
