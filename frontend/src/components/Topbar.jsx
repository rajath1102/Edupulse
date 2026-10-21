import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SECTION_TITLES = {
  'dashboard':  '📊 Student Performance Dashboard',
  'edubot':     '💬 EduBot — AI Syllabus & Doubt Solver',
  'students':   '👥 Student Directory & Records',
  'analytics':  '📈 Academic Risk Analytics',
  'ai-scanner': '📷 AI Exam Answer-Sheet & Marks Scanner',
  'ai-advisor': '✦ AI Study Plan Advisor',
  'settings':   '⚙ Deployment & Cloud Settings'
};

export default function Topbar({ currentSection, onOpenLoginModal }) {
  const { user, role, quickLogin } = useAuth();
  const [time, setTime] = useState('');

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      }));
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const roleName = role ? role.replace('ROLE_', '') : 'GUEST';

  const badgeStyle = {
    ADMIN: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
    TEACHER: { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' },
    STUDENT: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
    GUEST: { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' }
  }[roleName] || { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };

  return (
    <header className="topbar">
      <div className="topbar-title">
        {SECTION_TITLES[currentSection] || 'EduPulse Platform'}
      </div>

      <div className="topbar-meta">
        {/* Quick Demo Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            Demo Role:
          </span>
          <select
            value={user?.username || roleName.toLowerCase()}
            onChange={(e) => quickLogin(e.target.value)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: 'var(--bg)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
            title="Switch demo JWT account instantly"
          >
            <optgroup label="Faculty & Staff">
              <option value="teacher">Teacher (teacher123)</option>
              <option value="admin">Admin (admin123)</option>
            </optgroup>
            <optgroup label="Student Accounts (Privacy Mode)">
              <option value="student">Student: John Doe</option>
              <option value="jane">Student: Jane Smith</option>
              <option value="alex">Student: Alex Rivera</option>
            </optgroup>
          </select>
        </div>

        {/* Current Auth Badge */}
        <span
          className="badge-api"
          style={{
            background: badgeStyle.bg,
            color: badgeStyle.text,
            borderColor: badgeStyle.border,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <ShieldCheck size={12} />
          {roleName}: {user?.username || 'Guest'}
        </span>

        {/* Live API status */}
        <span className="badge-api" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></span>
          Spring Boot Live
        </span>

        {/* Clock */}
        <span className="topbar-time" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} />
          {time}
        </span>
      </div>
    </header>
  );
}
