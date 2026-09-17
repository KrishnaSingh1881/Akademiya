import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { Play, Check, Bot, Lightbulb } from 'lucide-react';

export default function CodeLabApp() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [code, setCode] = useState<string>('');
  const [stdin, setStdin] = useState<string>('');
  const [output, setOutput] = useState<any>(null);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [explaining, setExplaining] = useState(false);

  useEffect(() => {
    axios.get('/api/code-lab/challenges')
      .then(res => {
        setChallenges(res.data.challenges);
        if (res.data.challenges.length > 0) {
          selectChallenge(res.data.challenges[0]);
        }
      })
      .catch(console.error);
  }, []);

  const selectChallenge = (ch: any) => {
    setSelectedChallenge(ch);
    setCode(ch.initial_code || '');
    setOutput(null);
    setSubmissionResult(null);
    setExplanation(null);
  };

  const handleRun = async () => {
    if (!code) return;
    setRunning(true);
    try {
      const res = await axios.post('/api/code-lab/run', {
        code,
        language: selectedChallenge?.language || 'python',
        stdin
      });
      setOutput(res.data.result);
    } catch (err: any) {
      setOutput({ stderr: err.message });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedChallenge || !code) return;
    setSubmitting(true);
    setExplanation(null);
    try {
      const res = await axios.post('/api/code-lab/submit', {
        challenge_id: selectedChallenge.id,
        code,
        language: selectedChallenge.language || 'python'
      });
      setSubmissionResult(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAskAI = async () => {
    if (!selectedChallenge || !code) return;
    setExplaining(true);
    try {
      const res = await axios.post('/api/code-lab/explain', {
        challenge_id: selectedChallenge.id,
        code,
        error_message: output?.stderr || 'Test case failure'
      });
      setExplanation(res.data.explanation);
    } catch (err: any) {
      setExplanation('Unable to contact AI explainer.');
    } finally {
      setExplaining(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, height: '100%' }}>
      {/* Left Sidebar: Challenges */}
      <div className="glass-panel" style={{ borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Code Lab</h3>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Algorithmic coding challenges</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {challenges.map((ch) => (
            <div
              key={ch.id}
              onClick={() => selectChallenge(ch)}
              style={{
                padding: 10,
                borderRadius: 10,
                background: selectedChallenge?.id === ch.id ? 'rgba(var(--accent), 0.2)' : 'var(--card-bg)',
                border: selectedChallenge?.id === ch.id ? '1px solid rgba(var(--accent), 0.6)' : '1px solid var(--card-border)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 10, color: 'var(--accent-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                {ch.concept}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{ch.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Area: Code Editor & Execution Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', overflow: 'hidden' }}>
        {/* Challenge Description */}
        {selectedChallenge && (
          <div className="glass-panel" style={{ borderRadius: 12, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>{selectedChallenge.title}</h3>
              <span className="badge badge-active">{selectedChallenge.language}</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              {selectedChallenge.description}
            </p>
          </div>
        )}

        {/* Editor Container */}
        <div
          style={{
            flex: 1,
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid var(--panel-border)',
            minHeight: 240,
          }}
        >
          <Editor
            height="100%"
            language={selectedChallenge?.language || 'python'}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {/* Controls and Input/Output */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={handleRun} disabled={running} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {running ? 'Running...' : <><Play size={12} fill="currentColor" /> Run Code</>}
          </button>
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {submitting ? 'Testing cases...' : <><Check size={13} strokeWidth={2.5} /> Submit Challenge</>}
          </button>
          <button onClick={handleAskAI} disabled={explaining} className="btn-secondary" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {explaining ? 'Analyzing...' : <><Bot size={13} /> AI Hint</>}
          </button>
        </div>

        {/* Stdin and Terminal Output */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, height: 110 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Standard Input (stdin):</span>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Input parameters..."
              style={{
                flex: 1,
                borderRadius: 8,
                background: 'var(--input-bg)',
                border: '1px solid var(--panel-border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                padding: 8,
                resize: 'none',
              }}
            />
          </div>

          <div
            style={{
              background: '#090a10',
              borderRadius: 8,
              border: '1px solid var(--panel-border)',
              padding: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>Terminal Output:</div>
            {output && (
              <>
                {output.stdout && <pre style={{ color: '#34d399' }}>{output.stdout}</pre>}
                {output.stderr && <pre style={{ color: '#f87171' }}>{output.stderr}</pre>}
              </>
            )}
            {submissionResult && (
              <div style={{ color: submissionResult.evaluation?.is_correct ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
                Test Cases: {submissionResult.evaluation?.visible_cases_passed}/{submissionResult.evaluation?.visible_cases_total} visible passed. 
                Awarded: {submissionResult.evaluation?.marks_awarded} pts.
              </div>
            )}
            {explanation && (
              <div style={{ color: '#a78bfa', marginTop: 4, fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Lightbulb size={13} /> {explanation}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
