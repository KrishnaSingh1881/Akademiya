import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function PracticeLabApp() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<string>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = () => {
    if (!user) return;
    setLoading(true);
    axios.get(`/api/practice/${user.id}`)
      .then(res => {
        setQuestions(res.data.questions);
        if (res.data.questions.length > 0 && !selectedQuestion) {
          setSelectedQuestion(res.data.questions[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuestions();
  }, [user]);

  const concepts = Array.from(new Set(questions.map(q => q.concept)));
  const filteredQuestions = selectedConcept === 'all'
    ? questions
    : questions.filter(q => q.concept === selectedConcept);

  const handleSelectQuestion = (q: any) => {
    setSelectedQuestion(q);
    setSelectedOptionId('');
    setLastResult(null);
  };

  const handleSubmitAttempt = async () => {
    if (!selectedQuestion || !selectedOptionId) return;
    setSubmitting(true);
    try {
      const res = await axios.post('/api/attempts', {
        question_id: selectedQuestion.id,
        selected_option_ids: [selectedOptionId],
        source: 'practice'
      });
      setLastResult(res.data);
      // Refresh questions to show updated attempt history
      fetchQuestions();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Attempt submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const parsedOptions = selectedQuestion
    ? (typeof selectedQuestion.options === 'string' ? JSON.parse(selectedQuestion.options) : selectedQuestion.options)
    : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, height: '100%' }}>
      {/* Left Sidebar: Questions Explorer */}
      <div className="glass-panel" style={{ borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Practice Questions</h3>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Teacher + AI Generated Practice Pool</p>
        </div>

        {/* Concept Filter */}
        <select
          value={selectedConcept}
          onChange={(e) => setSelectedConcept(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            background: 'var(--input-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--panel-border)',
            fontSize: 12,
            outline: 'none',
          }}
        >
          <option value="all" style={{ background: '#1e293b' }}>All Concepts ({questions.length})</option>
          {concepts.map(c => (
            <option key={c} value={c} style={{ background: '#1e293b' }}>{c}</option>
          ))}
        </select>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredQuestions.map((q) => {
            const isSelected = selectedQuestion?.id === q.id;
            const attemptsCount = q.student_attempts?.length || 0;
            const lastAttempt = q.student_attempts?.[0];

            return (
              <div
                key={q.id}
                onClick={() => handleSelectQuestion(q)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  background: isSelected ? 'rgba(var(--accent), 0.2)' : 'var(--card-bg)',
                  border: isSelected ? '1px solid rgba(var(--accent), 0.6)' : '1px solid var(--card-border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-light)', textTransform: 'uppercase' }}>
                    {q.concept}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {q.source === 'ai' ? '🤖 AI' : '👩‍🏫 Teacher'}
                  </span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {q.statement}
                </div>
                {attemptsCount > 0 && (
                  <div style={{ fontSize: 10, marginTop: 6, color: lastAttempt?.is_correct ? '#34d399' : '#f87171' }}>
                    {lastAttempt?.is_correct ? '✓ Solved' : '✗ Weak attempt'} ({attemptsCount} tries)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Area: Interactive Attempt & Evaluation */}
      <div className="glass-panel" style={{ borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
        {selectedQuestion ? (
          <>
            {/* Question Statement */}
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <span className="badge badge-active">{selectedQuestion.concept}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>• {selectedQuestion.subconcept}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  Bloom: {selectedQuestion.bloom_level} | Difficulty: {selectedQuestion.difficulty}
                </span>
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5 }}>
                {selectedQuestion.statement}
              </h2>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {parsedOptions.map((opt: any) => {
                const isChecked = selectedOptionId === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedOptionId(opt.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: isChecked ? 'rgba(var(--accent), 0.15)' : 'var(--card-bg)',
                      border: isChecked ? '1px solid rgba(var(--accent), 0.7)' : '1px solid var(--panel-border)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="mcq_option"
                      checked={isChecked}
                      onChange={() => setSelectedOptionId(opt.id)}
                    />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{opt.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Submit Button */}
            <div>
              <button
                onClick={handleSubmitAttempt}
                disabled={submitting || !selectedOptionId}
                className="btn-primary"
                style={{ padding: '10px 24px', fontSize: 14 }}
              >
                {submitting ? 'Evaluating answer...' : 'Submit Attempt'}
              </button>
            </div>

            {/* Evaluation Result & Transparent Gap Alert */}
            {lastResult && (
              <div
                style={{
                  borderRadius: 12,
                  padding: 16,
                  background: lastResult.evaluation?.is_correct
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                  border: lastResult.evaluation?.is_correct
                    ? '1px solid rgba(16, 185, 129, 0.4)'
                    : '1px solid rgba(239, 68, 68, 0.4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>
                    {lastResult.evaluation?.is_correct ? '🎉' : '⚠️'}
                  </span>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>
                    {lastResult.evaluation?.is_correct
                      ? 'Correct Answer! Marks Awarded: ' + lastResult.evaluation.marks_awarded
                      : 'Incorrect. Learning evidence recorded.'}
                  </div>
                </div>

                {/* Gap Formed Signal */}
                {lastResult.gap_detected?.is_new && (
                  <div style={{ marginTop: 10, fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>
                    ⚡ Note: Repeated incorrect attempts have registered an emerging learning gap in {selectedQuestion.concept}. Your teacher can now run a targeted diagnostic probe.
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a question from the left sidebar to begin practice.
          </div>
        )}
      </div>
    </div>
  );
}
