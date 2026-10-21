import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Sparkles, 
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import * as api from '../api';

export default function EduBotWidget({ onNavigateToFullPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'w-init',
      role: 'model',
      text: "Hi! I'm **EduBot**. Ask me any doubt about your coursework or syllabus!",
      aiSource: 'Google Gemini'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  async function handleSend() {
    const query = input.trim();
    if (!query || loading) return;

    const userMsg = {
      id: `w-u-${Date.now()}`,
      role: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages
        .filter(m => m.id !== 'w-init')
        .slice(-4)
        .map(m => ({ role: m.role, text: m.text }));

      const res = await api.askEduBot(query, 'General Academic', historyPayload);
      setMessages(prev => [...prev, {
        id: `w-m-${Date.now()}`,
        role: 'model',
        text: res.reply,
        aiSource: res.aiSource
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `w-err-${Date.now()}`,
        role: 'model',
        text: "⚠️ Couldn't connect to EduBot right now. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            fontWeight: '600',
            fontSize: '0.88rem'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
          title="Ask EduBot AI Tutor"
        >
          <div style={{ position: 'relative' }}>
            <Bot size={22} />
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              border: '2px solid #fff'
            }} />
          </div>
          <span>Ask EduBot</span>
          <Sparkles size={14} color="#fef08a" />
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: '380px',
          height: '520px',
          background: 'var(--card-bg)',
          borderRadius: '20px',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.22), 0 0 0 1px var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#fff',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  EduBot Tutor
                  <span style={{
                    fontSize: '0.65rem',
                    background: 'rgba(255,255,255,0.25)',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>AI</span>
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                  Online • Powered by Gemini
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {onNavigateToFullPage && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onNavigateToFullPage();
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '6px'
                  }}
                  title="Open full page tutor"
                >
                  <ExternalLink size={16} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: 'var(--bg)'
          }}>
            {messages.map(msg => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%'
                  }}
                >
                  <div style={{
                    background: isUser ? 'var(--primary)' : 'var(--card-bg)',
                    color: isUser ? '#fff' : 'var(--text-primary)',
                    padding: '10px 14px',
                    borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                    border: isUser ? 'none' : '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                padding: '8px 12px',
                borderRadius: '4px 14px 14px 14px',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Sparkles size={14} className="animate-spin" color="var(--primary)" />
                <span>EduBot is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Pill Bar */}
          <div style={{
            padding: '6px 12px',
            background: 'var(--card-bg)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            {[
              "Explain Dijkstra",
              "What is 3NF?",
              "Overfitting in ML"
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(p);
                }}
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div style={{
            padding: '10px 12px',
            background: 'var(--card-bg)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a coursework doubt..."
              style={{
                flex: 1,
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.82rem',
                background: 'var(--bg)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading ? 'var(--primary)' : 'var(--border)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed'
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
