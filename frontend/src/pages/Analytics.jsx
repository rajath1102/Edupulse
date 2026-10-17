import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  BookOpen, 
  Clock,
  GraduationCap
} from 'lucide-react';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Analytics({ students, selectedStudentId, onSelectStudent }) {
  const { role } = useAuth();
  const isStudent = role === 'ROLE_STUDENT';
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [performances, setPerformances] = useState([]);

  const selectedStudent = students.find(s => s.id === Number(selectedStudentId));

  useEffect(() => {
    if (!selectedStudentId) {
      setAnalysis(null);
      setPerformances([]);
      return;
    }

    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [analysisData, perfData] = await Promise.all([
          api.getStudentAnalysis(selectedStudentId),
          api.getPerformanceByStudentId(selectedStudentId).catch(() => [])
        ]);
        if (isMounted) {
          setAnalysis(analysisData);
          setPerformances(perfData || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load student analytics');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [selectedStudentId]);

  const riskClass = analysis?.riskLevel ? `risk-badge ${analysis.riskLevel.toUpperCase()}` : 'risk-badge';

  return (
    <div className="analytics-page">
      <div className="section-header">
        <h2>Student Risk & Performance Analytics</h2>
        <p>In-depth metric breakdowns and early warning signals for student success</p>
      </div>

      <div className="panel-grid">
        {/* Left: Selector */}
        <div className="card selector-panel">
          <div className="card-header">
            <h3>{isStudent ? <GraduationCap size={16} /> : <Users size={16} />} {isStudent ? 'My Analytics' : 'Choose Student'}</h3>
          </div>
          <div className="card-body">
            {isStudent ? (
              /* STUDENT: Show locked profile card */
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
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px', lineHeight: '1.5' }}>
                      You are viewing your own academic performance. Contact your teacher for help.
                    </p>
                  </div>
                );
              })()
            ) : (
              /* TEACHER / ADMIN: Full dropdown */
              <>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Select student record
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


        {/* Right: Analytics details */}
        <div className="card analytics-panel">
          <div className="card-header">
            <h3><BarChart3 size={16} /> Diagnostic Overview</h3>
            {analysis && (
              <span className={riskClass}>
                {analysis.riskLevel} RISK
              </span>
            )}
          </div>
          <div className="card-body">
            {!selectedStudentId ? (
              <div className="analytics-placeholder">
                <div className="placeholder-icon">📈</div>
                <p>Select a student from the dropdown to examine risk calculations and subject metrics.</p>
              </div>
            ) : loading ? (
              <div className="analytics-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div className="spinner"></div>
                <span>Computing diagnostics…</span>
              </div>
            ) : error ? (
              <div className="error-box">{error}</div>
            ) : analysis ? (
              <div>
                <div className="metrics-row">
                  <div className="metric-box">
                    <div className="metric-val">{analysis.averageMarks?.toFixed(1)}%</div>
                    <div className="metric-lbl">Average Score</div>
                  </div>
                  <div className="metric-box">
                    <div className="metric-val">{analysis.averageAttendance?.toFixed(1)}%</div>
                    <div className="metric-lbl">Attendance Rate</div>
                  </div>
                  <div className="metric-box">
                    <div className="metric-val">{analysis.totalSubjects || 0}</div>
                    <div className="metric-lbl">Courses Tracked</div>
                  </div>
                </div>

                <div className="analytics-section">
                  <div className="analytics-section-title">Academic Health Index</div>
                  <div className="progress-row">
                    <div className="progress-label">
                      <span>Cumulative Score Mastery</span>
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
                      <span>Classroom Attendance Compliance</span>
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

                {/* Subject Records Table */}
                <div className="analytics-section">
                  <div className="analytics-section-title">Subject Breakdown & Grades</div>
                  {performances.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No individual subject marks recorded yet for this student.</p>
                  ) : (
                    <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                      <table className="students-table">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Marks Scored</th>
                            <th>Attendance</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {performances.map((p, idx) => (
                            <tr key={p.id || idx}>
                              <td><strong>{p.subject}</strong></td>
                              <td>
                                <span style={{
                                  fontWeight: '700',
                                  color: p.marks < 60 ? 'var(--danger)' : (p.marks < 75 ? 'var(--warning)' : 'var(--success)')
                                }}>
                                  {p.marks}%
                                </span>
                              </td>
                              <td>{p.attendance}%</td>
                              <td>
                                {p.marks < 60 ? (
                                  <span className="risk-badge HIGH" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>Needs Focus</span>
                                ) : (
                                  <span className="risk-badge LOW" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>Satisfactory</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="analytics-section">
                  <div className="analytics-section-title">Identified Weak Areas</div>
                  {analysis.weakSubjects && analysis.weakSubjects.length > 0 ? (
                    <div className="weak-subjects-list">
                      {analysis.weakSubjects.map((sub, i) => (
                        <span key={i} className="subject-tag">{sub}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="no-weak">
                      No weak subjects identified! All tracked subjects are currently in good standing.
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
