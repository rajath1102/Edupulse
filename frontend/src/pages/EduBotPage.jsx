import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  BookOpen, 
  HelpCircle, 
  Cpu, 
  RotateCcw,
  Zap
} from 'lucide-react';
import * as api from '../api';

const SUBJECT_OPTIONS = [
  'General Academic',
  'Data Structures & Algorithms',
  'Operating Systems',
  'Database Management (DBMS)',
  'Machine Learning & AI',
  'Computer Networks',
  'Mathematics II'
];

const QUICK_PROMPTS = [
  {
    icon: '🧭',
    title: "Dijkstra's Algorithm",
    prompt: "Explain Dijkstra's shortest path algorithm step-by-step with an example and state its time complexity.",
    subject: 'Data Structures & Algorithms'
  },
  {
    icon: '🧩',
    title: 'Dynamic Programming vs Recursion',
    prompt: 'What is the fundamental difference between Memoization (Top-Down) and Tabulation (Bottom-Up) in DP?',
    subject: 'Data Structures & Algorithms'
  },
  {
    icon: '🗄️',
    title: '3NF vs BCNF Normalization',
    prompt: 'Explain the difference between 3NF and BCNF with a concrete relational database table example.',
    subject: 'Database Management (DBMS)'
  },
  {
    icon: '🤖',
    title: 'Overfitting in Machine Learning',
    prompt: 'What causes overfitting in ML models and what are the top 4 techniques to prevent it?',
    subject: 'Machine Learning & AI'
  },
  {
    icon: '🔒',
    title: 'Deadlock Conditions',
    prompt: 'What are the 4 Coffman conditions required for a Deadlock to occur in an Operating System?',
    subject: 'Operating Systems'
  },
  {
    icon: '📝',
    title: 'Interview Practice Questions',
    prompt: 'Give me 3 high-frequency campus placement technical interview questions with hints for Machine Learning.',
    subject: 'Machine Learning & AI'
  }
];

