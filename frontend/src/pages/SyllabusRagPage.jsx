import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  Sparkles, 
  BookOpen, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Layers, 
  Quote, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  FileCode,
  ArrowRight
} from 'lucide-react';
import * as api from '../api';

const QUICK_QUESTIONS = [
  'What are the core topics and likely 10-mark exam questions in Unit 2?',
  'Explain 3NF vs BCNF according to the syllabus requirements and derivations.',
  'What are the mandatory textbook definitions and formulas required for Unit 1?',
  'List all topics under Transactions and Concurrency Control with their learning objectives.'
];

export default function SyllabusRagPage() {
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState('');
  
  // Upload State
  const [uploadTab, setUploadTab] = useState('paste'); // 'paste' | 'file'
  const [docTitle, setDocTitle] = useState('');
  const [docSubject, setDocSubject] = useState('Database Management (DBMS)');
  const [pastedText, setPastedText] = useState('');
  const [fileObject, setFileObject] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Q&A / RAG State
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [ragResult, setRagResult] = useState(null);
  const [ragError, setRagError] = useState('');
  const [showChunks, setShowChunks] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    setLoadingDocs(true);
    try {
      const data = await api.getAllSyllabusDocuments();
      setDocuments(data || []);
      if (data && data.length > 0 && !selectedDocId) {
        setSelectedDocId(data[0].id.toString());
      }
    } catch (err) {
      console.warn('Failed to load syllabus documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setFileObject(file);
      if (!docTitle) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!docTitle.trim()) {
      setUploadError('Please provide a document title.');
      return;
    }

    setUploading(true);
    try {
      let payload = {
        title: docTitle.trim(),
        subject: docSubject.trim()
      };

      if (uploadTab === 'paste') {
        if (!pastedText.trim()) {
          setUploadError('Please paste your syllabus text or lecture notes.');
          setUploading(false);
          return;
        }
        payload.rawText = pastedText.trim();
        payload.fileType = 'TEXT';
        payload.fileName = `${docTitle.trim().toLowerCase().replace(/\s+/g, '_')}.txt`;
      } else {
        if (!fileObject) {
          setUploadError('Please select a file to upload.');
          setUploading(false);
          return;
        }

        const isPdf = fileObject.type === 'application/pdf' || fileObject.name.toLowerCase().endsWith('.pdf');
        const base64 = await toBase64(fileObject);
        payload.base64Content = base64;
        payload.fileName = fileObject.name;
        payload.fileType = isPdf ? 'PDF' : 'TEXT';
      }

      const res = await api.uploadSyllabusDocument(payload);
      setUploadSuccess(`Successfully indexed "${res.title}" into ${res.chunkCount} grounded chunks!`);
      setDocTitle('');
      setPastedText('');
      setFileObject(null);
      await loadDocuments();
      setSelectedDocId(res.id.toString());
    } catch (err) {
      setUploadError(err.message || 'Failed to upload and index document.');
    } finally {
      setUploading(false);
    }
  }

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  async function handleDeleteDoc(id, title) {
    if (!window.confirm(`Delete syllabus document "${title}"?`)) return;
    try {
      await api.deleteSyllabusDocument(id);
      if (selectedDocId === id.toString()) {
        setSelectedDocId('');
      }
      await loadDocuments();
    } catch (err) {
      alert(err.message || 'Failed to delete document.');
    }
  }

  async function handleAskQuestion(queryToAsk = null) {
    const q = (queryToAsk || question).trim();
    if (!q || asking) return;

    setAsking(true);
    setRagError('');
    setRagResult(null);

    try {
      const payload = {
        question: q,
        documentId: selectedDocId ? parseInt(selectedDocId) : null,
        subject: docSubject
      };

      const res = await api.querySyllabusRAG(payload);
      setRagResult(res);
      setQuestion(q);
    } catch (err) {
      setRagError(err.message || 'Failed to query syllabus knowledge engine.');
    } finally {
      setAsking(false);
    }
  }

  function handleCopyAnswer() {
    if (!ragResult || !ragResult.answer) return;
    navigator.clipboard.writeText(ragResult.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="page-container" style={{ padding: '24px 32px', maxWidth: '1300px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '8px', borderRadius: '10px' }}>
              <Layers size={24} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Syllabus & Lecture Notes "RAG" Tutor
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Upload university syllabi or lecture slides to get strictly grounded answers with citations.
          </p>
        </div>

        <span style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          color: '#10b981', 
          fontSize: '0.75rem', 
          fontWeight: '700', 
          padding: '6px 12px', 
          borderRadius: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px' 
        }}>
          <Sparkles size={14} /> Semantic RAG Active
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 420px) 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Upload & Document Library */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Upload Card */}
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={18} color="var(--primary)" /> Ingest Course Syllabus / Notes
            </h3>

            {uploadSuccess && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.85rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> {uploadSuccess}
              </div>
            )}

            {uploadError && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.85rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {uploadError}
              </div>
            )}

            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Document Title
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. VTU CS301 DBMS Unit 1-4 Syllabus"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Subject
                </label>
                <select 
                  value={docSubject}
                  onChange={e => setDocSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                >
                  <option value="Database Management (DBMS)">Database Management (DBMS)</option>
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Computer Networks">Computer Networks</option>
                  <option value="Machine Learning & AI">Machine Learning & AI</option>
                  <option value="Mathematics II">Mathematics II</option>
                  <option value="Software Engineering">Software Engineering</option>
                </select>
              </div>

              {/* Mode Toggle */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <button
                  type="button"
                  onClick={() => setUploadTab('paste')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: uploadTab === 'paste' ? 'var(--primary)' : 'var(--bg)',
                    color: uploadTab === 'paste' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  📋 Paste Text / Units
                </button>
                <button
                  type="button"
                  onClick={() => setUploadTab('file')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: uploadTab === 'file' ? 'var(--primary)' : 'var(--bg)',
                    color: uploadTab === 'file' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  📄 Upload PDF / File
                </button>
              </div>

              {uploadTab === 'paste' ? (
                <div style={{ marginBottom: '16px' }}>
                  <textarea 
                    placeholder="Paste your course outline, unit contents, lecture notes, or VTU curriculum here..."
                    rows={6}
                    value={pastedText}
                    onChange={e => setPastedText(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'monospace' }}
                  />
                </div>
              ) : (
                <div style={{ marginBottom: '16px' }}>
                  <label 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: '24px 16px', 
                      borderRadius: '8px', 
                      border: '2px dashed var(--border)', 
                      cursor: 'pointer', 
                      background: 'var(--bg)',
                      textAlign: 'center'
                    }}
                  >
                    <FileText size={32} color="var(--primary)" style={{ marginBottom: '8px' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {fileObject ? fileObject.name : 'Click to select syllabus PDF or TXT'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      PDF, TXT, or Markdown (Max 10MB)
                    </span>
                    <input 
                      type="file" 
                      accept=".pdf,.txt,.md" 
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              )}

              <button 
                type="submit" 
                disabled={uploading}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: uploading ? 'not-allowed' : 'pointer' }}
              >
                {uploading ? (
                  <>Processing & Chunking Semantic Index...</>
                ) : (
                  <>
                    <Upload size={16} /> Index Document into RAG
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Document Library Card */}
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span><BookOpen size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Grounded Library</span>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {documents.length} Indexed
              </span>
            </h3>

            {loadingDocs ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading syllabus index...</p>
            ) : documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                No documents uploaded yet. Upload a syllabus or ask a question to use the seeded university standard curriculum.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
                {documents.map(doc => (
                  <div 
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id.toString())}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: selectedDocId === doc.id.toString() ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: selectedDocId === doc.id.toString() ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {doc.title}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc.id, doc.title); }}
                        title="Delete Document"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                        {doc.subject}
                      </span>
                      <span>• {doc.chunkCount} chunks</span>
                      <span>• {doc.fileType}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Grounded Q&A Interface */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Query Box Card */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
              Ask Questions Grounded in Syllabus
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
              EduBot searches the indexed passages and provides strict, university-compliant explanations citing the specific unit.
            </p>

            {/* Quick Prompts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskQuestion(q)}
                  disabled={asking}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  ⚡ {q}
                </button>
              ))}
            </div>

            {/* Input & Search */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text"
                placeholder="Ask about any Unit, theorem, exam weightage, algorithm, or syllabus requirement..."
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAskQuestion(); }}
                disabled={asking}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
              <button
                onClick={() => handleAskQuestion()}
                disabled={asking || !question.trim()}
                className="btn-primary"
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: (asking || !question.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {asking ? (
                  <>Searching & Grounding...</>
                ) : (
                  <>
                    <Search size={16} /> Ask Syllabus
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {ragError && (
            <div style={{ padding: '14px 18px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} />
              <span>{ragError}</span>
            </div>
          )}

          {/* RAG Results View */}
          {ragResult && (
            <div className="card" style={{ padding: '28px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              
              {/* Result Meta Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', marginBottom: '4px' }}>
                    {ragResult.subject} • {ragResult.documentTitle}
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    {ragResult.question}
                  </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={handleCopyAnswer}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '6px 10px', borderRadius: '6px', fontWeight: '600' }}>
                    {ragResult.aiSource}
                  </span>
                </div>
              </div>

              {/* Citations Pills */}
              {ragResult.citations && ragResult.citations.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Verified Syllabus Citations:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {ragResult.citations.map((cite, i) => (
                      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', background: 'var(--bg)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                        <Quote size={12} color="var(--primary)" /> {cite}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Grounded AI Answer */}
              <div 
                style={{ 
                  fontSize: '0.95rem', 
                  lineHeight: '1.7', 
                  color: 'var(--text-primary)', 
                  whiteSpace: 'pre-wrap', 
                  background: 'var(--bg)', 
                  padding: '20px', 
                  borderRadius: '10px', 
                  border: '1px solid var(--border)',
                  marginBottom: '20px'
                }}
              >
                {ragResult.answer}
              </div>

              {/* Retrieved Chunks Collapsible */}
              {ragResult.retrievedChunks && ragResult.retrievedChunks.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <button
                    onClick={() => setShowChunks(!showChunks)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px 0',
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      fontWeight: '700'
                    }}
                  >
                    <span>🔍 View {ragResult.retrievedChunks.length} Raw Retrieved Excerpts used for Grounding</span>
                    {showChunks ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showChunks && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                      {ragResult.retrievedChunks.map((chunk, idx) => (
                        <div 
                          key={idx}
                          style={{
                            padding: '14px',
                            borderRadius: '8px',
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            fontSize: '0.85rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.8rem' }}>
                              Excerpt {idx + 1}: {chunk.unitOrHeading}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              Relevance: {chunk.relevanceScore?.toFixed(1) || '1.0'}
                            </span>
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                            {chunk.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
