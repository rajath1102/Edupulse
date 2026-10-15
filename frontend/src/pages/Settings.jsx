import React from 'react';
import { 
  Settings, 
  Server, 
  Key, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  Cloud,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user, role } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || 'Local Spring Boot Proxy (http://localhost:8080)';

  return (
    <div className="settings-page">
      <div className="section-header">
        <h2>Deployment & Cloud Settings</h2>
        <p>Review system parameters, API connection status, and cloud environment configuration</p>
      </div>

      <div className="settings-grid">
        {/* Backend & Database */}
        <div className="card">
          <div className="card-header">
            <h3><Server size={16} color="var(--primary)" /> Backend & Database</h3>
          </div>
          <div className="card-body">
            <div className="settings-row">
              <span className="settings-label">Backend URL</span>
              <code className="settings-value">{apiUrl}</code>
            </div>
            <div className="settings-row">
              <span className="settings-label">Database Type</span>
              <span className="settings-value">MySQL 8.0</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Spring Boot Version</span>
              <span className="settings-value">3.3.4 (Java 17)</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">API Endpoints</span>
              <span className="settings-value" style={{ color: 'var(--success)' }}>✓ Operational</span>
            </div>
          </div>
        </div>

        {/* Security & Authentication */}
        <div className="card">
          <div className="card-header">
            <h3><ShieldCheck size={16} color="var(--success)" /> Security & RBAC</h3>
          </div>
          <div className="card-body">
            <div className="settings-row">
              <span className="settings-label">Authentication Type</span>
              <span className="settings-value">Stateless JWT (HMAC-SHA256)</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Token Expiration</span>
              <span className="settings-value">24 Hours (86,400,000 ms)</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Active User</span>
              <span className="settings-value">{user?.username || 'Guest'}</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Granted Role</span>
              <span className="settings-value" style={{ color: 'var(--primary)', fontWeight: '700' }}>
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Gemini AI Configuration */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h3><Sparkles size={16} color="#7c3aed" /> Google Gemini AI Integration Guide</h3>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              EduPulse seamlessly integrates with Google Gemini (via <code>gemini-1.5-flash</code>). If the key is not set, the platform uses an intelligent academic rule-based fallback so learning operations never stall.
            </p>

            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
                How to enable Live Gemini AI in 2 simple steps:
              </h4>
              <ol style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                <li>
                  Get a free API Key from{' '}
                  <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'underline' }}>
                    Google AI Studio <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                  </a>.
                </li>
                <li>
                  Set the environment variable on your server or in your terminal:
                  <div style={{ margin: '8px 0' }}>
                    <code className="settings-value" style={{ display: 'block', padding: '8px 12px' }}>
                      $env:GEMINI_API_KEY="your_api_key_here"
                    </code>
                  </div>
                  In production (e.g. Render / Railway), add <code>GEMINI_API_KEY</code> under <strong>Environment Variables</strong>.
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Vercel Frontend Deployment Guide */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h3><Cloud size={16} color="var(--accent)" /> Production Deployment Checklist</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '6px', color: 'var(--primary)' }}>
                  1. Deploy Backend (Render / Railway)
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Use the included multi-stage <code>Dockerfile</code>. Connect your MySQL database by configuring <code>SPRING_DATASOURCE_URL</code>, <code>SPRING_DATASOURCE_USERNAME</code>, and <code>SPRING_DATASOURCE_PASSWORD</code>.
                </p>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '6px', color: 'var(--primary)' }}>
                  2. Deploy Frontend (Vercel)
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Import this repository in Vercel. Set Root Directory to <code>frontend</code>, framework to <strong>Vite</strong>, and add <code>VITE_API_URL</code> pointing to your deployed backend URL.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