export default function EduBotPage() {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'model',
      text: "👋 **Hello! I'm EduBot**, your university AI Academic Tutor and Coursework Mentor.\n\nWhether you need an algorithm explained simply, code examples, database concepts, or practice exam questions — ask away! You can also click any of the quick-start topics below.",
      aiSource: 'Google Gemini AI',
      subject: 'General Academic',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('General Academic');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(textToSend = null, subjectToUse = null) {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const currentSubject = subjectToUse || selectedSubject;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query,
      subject: currentSubject,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Prepare history for multi-turn conversational context
    const historyPayload = messages
      .filter(m => m.id !== 'init-1')
      .slice(-6)
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text
      }));

    try {
      const response = await api.askEduBot(query, currentSubject, historyPayload);
      const botMsg = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: response.reply,
        aiSource: response.aiSource || 'Google Gemini 3.8 Flash',
        subject: response.subject || currentSubject,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `⚠️ **Connection notice**: ${err.message || 'Could not fetch live response.'}\n\nPlease verify network connection or try again.`,
        aiSource: 'System Notice',
        subject: currentSubject,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function copyText(id, text) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleResetChat() {
    setMessages([
      {
        id: 'init-reset',
        role: 'model',
        text: "🔄 Chat cleared! What academic concept or problem would you like to explore next?",
        aiSource: 'EduBot',
        subject: selectedSubject,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }

  // Basic markdown formatter for paragraphs, lists, bold, and code snippets
  function formatMarkdown(content) {
    if (!content) return null;

    // Split by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const firstLine = lines[0].trim();
        const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
        const lang = hasLang ? firstLine : '';
        const code = hasLang ? lines.slice(1).join('\n') : lines.join('\n');

        return (
          <div key={idx} style={{
            margin: '12px 0',
            background: '#1e1e2e',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #313244',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace'
          }}>
            {lang && (
              <div style={{
                background: '#181825',
                padding: '4px 12px',
                fontSize: '0.72rem',
                color: '#cdd6f4',
                borderBottom: '1px solid #313244',
                textTransform: 'uppercase',
                fontWeight: '600'
              }}>
                {lang}
              </div>
            )}
            <pre style={{
              margin: 0,
              padding: '12px',
              fontSize: '0.85rem',
              color: '#a6adc8',
              overflowX: 'auto',
              lineHeight: 1.5
            }}>
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Format text lines: headers, bold, bullet points
      const lines = part.split('\n');
      return (
        <div key={idx} style={{ lineHeight: 1.65 }}>
          {lines.map((line, lineIdx) => {
            const trimmed = line.trim();

            if (trimmed.startsWith('### ')) {
              return (
                <h4 key={lineIdx} style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--primary)', margin: '14px 0 6px 0' }}>
                  {trimmed.replace('### ', '')}
                </h4>
              );
            }
            if (trimmed.startsWith('#### ')) {
              return (
                <h5 key={lineIdx} style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', margin: '10px 0 4px 0' }}>
                  {trimmed.replace('#### ', '')}
                </h5>
              );
            }
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              return (
                <div key={lineIdx} style={{ display: 'flex', gap: '8px', margin: '4px 0', paddingLeft: '8px' }}>
                  <span style={{ color: 'var(--primary)' }}>•</span>
                  <span>{renderInline(trimmed.substring(2))}</span>
                </div>
              );
            }
            if (/^\d+\.\s/.test(trimmed)) {
              return (
                <div key={lineIdx} style={{ margin: '4px 0', paddingLeft: '8px' }}>
                  {renderInline(trimmed)}
                </div>
              );
            }
            if (!trimmed) {
              return <div key={lineIdx} style={{ height: '8px' }} />;
            }
            return <p key={lineIdx} style={{ margin: '4px 0' }}>{renderInline(line)}</p>;
          })}
        </div>
      );
    });
  }

  function renderInline(text) {
    // Replace **bold** and `code`
    const tokens = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return tokens.map((token, i) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code key={i} style={{
            background: 'var(--bg)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.85em',
            fontFamily: 'Consolas, monospace',
            color: 'var(--primary)',
            border: '1px solid var(--border)'
          }}>
            {token.slice(1, -1)}
          </code>
        );
      }
      return token;
    });
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        color: '#fff',
        padding: '20px 24px',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(79, 70, 229, 0.18)',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 12px rgba(255,255,255,0.2)'
          }}>
            <Bot size={28} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>EduBot AI Tutor</h2>
              <span style={{
                background: 'rgba(255, 255, 255, 0.22)',
                padding: '2px 10px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={12} /> Google Gemini 3.8 Flash
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
              Instant conceptual explanations, code derivations, and placement interview practice
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          title="Reset conversation"
        >
          <RotateCcw size={14} /> Clear Chat
        </button>
      </div>

      {/* Subject Selector Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '10px'
      }}>
        <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          Subject Focus:
        </span>
        {SUBJECT_OPTIONS.map(sub => {
          const isSelected = selectedSubject === sub;
          return (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: isSelected ? 'var(--primary)' : 'var(--card-bg)',
                color: isSelected ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {sub}
            </button>
          );
        })}
      </div>

      {/* Chat Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '100%'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                maxWidth: isUser ? '80%' : '88%',
                flexDirection: isUser ? 'row-reverse' : 'row'
              }}>
                {/* Avatar */}
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: isUser ? 'var(--primary)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {isUser ? 'You' : <Bot size={18} />}
                </div>

                {/* Message Bubble */}
                <div style={{
                  background: isUser ? 'var(--primary)' : 'var(--bg)',
                  color: isUser ? '#fff' : 'var(--text-primary)',
                  padding: '14px 18px',
                  borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  border: isUser ? 'none' : '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6
                }}>
                  {isUser ? (
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                  ) : (
                    <div>{formatMarkdown(msg.text)}</div>
                  )}

                  {/* Metadata & Actions */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    paddingTop: '6px',
                    borderTop: isUser ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border)',
                    fontSize: '0.72rem',
                    color: isUser ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
                    gap: '12px'
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {!isUser && <Zap size={11} color="var(--primary)" />}
                      {msg.aiSource || 'EduBot'} • {msg.timestamp}
                    </span>

                    {!isUser && (
                      <button
                        onClick={() => copyText(msg.id, msg.text)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.7rem'
                        }}
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check size={12} color="var(--success)" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', alignSelf: 'flex-start' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={18} />
            </div>
            <div style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              padding: '12px 18px',
              borderRadius: '4px 16px 16px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.85rem'
            }}>
              <Sparkles size={16} className="animate-spin" color="var(--primary)" />
              <span>EduBot is analyzing & formulating explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div style={{
        margin: '10px 0 6px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>
          💡 Try Asking:
        </span>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedSubject(qp.subject);
              handleSend(qp.prompt, qp.subject);
            }}
            disabled={loading}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              padding: '4px 10px',
              borderRadius: '14px',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <span>{qp.icon}</span>
            <span>{qp.title}</span>
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '8px 12px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask EduBot anything about ${selectedSubject}... (Press Enter to send, Shift+Enter for newline)`}
          rows={1}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            resize: 'none',
            outline: 'none',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            color: 'var(--text-primary)',
            maxHeight: '120px',
            fontFamily: 'inherit'
          }}
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          style={{
            background: input.trim() && !loading ? 'var(--primary)' : 'var(--border)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s ease',
            flexShrink: 0
          }}
          title="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
