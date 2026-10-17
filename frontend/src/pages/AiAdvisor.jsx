import React, { useState } from 'react';
import { 
  Sparkles, 
  Users, 
  BookOpen, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle,
  Cpu,
  GraduationCap
} from 'lucide-react';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';

export default function AiAdvisor({ students, selectedStudentId, onSelectStudent }) {
  const { role } = useAuth();
  const isStudent = role === 'ROLE_STUDENT';
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState('');

  const selectedStudent = students.find(s => s.id === Number(selectedStudentId));

  async function handleGeneratePlan() {
    if (!selectedStudentId) {
      setError('Please choose a student from the dropdown first.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await api.getAiRecommendation(selectedStudentId);
      setRecommendation(data);
    } catch (err) {
      setError(err.message || 'Failed to generate AI study plan.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-advisor-page">
      <div className="section-header">
        <h2>✦ AI Personalized Study Plan Advisor</h2>
        <p>AI-driven academic guidance powered by Google Gemini with rule-based fallback</p>
      </div>

      <div className="panel-grid">
        {/* Left: Student Selector */}
        <div className="card selector-panel">
          <div className="card-header">
            <h3>{isStudent ? <GraduationCap size={16} /> : <Users size={16} />} {isStudent ? 'My AI Advisor' : 'Choose Student'}</h3>
          </div>
          <div className="card-body">
            {isStudent ? (
              /* STUDENT: Locked profile card */
              students.length > 0 && (() => {
                const me = students[0];
                return (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: '700', padding: '3px 10px',
                        background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0',
                        borderRadius: '100px', display: 'inline-flex', alignItems: 'center', gap: '4px'
                      }}>
                        🔒 Privacy Active
                      </span>
                    </div>
                    <div className="student-mini-card visible">
                      <div className="student-mini-name">{me.name}</div>
                      <div className="student-mini-meta">
                        <span>📚 {me.course}</span>
                        <span>🎓 Year {me.year}</span>
                        <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ✉ {me.email}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              /* TEACHER / ADMIN: Dropdown */
              <>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Select student
                </label>
                <div className="select-wrapper">
                  <select
                    value={selectedStudentId || ''}
                    onChange={e => {
                      onSelectStudent(e.target.value);
                      setRecommendation(null);
                      setError('');
                    }}
                  >
                    <option value="">— Select a student —</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.course}, Year {s.year})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedStudent && (
                  <div className="student-mini-card visible">
                    <div className="student-mini-name">{selectedStudent.name}</div>
                    <div className="student-mini-meta">
                      <span>📚 {selectedStudent.course}</span>
                      <span>🎓 Year {selectedStudent.year}</span>
                      <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ✉ {selectedStudent.email}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div style={{ marginTop: '20px' }}>
              <button
                onClick={handleGeneratePlan}
                disabled={loading || !selectedStudentId}
                className="btn-ai"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#fff' }}></div>
                    <span>Consulting AI Engine…</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>{recommendation ? 'Regenerate Study Plan' : 'Generate Study Plan'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: AI Output */}
        <div className="card">
          <div className="card-header">
            <h3><Lightbulb size={16} /> Generated AI Recommendations</h3>
            {recommendation && (
              <span className="ai-source-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: '#c7d2fe' }}>
                Source: {recommendation.aiSource || 'AI Engine'}
              </span>
            )}
          </div>
          <div className="card-body">
            {!selectedStudentId ? (
              <div className="analytics-placeholder">
                <div className="placeholder-icon">✦</div>
                <p>Select a student and click <strong>Generate Study Plan</strong> to run the AI engine.</p>
              </div>
            ) : loading ? (
              <div className="ai-loading">
                <div className="spinner"></div>
                <div>
                  <strong>Generating personalized study plan…</strong>
                  <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: '2px' }}>
                    Analyzing subject weaknesses, attendance ratios, and risk score…
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="error-box">
                {error}
              </div>
            ) : recommendation ? (
              <div>
                <div className="ai-plan-card">
                  <div className="ai-plan-header">
                    <h4>
                      <Sparkles size={16} /> Comprehensive Study & Recovery Roadmap
                    </h4>
                    <span className="ai-source-badge">
                      ✦ {recommendation.aiSource || 'Active AI Model'}
                    </span>
                  </div>
                  <div className="ai-plan-body">
                    <div className="ai-plan-text">
                      {recommendation.recommendation}
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)'
                }}>
                  <strong style={{ color: 'var(--text-primary)' }}>💡 How this works:</strong>
                  <ul style={{ paddingLeft: '20px', marginTop: '6px', lineHeight: '1.6' }}>
                    <li>When <code>GEMINI_API_KEY</code> is set in Spring Boot environment variables, real-time Gemini AI is queried.</li>
                    <li>If the API key is not yet set or external connectivity fails, EduPulse automatically applies the intelligent rule-based academic engine.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="analytics-placeholder">
                <div className="placeholder-icon">✦</div>
                <p>Ready to generate. Click <strong>Generate Study Plan</strong> on the left.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
