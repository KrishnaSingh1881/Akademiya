import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOSStore } from '../os/store/useOSStore';

export default function StudentIntelligenceApp() {
  const { openWindow } = useOSStore();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [gaps, setGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch students list
    axios.get('/api/auth/users?role=student')
      .then(res => {
        setStudents(res.data.users);
        if (res.data.users.length > 0) {
          setSelectedStudentId(res.data.users[0].id);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedStudentId) return;
    setLoading(true);
    axios.get(`/api/gaps/${selectedStudentId}`)
      .then(res => setGaps(res.data.gaps))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedStudentId]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--panel-border)', paddingBottom: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Student Intelligence Engine</h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Transparent learning gaps backed strictly by concrete, inspectable evidence trails.
          </p>
        </div>

        {/* Student Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600 }}>Select Student:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: 'var(--input-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--panel-border)',
              fontSize: 12,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id} style={{ background: '#1e293b', color: 'white' }}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading student evidence profile...
        </div>
      ) : gaps.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          No active learning gaps detected for {selectedStudent?.name || 'this student'}.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          {gaps.map((gap) => (
            <div
              key={gap.id}
              className="glass-panel"
              style={{
                borderRadius: 14,
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {/* Gap Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🧠</span>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>{gap.concept}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{gap.subconcept}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`badge badge-${gap.status}`}>{gap.status}</span>
                  {gap.status !== 'resolved' && (
                    <>
                      <button
                        onClick={() => openWindow('diagnostic-lab', { gapId: gap.id, studentId: gap.student_id })}
                        className="btn-primary"
                        style={{ fontSize: 11, padding: '4px 10px' }}
                      >
                        🔬 Run Diagnostic
                      </button>
                      <button
                        onClick={() => openWindow('intervention-center', { gapId: gap.id, studentId: gap.student_id })}
                        className="btn-secondary"
                        style={{ fontSize: 11, padding: '4px 10px' }}
                      >
                        🎯 Intervene
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Evidence Section - Strictly Concrete Evidence List */}
              <div
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Concrete Evidence Observations ({gap.evidence?.length || 0} attempts):
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {gap.evidence && gap.evidence.length > 0 ? (
                    gap.evidence.map((ev: any, idx: number) => (
                      <div
                        key={ev.id || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                          fontSize: 12,
                          lineHeight: '1.4',
                        }}
                      >
                        <span style={{ color: ev.result === 'correct' ? '#34d399' : '#f87171', fontWeight: 700 }}>
                          •
                        </span>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 600 }}>
                            {ev.result === 'correct' ? 'Demonstrated Mastery: ' : 'Failed Attempt: '}
                          </span>
                          <span style={{ color: 'var(--text-primary)' }}>
                            {ev.statement || `Attempt recorded on ${ev.subconcept}`}
                          </span>
                          <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)' }}>
                            Source: {ev.attempt_source || 'practice'} | Awarded: {ev.marks_awarded || 0} pts | {new Date(ev.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No evidence rows linked.</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
