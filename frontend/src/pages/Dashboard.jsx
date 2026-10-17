import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles, 
  RefreshCw,
  Award,
  BookOpen,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';

export default function Dashboard({ students, selectedStudentId, onSelectStudent, onRefreshStudents }) {
  const { user, role } = useAuth();
  const isStudent = role === 'ROLE_STUDENT';
  const [stats, setStats] = useState({
    total: 0,
    avgMarks: '—',
    atRisk: 0,
    avgAttendance: '—'
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Selected student analysis state
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // AI Recommendation state
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const selectedStudent = students.find(s => s.id === Number(selectedStudentId));

  // Load platform-wide stats
  useEffect(() => {
    if (!students || students.length === 0) {
      setStatsLoading(false);
      return;
    }

    let isMounted = true;
    async function loadStats() {
      setStatsLoading(true);
      try {
        const analyses = await Promise.all(
          students.map(s => api.getStudentAnalysis(s.id).catch(() => null))
        );
        if (!isMounted) return;

        const valid = analyses.filter(Boolean);
        const total = students.length;
        const avgMarks = valid.length
          ? (valid.reduce((sum, a) => sum + (a.averageMarks || 0), 0) / valid.length).toFixed(1)
          : '—';
        const atRisk = valid.filter(a => a.riskLevel === 'HIGH').length;
        const avgAttendance = valid.length
          ? (valid.reduce((sum, a) => sum + (a.averageAttendance || 0), 0) / valid.length).toFixed(1)
          : '—';

        setStats({
          total,
          avgMarks: avgMarks !== '—' ? `${avgMarks}%` : '—',
          atRisk,
          avgAttendance: avgAttendance !== '—' ? `${avgAttendance}%` : '—'
        });
      } catch (err) {
        console.error('Failed to compute stats:', err);
      } finally {
        if (isMounted) setStatsLoading(false);
      }
    }

    loadStats();
    return () => { isMounted = false; };
  }, [students]);

  // Load analysis whenever selected student changes
  useEffect(() => {
    if (!selectedStudentId) {
      setAnalysis(null);
      setAiPlan(null);
      setAnalysisError('');
      setAiError('');
      return;
    }

    let isMounted = true;
    async function fetchAnalysis() {
      setAnalysisLoading(true);
      setAnalysisError('');
      setAiPlan(null);
      setAiError('');
      try {
        const data = await api.getStudentAnalysis(selectedStudentId);
        if (isMounted) setAnalysis(data);
      } catch (err) {
        if (isMounted) setAnalysisError(err.message || 'Could not load analysis');
      } finally {
        if (isMounted) setAnalysisLoading(false);
      }
    }

    fetchAnalysis();
    return () => { isMounted = false; };
  }, [selectedStudentId]);

  async function handleGenerateAi() {
    if (!selectedStudentId) return;
    setAiLoading(true);
    setAiError('');
    try {
      const data = await api.getAiRecommendation(selectedStudentId);
      setAiPlan(data);
    } catch (err) {
      setAiError(err.message || 'AI recommendation failed');
    } finally {
      setAiLoading(false);
    }
  }

  const riskBadgeClass = analysis?.riskLevel ? `risk-badge ${analysis.riskLevel.toUpperCase()}` : 'risk-badge';

  return (
    <div className="dashboard-page">
      {/* Overview Cards */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>{isStudent ? `Welcome, ${selectedStudent?.name || user?.username || 'Learner'}! 👋` : 'Platform Overview'}</h2>
          <p>{isStudent ? 'Here is your real-time academic standing, risk analysis, and personalized AI study advice.' : 'Real-time analytics aggregated from your academic database'}</p>
        </div>
        <button
          onClick={onRefreshStudents}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
          title="Reload records"
        >
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={22} color="var(--primary)" />
          </div>
          <div className="stat-body">
            <div className="stat-label">Total Students</div>
            <div className="stat-value">
              {statsLoading ? <span className="skeleton"></span> : stats.total}
            </div>
            <div className="stat-sub">Enrolled learners</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <BarChart size={22} color="var(--success)" />
          </div>
          <div className="stat-body">
            <div className="stat-label">Avg Performance</div>
            <div className="stat-value">
              {statsLoading ? <span className="skeleton"></span> : stats.avgMarks}
            </div>
            <div className="stat-sub">Across all courses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <AlertTriangle size={22} color="var(--warning)" />
          </div>
          <div className="stat-body">
            <div className="stat-label">At-Risk Students</div>
            <div className="stat-value">
              {statsLoading ? <span className="skeleton"></span> : stats.atRisk}
            </div>
            <div className="stat-sub">High academic risk alert</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <CheckCircle size={22} color="#7c3aed" />
          </div>
          <div className="stat-body">
            <div className="stat-label">Avg Attendance</div>
            <div className="stat-value">
              {statsLoading ? <span className="skeleton"></span> : stats.avgAttendance}
            </div>
            <div className="stat-sub">Classroom presence</div>
          </div>
        </div>
      </div>

      {/* Main Panel Grid */}
      <div className="panel-grid">
        {/* Left: Student Selector */}
        <div className="card selector-panel">
          <div className="card-header">
            <h3>{isStudent ? <GraduationCap size={16} color="var(--primary)" /> : <Users size={16} />} {isStudent ? 'My Academic Profile' : 'Select Student'}</h3>
          </div>
          <div className="card-body">
            {isStudent ? (
              selectedStudent ? (
                <div className="student-mini-card visible" style={{ marginTop: 0 }}>
                  <div className="student-mini-name" style={{ fontSize: '1.1rem' }}>{selectedStudent.name}</div>
                  <div className="student-mini-meta" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span>📚 <strong>Major:</strong> {selectedStudent.course}</span>
                    <span>🎓 <strong>Year:</strong> {selectedStudent.year}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>✉ {selectedStudent.email}</span>
                  </div>
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 10px',
                    background: 'var(--success-bg)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    color: 'var(--success)',
                    fontWeight: '600'
                  }}>
                    🔒 Privacy Active: Verified Student Record
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading student profile...</p>
              )
            ) : (
              <>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Choose a student to inspect
                </label>
                <div className="select-wrapper">
                  <select
                    value={selectedStudentId || ''}
                    onChange={e => onSelectStudent(e.target.value)}
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
          </div>
        </div>

        {/* Right: Analytics & AI */}
        <div className="card analytics-panel">
          <div className="card-header">
            <h3><BarChart size={16} /> Performance & Risk Breakdown</h3>
            {analysis && (
              <span className={riskBadgeClass}>
                {analysis.riskLevel} RISK
              </span>
            )}
          </div>
          <div className="card-body">
            {!selectedStudentId ? (
              <div className="analytics-placeholder">
                <div className="placeholder-icon">📊</div>
                <p>Select a student from the dropdown on the left to view detailed metrics and generate tailored AI study recommendations.</p>
              </div>
            ) : analysisLoading ? (
              <div className="analytics-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div className="spinner"></div>
                <span>Analyzing student academic performance…</span>
              </div>
            ) : analysisError ? (
              <div className="error-box">
                {analysisError}
              </div>
            ) : analysis ? (
              <div>
                <div className="metrics-row">
                  <div className="metric-box">
                    <div className="metric-val">{analysis.averageMarks?.toFixed(1)}%</div>
                    <div className="metric-lbl">Average Marks</div>
                  </div>
                  <div className="metric-box">
                    <div className="metric-val">{analysis.averageAttendance?.toFixed(1)}%</div>
                    <div className="metric-lbl">Attendance Rate</div>
                  </div>
                  <div className="metric-box">
                    <div className="metric-val">{analysis.totalSubjects || 0}</div>
                    <div className="metric-lbl">Subjects Tested</div>
                  </div>
                </div>

                <div className="analytics-section">
                  <div className="analytics-section-title">Academic Progress</div>
                  <div className="progress-row">
                    <div className="progress-label">
                      <span>Overall Marks Mastery</span>
                      <span>{analysis.averageMarks?.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill marks" 
                        style={{ width: `${Math.min(100, analysis.averageMarks || 0)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="progress-row">
                    <div className="progress-label">
                      <span>Classroom Attendance</span>
                      <span>{analysis.averageAttendance?.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill attendance" 
                        style={{ width: `${Math.min(100, analysis.averageAttendance || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="analytics-section">
                  <div className="analytics-section-title">Weak Subject Areas</div>
                  {analysis.weakSubjects && analysis.weakSubjects.length > 0 ? (
                    <div className="weak-subjects-list">
                      {analysis.weakSubjects.map((sub, i) => (
                        <span key={i} className="subject-tag">{sub}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="no-weak">
                      No weak subjects identified! Outstanding performance across all tests.
                    </div>
                  )}
                </div>

                {/* AI Study Plan Section */}
                <div className="ai-section">
                  <div className="ai-generate-bar">
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        AI Study Advisor
                      </h4>
                      <p>
                        Generate tailored study schedules and targeted review strategies powered by Google Gemini AI with automatic rule-based fallback.
                      </p>
                    </div>
                    <button
                      onClick={handleGenerateAi}
                      disabled={aiLoading}
                      className="btn-ai"
                    >
                      {aiLoading ? (
                        <>
                          <div className="spinner" style={{ width: '16px', height: '16px', borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#fff' }}></div>
                          <span>Generating Plan…</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          <span>{aiPlan ? 'Regenerate Study Plan' : 'Generate AI Study Plan'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {aiError && (
                    <div className="error-box" style={{ marginTop: '16px' }}>
                      {aiError}
                    </div>
                  )}

                  {aiPlan && (
                    <div className="ai-plan-card" style={{ marginTop: '20px' }}>
                      <div className="ai-plan-header">
                        <h4>
                          <Sparkles size={16} /> Tailored Academic Recovery Plan
                        </h4>
                        <span className="ai-source-badge">
                          {aiPlan.aiSource ? `✦ ${aiPlan.aiSource}` : 'AI Generated'}
                        </span>
                      </div>
                      <div className="ai-plan-body">
                        <div className="ai-plan-text">
                          {aiPlan.recommendation}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
