import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SECTION_TITLES = {
  'dashboard':    '📊 Academic Dashboard',
  'edubot':       '💬 EduBot AI Tutor & Doubt Solver',
  'syllabus-rag': '📚 Course Syllabus & Notes Tutor',
  'mock-exam':    '🎯 University Mock Exams & AI Grader',
  'students':     '👥 Student Directory & Records',
  'analytics':    '📈 Performance & Risk Analytics',
  'ai-scanner':   '📷 Exam Score Sheet Scanner',
  'ai-advisor':   '✦ Personalized Study Advisor',
  'settings':     '⚙ Platform Settings'
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

  const roleLabels = {
    ADMIN: 'Administrator',
    TEACHER: 'Faculty / Professor',
    STUDENT: 'Student',
    GUEST: 'Guest'
  };

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
        {/* User Persona Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            Viewing as:
          </span>
          <select
            value={user?.username || roleName.toLowerCase()}
            onChange={(e) => quickLogin(e.target.value)}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: 'var(--bg)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
            title="Switch portal view"
          >
            <optgroup label="Faculty & Administration">
              <option value="teacher">Faculty (Professor)</option>
              <option value="admin">Administrator (Dept. Head)</option>
            </optgroup>
            <optgroup label="Student Accounts">
              <option value="student">Student: John Doe</option>
              <option value="jane">Student: Jane Smith</option>
              <option value="alex">Student: Alex Rivera</option>
            </optgroup>
          </select>
        </div>

        {/* Current Role Badge */}
        <span
          className="badge-api"
          style={{
            background: badgeStyle.bg,
            color: badgeStyle.text,
            borderColor: badgeStyle.border,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontWeight: '600',
            fontSize: '0.75rem'
          }}
        >
          <ShieldCheck size={13} />
          {roleLabels[roleName] || roleName}
        </span>

        {/* Live System Status */}
        <span className="badge-api" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 6px var(--success)' }}></span>
          System Online
        </span>

        {/* Clock */}
        <span className="topbar-time" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
          <Clock size={12} />
          {time}
        </span>
      </div>
    </header>
  );
}
