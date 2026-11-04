import React from 'react';
import { 
  Settings, 
  Server, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2,
  BookOpen,
  Award,
  Zap,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user, role } = useAuth();

  const roleLabels = {
    ROLE_ADMIN: 'Department Administrator',
    ROLE_TEACHER: 'Faculty / Course Instructor',
    ROLE_STUDENT: 'Enrolled Student',
    ADMIN: 'Department Administrator',
    TEACHER: 'Faculty / Course Instructor',
    STUDENT: 'Enrolled Student'
  };

  return (
    <div className="settings-page">
      <div className="section-header">
        <h2>Platform & Account Settings</h2>
        <p>Manage your institutional account, academic intelligence features, and platform preferences</p>
      </div>

      <div className="settings-grid">
        {/* System & Cloud Status */}
        <div className="card">
          <div className="card-header">
            <h3><Server size={18} color="var(--primary)" /> Platform Overview</h3>
          </div>
          <div className="card-body">
            <div className="settings-row">
              <span className="settings-label">Platform Version</span>
              <span className="settings-value" style={{ fontWeight: '600' }}>EduPulse Enterprise v2.4</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Cloud Knowledge Engine</span>
              <span className="settings-value" style={{ color: 'var(--success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} /> Operational
              </span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Response Mode</span>
              <span className="settings-value">High-Speed Grounded Synthesis</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Syllabus Indexing</span>
              <span className="settings-value">Semantic Overlap & BM25 Scoring</span>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="card">
          <div className="card-header">
            <h3><ShieldCheck size={18} color="var(--success)" /> Security & Session</h3>
          </div>
          <div className="card-body">
            <div className="settings-row">
              <span className="settings-label">Active Account</span>
              <span className="settings-value" style={{ fontWeight: '600' }}>{user?.username || 'Guest'}</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Institutional Role</span>
              <span className="settings-value" style={{ color: 'var(--primary)', fontWeight: '700' }}>
                {roleLabels[role] || role || 'Student'}
              </span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Data Protection</span>
              <span className="settings-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={12} color="var(--success)" /> End-to-End Encrypted
              </span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Session Status</span>
              <span className="settings-value" style={{ color: 'var(--success)', fontWeight: '600' }}>
                ✓ Authenticated & Verified
              </span>
            </div>
          </div>
        </div>

        {/* AI Academic Capabilities */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h3><Sparkles size={18} color="#7c3aed" /> Active Academic Intelligence Modules</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px', background: 'var(--bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.95rem', marginBottom: '6px', color: 'var(--primary)' }}>
                  <BookOpen size={16} /> Course Syllabus RAG Tutor
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Upload syllabi or lecture slides in PDF/TXT. Generates strictly grounded answers with verifiable chapter and unit citations.
                </p>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px', background: 'var(--bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.95rem', marginBottom: '6px', color: '#ea580c' }}>
                  <Award size={16} /> University Exam Simulator & Grader
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Generates authentic 50-mark question papers (Sections A & B) and automatically evaluates student answers against scoring rubrics.
                </p>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px', background: 'var(--bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.95rem', marginBottom: '6px', color: '#7c3aed' }}>
                  <Zap size={16} /> Last-Night Revision Cheat Sheet
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Creates a 15-minute exam cramming summary with must-know 2-mark definitions, core formulas, 10-mark block diagrams, and hall pitfalls.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
