import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Sparkles, 
  Settings, 
  GraduationCap, 
  LogOut,
  ShieldCheck,
  UserCheck,
  Scan,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentSection, onSelectSection, onOpenLoginModal }) {
  const { user, role, logout } = useAuth();

  const isStudent = role === 'ROLE_STUDENT';

  const navItems = isStudent ? [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'edubot', label: 'EduBot AI Tutor', icon: Bot },
    { id: 'students', label: 'My Academic Profile', icon: Users },
    { id: 'analytics', label: 'My Analytics', icon: BarChart3 },
    { id: 'ai-advisor', label: 'My AI Study Plan', icon: Sparkles },
    { id: 'settings', label: 'Settings & Cloud', icon: Settings },
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'edubot', label: 'EduBot AI Tutor', icon: Bot },
    { id: 'students', label: 'All Students', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai-scanner', label: 'AI Exam Scanner', icon: Scan },
    { id: 'ai-advisor', label: 'AI Study Advisor', icon: Sparkles },
    { id: 'settings', label: 'Settings & Cloud', icon: Settings },
  ];

  const roleName = role ? role.replace('ROLE_', '') : 'GUEST';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GraduationCap size={28} color="var(--primary)" />
          <h1>EduPulse</h1>
        </div>
        <p>Adaptive Student Intelligence Platform</p>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">
          {isStudent ? 'Student Portal' : 'Navigation'}
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', background: isActive ? 'var(--primary-light)' : 'transparent', textAlign: 'left' }}
            >
              <Icon size={18} className="nav-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User profile / session status */}
      <div className="sidebar-user-section" style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
        {user ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isStudent ? 'var(--success)' : 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }}>
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {user.username}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isStudent ? 'var(--success)' : 'var(--text-muted)', fontWeight: isStudent ? '600' : 'normal' }}>
                    {roleName}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Log out"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={onOpenLoginModal}
                style={{
                  width: '100%',
                  fontSize: '0.75rem',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <UserCheck size={14} /> Switch Account
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenLoginModal}
            style={{
              width: '100%',
              fontSize: '0.8rem',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'var(--primary)',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Sign In / Register
          </button>
        )}
      </div>

      <div className="sidebar-footer">
        <div>
          <span className="status-dot"></span>
          <span>Cloud Intelligence Active</span>
        </div>
      </div>
    </aside>
  );
}
