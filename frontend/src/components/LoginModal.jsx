import React, { useState } from 'react';
import { X, Lock, User, Mail, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ isOpen, onClose }) {
  const { login, register, quickLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [course, setCourse] = useState('Computer Science');
  const [year, setYear] = useState(1);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          username,
          email,
          password,
          name,
          course,
          year: Number(year)
        });
        setSuccess('Account created successfully! Logged in.');
      } else {
        await login(username, password);
        setSuccess('Logged in successfully!');
      }
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(role) {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await quickLogin(role);
      setSuccess(`Signed in as ${role.toUpperCase()}!`);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        width: '100%',
        maxWidth: '440px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, var(--surface), var(--bg))'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {isRegister ? 'Create Student Account' : 'Sign in to EduPulse'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isRegister ? 'Register as a student to track your progress' : 'Secure JWT Authentication'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Quick Demo Logins */}
          <div style={{
            background: 'var(--bg)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            marginBottom: '20px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Quick 1-Click Demo Logins:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('teacher')}
                style={{
                  padding: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  borderRadius: '6px',
                  border: '1px solid #c7d2fe',
                  background: '#e0e7ff',
                  color: '#4338ca',
                  cursor: 'pointer'
                }}
              >
                Teacher
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('admin')}
                style={{
                  padding: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  borderRadius: '6px',
                  border: '1px solid #fde68a',
                  background: '#fef3c7',
                  color: '#92400e',
                  cursor: 'pointer'
                }}
              >
                Admin
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin('student')}
                style={{
                  padding: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  borderRadius: '6px',
                  border: '1px solid #bbf7d0',
                  background: '#dcfce7',
                  color: '#166534',
                  cursor: 'pointer'
                }}
              >
                Student
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              border: '1px solid #fca5a5',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} flexShrink={0} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              background: 'var(--success-bg)',
              color: 'var(--success)',
              border: '1px solid #86efac',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={16} flexShrink={0} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {isRegister && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                      Course
                    </label>
                    <input
                      type="text"
                      required
                      value={course}
                      onChange={e => setCourse(e.target.value)}
                      placeholder="Computer Science"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                      Year
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      required
                      value={year}
                      onChange={e => setYear(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                {isRegister ? 'Choose Username' : 'Username or Email'}
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Processing…' : (isRegister ? 'Register as Student' : 'Sign In')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccess('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.825rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register as Student"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
