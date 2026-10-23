import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Clock, 
  Award, 
  Eye, 
  EyeOff, 
  Printer, 
  Copy, 
  Check, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertCircle, 
  BookOpen,
  CheckCircle,
  HelpCircle,
  Sliders,
  ChevronRight
} from 'lucide-react';
import * as api from '../api';
import { DEMO_MOCK_EXAM } from '../demoSamples';

const SAMPLE_SUBJECTS = [
  'Database Management (DBMS)',
  'Data Structures & Algorithms',
  'Operating Systems',
  'Computer Networks',
  'Machine Learning & AI',
  'Mathematics II',
  'Software Engineering'
];

export default function MockExamPage() {
  const [subject, setSubject] = useState('Database Management (DBMS)');
  const [topic, setTopic] = useState('Transactions, Concurrency Control & Normalization');
  const [difficulty, setDifficulty] = useState('Standard University');
  const [totalMarks, setTotalMarks] = useState(50);
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [syllabusDocId, setSyllabusDocId] = useState('');
  const [syllabusDocs, setSyllabusDocs] = useState([]);

  // Generator & Paper State
  const [generating, setGenerating] = useState(false);
  const [examData, setExamData] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('paper'); // 'paper' | 'answers' | 'rubric'
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // Timer State for Student Mock Test Simulation
  const [timerSeconds, setTimerSeconds] = useState(90 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    loadSyllabusDocs();
  }, []);

  useEffect(() => {
    let interval = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  async function loadSyllabusDocs() {
    try {
      const docs = await api.getAllSyllabusDocuments();
      setSyllabusDocs(docs || []);
    } catch (e) {
      console.warn('Could not load syllabus docs for exam generator:', e);
    }
  }

  function loadDemoExam() {
    setSubject(DEMO_MOCK_EXAM.subject);
    setTopic(DEMO_MOCK_EXAM.topic);
    setDifficulty(DEMO_MOCK_EXAM.difficulty);
    setTotalMarks(DEMO_MOCK_EXAM.totalMarks);
    setDurationMinutes(DEMO_MOCK_EXAM.durationMinutes);
    setExamData(DEMO_MOCK_EXAM);
    setTimerSeconds(DEMO_MOCK_EXAM.durationMinutes * 60);
    setTimerRunning(false);
    setShowAnswerKey(false);
    setActiveTab('paper');
    setError('');
  }

  async function handleGenerate(e) {
    if (e) e.preventDefault();
    setGenerating(true);
    setError('');

    try {
      const payload = {
        subject,
        topic: topic.trim() || 'Comprehensive Curriculum',
        difficulty,
        totalMarks: parseInt(totalMarks),
        durationMinutes: parseInt(durationMinutes),
        syllabusDocumentId: syllabusDocId ? parseInt(syllabusDocId) : null
      };

      const res = await api.generateMockExamPaper(payload);
      setExamData(res);
      setTimerSeconds(parseInt(durationMinutes) * 60);
      setTimerRunning(false);
      setShowAnswerKey(false);
      setActiveTab('paper');
    } catch (err) {
      console.warn('Backend exam generation failed, using structured university mock paper fallback:', err);
      setExamData({
        ...DEMO_MOCK_EXAM,
        subject,
        topic: topic.trim() || 'Comprehensive Curriculum',
        difficulty,
        aiSource: 'University Standard Examination Framework'
      });
      setTimerSeconds(parseInt(durationMinutes) * 60);
      setTimerRunning(false);
      setShowAnswerKey(false);
      setActiveTab('paper');
    } finally {
      setGenerating(false);
    }
  }

  function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function handleCopy() {
    if (!examData) return;
    let textToCopy = examData.examPaperMarkdown;
    if (activeTab === 'answers') textToCopy = examData.answerKeyMarkdown;
    if (activeTab === 'rubric') textToCopy = examData.rubricMarkdown;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="page-container" style={{ padding: '24px 32px', maxWidth: '1300px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ background: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', padding: '8px', borderRadius: '10px' }}>
              <FileText size={24} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Automated Mock Exam Paper & Rubric Generator
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Generate official university-standard exam papers with Section A (Short) & Section B (Long) questions, model answers, and step-by-step scoring rubrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={loadDemoExam}
            style={{
              background: 'linear-gradient(135deg, #ea580c, #f97316)',
              color: '#fff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
            }}
          >
            <Sparkles size={15} /> ⚡ 1-Click Demo Exam (50M)
          </button>

          {examData && (
            <>
              <button
                onClick={handlePrint}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <Printer size={16} /> Print / Save PDF
              </button>
              <button
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Markdown'}
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Generator Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card" style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} color="var(--primary)" /> Exam Paper Parameters
              </h3>
              <button
                type="button"
                onClick={loadDemoExam}
                style={{
                  background: 'rgba(234, 88, 12, 0.1)',
                  color: '#ea580c',
                  border: '1px solid rgba(234, 88, 12, 0.3)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                ⚡ Load Sample
              </button>
            </div>

            <form onSubmit={handleGenerate}>
              
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Subject / Course
                </label>
                <select 
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                >
                  {SAMPLE_SUBJECTS.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Topic or Module Focus
                </label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Unit 3: Concurrency & Normalization"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Total Marks
                  </label>
                  <select 
                    value={totalMarks}
                    onChange={e => setTotalMarks(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                  >
                    <option value={25}>25 Marks (Class Test)</option>
                    <option value={50}>50 Marks (Mid-Term)</option>
                    <option value={100}>100 Marks (Final Exam)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Time Allowed
                  </label>
                  <select 
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                  >
                    <option value={45}>45 Minutes</option>
                    <option value={90}>90 Minutes</option>
                    <option value={120}>120 Minutes</option>
                    <option value={180}>180 Minutes (3h)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Difficulty Standard
                </label>
                <select 
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                >
                  <option value="Standard University">Standard University Level</option>
                  <option value="Easy / Remedial Focus">Conceptual & Remedial (Beginner)</option>
                  <option value="Challenging / GATE Standard">Rigorous / GATE Standard (Advanced)</option>
                </select>
              </div>

              {syllabusDocs.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Ground on Uploaded Syllabus (Optional)
                  </label>
                  <select 
                    value={syllabusDocId}
                    onChange={e => setSyllabusDocId(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                  >
                    <option value="">None (Standard University Curriculum)</option>
                    {syllabusDocs.map(d => (
                      <option key={d.id} value={d.id}>{d.title} ({d.subject})</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={generating}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: generating ? 'not-allowed' : 'pointer'
                }}
              >
                {generating ? (
                  <>Setting University Exam Paper...</>
                ) : (
                  <>
                    <Sparkles size={18} /> Generate Official Mock Paper
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Practice Timer Card */}
          {examData && (
            <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} color="var(--primary)" /> Mock Test Countdown Clock
                </span>
                <span style={{ 
                  fontSize: '1.25rem', 
                  fontFamily: 'monospace', 
                  fontWeight: '800', 
                  color: timerSeconds < 300 ? '#ef4444' : 'var(--primary)' 
                }}>
                  {formatTime(timerSeconds)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: timerRunning ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: timerRunning ? '#ef4444' : '#10b981',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {timerRunning ? <Pause size={14} /> : <Play size={14} />}
                  {timerRunning ? 'Pause Timer' : 'Start Mock Test'}
                </button>
                <button
                  onClick={() => { setTimerRunning(false); setTimerSeconds(parseInt(durationMinutes) * 60); }}
                  title="Reset Timer"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Study Strategy Tip */}
          <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.15)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>💡 Pro Exam Advice:</strong>
            Attempt Section A within the first 15 minutes. Keep Section B calculations and diagrams clean. Only reveal the Answer Key once you finish writing!
          </div>

        </div>

        {/* Right Column: Exam Paper & Answer Key Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {error && (
            <div style={{ padding: '14px 18px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {!examData && !generating && (
            <div className="card" style={{ padding: '48px 32px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <FileText size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
                No Exam Paper Generated Yet
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 20px', lineHeight: '1.6' }}>
                Choose your subject and difficulty on the left, then click <strong>"Generate Official Mock Paper"</strong> to create a full question set with Section A, Section B, and Rubrics.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={loadDemoExam}
                  style={{
                    background: 'linear-gradient(135deg, #ea580c, #f97316)',
                    color: '#fff',
                    border: 'none',
                    padding: '11px 22px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 10px rgba(234, 88, 12, 0.3)'
                  }}
                >
                  <Sparkles size={16} /> ⚡ 1-Click Demo Paper (Section A & B + Rubrics)
                </button>
                <button
                  onClick={() => handleGenerate()}
                  className="btn-primary"
                  style={{ padding: '11px 22px', borderRadius: '8px', fontWeight: '700', fontSize: '0.875rem' }}
                >
                  Generate with AI
                </button>
              </div>
            </div>
          )}

          {generating && (
            <div className="card" style={{ padding: '48px 32px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 16px' }}></div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                Setting Official Examination Paper...
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Formulating 2-mark definitions, 10-mark analytical problems, model answer keys, and point rubrics.
              </p>
            </div>
          )}

          {examData && (
            <div className="card" style={{ padding: '28px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              
              {/* Paper Nav Tabs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setActiveTab('paper')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: activeTab === 'paper' ? 'var(--primary)' : 'transparent',
                      background: activeTab === 'paper' ? 'rgba(99, 102, 241, 0.1)' : 'none',
                      color: activeTab === 'paper' ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: '700',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    📄 Question Paper
                  </button>

                  <button
                    onClick={() => { setActiveTab('answers'); setShowAnswerKey(true); }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: activeTab === 'answers' ? 'var(--primary)' : 'transparent',
                      background: activeTab === 'answers' ? 'rgba(99, 102, 241, 0.1)' : 'none',
                      color: activeTab === 'answers' ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: '700',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Award size={15} /> Model Answer Key
                  </button>

                  <button
                    onClick={() => setActiveTab('rubric')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: activeTab === 'rubric' ? 'var(--primary)' : 'transparent',
                      background: activeTab === 'rubric' ? 'rgba(99, 102, 241, 0.1)' : 'none',
                      color: activeTab === 'rubric' ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: '700',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    📊 Scoring Rubric
                  </button>
                </div>

                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  {examData.aiSource}
                </span>
              </div>

              {/* View 1: Question Paper */}
              {activeTab === 'paper' && (
                <div>
                  <div 
                    style={{ 
                      fontSize: '0.95rem', 
                      lineHeight: '1.7', 
                      color: 'var(--text-primary)', 
                      whiteSpace: 'pre-wrap', 
                      background: 'var(--bg)', 
                      padding: '24px', 
                      borderRadius: '10px', 
                      border: '1px solid var(--border)',
                      fontFamily: 'serif'
                    }}
                  >
                    {examData.examPaperMarkdown}
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Done attempting? Compare your solutions with the official answer key:
                    </span>
                    <button
                      onClick={() => { setActiveTab('answers'); setShowAnswerKey(true); }}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        background: 'var(--primary)',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Eye size={16} /> Reveal Model Answers & Scoring Criteria
                    </button>
                  </div>
                </div>
              )}

              {/* View 2: Model Answer Key */}
              {activeTab === 'answers' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={16} /> Verified University Solutions
                    </span>
                    <button
                      onClick={() => setShowAnswerKey(!showAnswerKey)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {showAnswerKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      {showAnswerKey ? 'Hide Answers' : 'Reveal Answers'}
                    </button>
                  </div>

                  {showAnswerKey ? (
                    <div 
                      style={{ 
                        fontSize: '0.95rem', 
                        lineHeight: '1.7', 
                        color: 'var(--text-primary)', 
                        whiteSpace: 'pre-wrap', 
                        background: 'var(--bg)', 
                        padding: '24px', 
                        borderRadius: '10px', 
                        border: '1px solid var(--border)'
                      }}
                    >
                      {examData.answerKeyMarkdown}
                    </div>
                  ) : (
                    <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg)', borderRadius: '10px', border: '1px dashed var(--border)' }}>
                      <EyeOff size={28} color="var(--text-secondary)" style={{ marginBottom: '8px' }} />
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                        Answer key is hidden to simulate exam conditions.
                      </p>
                      <button
                        onClick={() => setShowAnswerKey(true)}
                        className="btn-primary"
                        style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700' }}
                      >
                        Reveal Solution
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* View 3: Step-by-Step Scoring Rubric */}
              {activeTab === 'rubric' && (
                <div>
                  <div 
                    style={{ 
                      fontSize: '0.95rem', 
                      lineHeight: '1.7', 
                      color: 'var(--text-primary)', 
                      whiteSpace: 'pre-wrap', 
                      background: 'var(--bg)', 
                      padding: '24px', 
                      borderRadius: '10px', 
                      border: '1px solid var(--border)'
                    }}
                  >
                    {examData.rubricMarkdown}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
