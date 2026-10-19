import React, { useState, useRef } from 'react';
import { 
  Scan, 
  UploadCloud, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  Save, 
  Trash2, 
  Image as ImageIcon,
  Check,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import * as api from '../api';

export default function AiScanner({ students = [], onRefreshStudents }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [fileName, setFileName] = useState('');
  
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const fileInputRef = useRef(null);

  // Convert File to Base64
  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Please upload an image file (PNG, JPEG, WebP).', type: 'error' });
      return;
    }

    setFileName(file.name);
    setMimeType(file.type);
    setMessage({ text: '', type: '' });
    setScanResult(null);
    setRecords([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target.result;
      setImagePreview(result);
      // clean base64 data
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  }

  // Generate Sample Exam Mark Sheet dynamically via HTML5 Canvas
  function handleLoadSampleSheet() {
    setMessage({ text: '', type: '' });
    setScanResult(null);
    setRecords([]);

    const canvas = document.createElement('canvas');
    canvas.width = 750;
    canvas.height = 450;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header Banner
    ctx.fillStyle = '#4F46E5';
    ctx.fillRect(0, 0, canvas.width, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Helvetica, Arial, sans-serif';
    ctx.fillText('DEPARTMENT OF COMPUTER SCIENCE - SEMESTER EXAMINATION', 25, 38);

    // Sheet Info
    ctx.fillStyle = '#334155';
    ctx.font = '14px Helvetica, Arial, sans-serif';
    ctx.fillText('Exam: Midterm Evaluation 2026', 25, 95);
    ctx.fillText('Max Marks: 100', 600, 95);

    // Table Header
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(25, 115, 700, 32);
    ctx.strokeStyle = '#cbd5e1';
    ctx.strokeRect(25, 115, 700, 32);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px Helvetica, Arial, sans-serif';
    ctx.fillText('Roll / Reg', 40, 136);
    ctx.fillText('Student Name', 160, 136);
    ctx.fillText('Subject / Course', 340, 136);
    ctx.fillText('Marks', 530, 136);
    ctx.fillText('Attendance', 615, 136);

    // Rows
    const sampleRows = [
      { roll: 'CS-01', name: 'John Doe', subject: 'Machine Learning', marks: '86', att: '92%' },
      { roll: 'CS-02', name: 'Jane Smith', subject: 'Cloud Computing', marks: '94', att: '96%' },
      { roll: 'CS-03', name: 'Alex Rivera', subject: 'Mathematics II', marks: '42', att: '60%' },
      { roll: 'CS-04', name: 'Sarah Connor', subject: 'Operating Systems', marks: '75', att: '85%' },
    ];

    let rowY = 147;
    ctx.font = '13px Helvetica, Arial, sans-serif';
    sampleRows.forEach((row, i) => {
      ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#f8fafc';
      ctx.fillRect(25, rowY, 700, 38);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(25, rowY, 700, 38);

      ctx.fillStyle = '#475569';
      ctx.fillText(row.roll, 40, rowY + 24);
      ctx.fillStyle = '#0f172a';
      ctx.fillText(row.name, 160, rowY + 24);
      ctx.fillStyle = '#334155';
      ctx.fillText(row.subject, 340, rowY + 24);
      ctx.fillStyle = Number(row.marks) < 50 ? '#dc2626' : '#16a34a';
      ctx.fillText(row.marks, 530, rowY + 24);
      ctx.fillStyle = '#475569';
      ctx.fillText(row.att, 615, rowY + 24);

      rowY += 38;
    });

    // Signature line
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 12px Helvetica, Arial, sans-serif';
    ctx.fillText('Faculty Signature: Prof. R. Sharma (Examiner)', 25, 340);
    ctx.fillText('Date: October 19, 2026', 600, 340);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setImagePreview(dataUrl);
    setImageBase64(dataUrl);
    setMimeType('image/jpeg');
    setFileName('Sample_Semester_MarkSheet.jpg');
    setMessage({ text: 'Sample Exam Mark Sheet loaded! Click "Scan Sheet with AI" below.', type: 'info' });
  }

  // Trigger Gemini Vision Scan
  async function handleScan() {
    if (!imageBase64) {
      setMessage({ text: 'Please upload or generate a mark sheet first.', type: 'warning' });
      return;
    }

    setScanning(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.scanMarks(imageBase64, mimeType);
      setScanResult(res);

      // Pre-populate records with fallback student matching if needed
      const mapped = (res.records || []).map(r => {
        let matchedId = r.studentId;
        if (!matchedId && students.length > 0) {
          // Attempt client-side fuzzy match
          const found = students.find(s => 
            s.name.toLowerCase().includes(r.studentName.toLowerCase()) ||
            r.studentName.toLowerCase().includes(s.name.toLowerCase())
          );
          if (found) matchedId = found.id;
        }
        return {
          ...r,
          studentId: matchedId || '',
          matched: Boolean(matchedId)
        };
      });

      setRecords(mapped);
      setMessage({
        text: `✓ AI successfully analyzed the sheet and detected ${mapped.length} student scores! Review below and click "Save All to Records".`,
        type: 'success'
      });
    } catch (err) {
      setMessage({ text: err.message || 'Failed to scan image with AI.', type: 'error' });
    } finally {
      setScanning(false);
    }
  }

  // Edit table row
  function updateRecord(index, field, value) {
    setRecords(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'studentId') {
        const selected = students.find(s => s.id === Number(value));
        if (selected) {
          updated[index].studentName = selected.name;
          updated[index].matched = true;
        } else {
          updated[index].matched = false;
        }
      }
      return updated;
    });
  }

  // Delete table row
  function deleteRecord(index) {
    setRecords(prev => prev.filter((_, i) => i !== index));
  }

  // Save all records into backend Performance database
  async function handleSaveAll() {
    if (records.length === 0) return;

    // Validate that all records have a valid studentId
    const unassigned = records.filter(r => !r.studentId);
    if (unassigned.length > 0) {
      setMessage({
        text: `Please assign a registered student for: "${unassigned[0].studentName}" before saving.`,
        type: 'warning'
      });
      return;
    }

    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const payload = records.map(r => ({
        studentId: Number(r.studentId),
        subject: r.subject || 'Exam Evaluation',
        marks: Number(r.marks) || 0,
        attendance: Number(r.attendance) || 85.0
      }));

      await api.saveBatchPerformance(payload);
      setMessage({
        text: `✓ All ${payload.length} student marks successfully committed to the database! Analytics and risk metrics updated in real-time.`,
        type: 'success'
      });
      if (onRefreshStudents) {
        onRefreshStudents();
      }
      setRecords([]);
      setScanResult(null);
    } catch (err) {
      setMessage({ text: err.message || 'Failed to save performance records.', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="ai-scanner-page">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>📷 AI Exam Answer-Sheet & Marks Scanner</h2>
          <p>Instantly extract student scores from physical mark sheets and grade lists using Google Gemini Vision</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleLoadSampleSheet}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#f5f3ff',
              color: '#6d28d9',
              border: '1px solid #c4b5fd',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            title="Generate and preview a realistic test exam score sheet"
          >
            <Sparkles size={14} /> Load Sample Exam Sheet
          </button>
        </div>
      </div>

      {message.text && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: message.type === 'error' ? '#fee2e2' : (message.type === 'warning' ? '#fef3c7' : (message.type === 'info' ? '#e0e7ff' : '#dcfce7')),
          color: message.type === 'error' ? '#991b1b' : (message.type === 'warning' ? '#92400e' : (message.type === 'info' ? '#3730a3' : '#166534')),
          border: `1px solid ${message.type === 'error' ? '#fecaca' : (message.type === 'warning' ? '#fde68a' : (message.type === 'info' ? '#c7d2fe' : '#bbf7d0'))}`
        }}>
          {message.type === 'error' ? <AlertCircle size={18} /> : (message.type === 'warning' ? <HelpCircle size={18} /> : <CheckCircle size={18} />)}
          <span>{message.text}</span>
        </div>
      )}

      {/* Grid: Upload & Preview on Left, Instructions on Right */}
      <div className="panel-grid" style={{ marginBottom: '24px' }}>
        {/* Left: Upload and Preview Box */}
        <div className="card">
          <div className="card-header">
            <h3><UploadCloud size={16} /> Upload Exam Score Sheet</h3>
            {fileName && (
              <span className="badge-api" style={{ fontSize: '0.72rem' }}>
                {fileName}
              </span>
            )}
          </div>
          <div className="card-body">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '40px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--bg)',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <ImageIcon size={26} />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '4px' }}>
                  Click to upload mark sheet or paper snapshot
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Supports JPEG, PNG, or WebP photographs of student score tables
                </p>
                <div style={{ marginTop: '16px' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '100px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)'
                  }}>
                    Or click "Load Sample Exam Sheet" above
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  background: '#f8fafc',
                  textAlign: 'center',
                  maxHeight: '280px',
                  position: 'relative'
                }}>
                  <img
                    src={imagePreview}
                    alt="Exam sheet preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '280px',
                      objectFit: 'contain',
                      display: 'block',
                      margin: '0 auto'
                    }}
                  />
                  {scanning && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(79, 70, 229, 0.45)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      backdropFilter: 'blur(2px)'
                    }}>
                      <div className="spinner" style={{ width: '36px', height: '36px', borderWidth: '3px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff', marginBottom: '10px' }}></div>
                      <strong style={{ fontSize: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                        Gemini Vision analyzing score sheet…
                      </strong>
                      <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                        Extracting student names, subject scores & attendance
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                  <button
                    onClick={handleScan}
                    disabled={scanning}
                    className="btn-ai"
                    style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                  >
                    {scanning ? (
                      <>
                        <div className="spinner" style={{ width: '16px', height: '16px', borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#fff' }}></div>
                        <span>Scanning with Gemini AI…</span>
                      </>
                    ) : (
                      <>
                        <Scan size={16} />
                        <span>Scan Sheet with AI</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setImageBase64(null);
                      setScanResult(null);
                      setRecords([]);
                      setMessage({ text: '', type: '' });
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--danger)',
                      cursor: 'pointer'
                    }}
                    title="Clear image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: How It Works & AI Info */}
        <div className="card">
          <div className="card-header">
            <h3><Sparkles size={16} /> Multimodal Vision Pipeline</h3>
            <span className="badge-api" style={{ background: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }}>
              Gemini 3.8 Flash
            </span>
          </div>
          <div className="card-body" style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
            <p>
              This scanner uses Google Gemini's native multimodal vision capabilities to eliminate manual grade entry.
            </p>
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: 'var(--bg)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)'
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>Workflow Steps:</strong>
              <ol style={{ paddingLeft: '18px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong>Capture:</strong> Take a photo or upload an existing mark sheet image.</li>
                <li><strong>OCR Extraction:</strong> Gemini Vision parses handwriting and print into structured JSON.</li>
                <li><strong>Fuzzy Student Match:</strong> Auto-links detected names with registered students in your cloud MySQL database.</li>
                <li><strong>Verification:</strong> Edit any marks directly in the review table.</li>
                <li><strong>1-Click Commit:</strong> Automatically batch-saves into student performance records!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Extracted Records Table */}
      {records.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3><FileText size={16} /> Extracted Mark Records ({records.length})</h3>
              {scanResult && (
                <span className="ai-source-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: '#c7d2fe' }}>
                  {scanResult.aiSource}
                </span>
              )}
            </div>

            <button
              onClick={handleSaveAll}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                background: 'var(--success)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {saving ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#fff' }}></div>
                  <span>Saving to Database…</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Confirm & Save All to Database</span>
                </>
              )}
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="students-table">
              <thead>
                <tr>
                  <th>Detected Name</th>
                  <th>Linked Student Record</th>
                  <th>Subject</th>
                  <th>Marks (%)</th>
                  <th>Attendance (%)</th>
                  <th>Academic Status</th>
                  <th style={{ textAlign: 'center' }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{rec.studentName}</strong>
                    </td>
                    <td>
                      <select
                        value={rec.studentId || ''}
                        onChange={e => updateRecord(idx, 'studentId', e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: rec.matched ? '1px solid #86efac' : '1px solid #fde68a',
                          background: rec.matched ? '#f0fdf4' : '#fffbeb',
                          fontSize: '0.825rem',
                          fontWeight: '500',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          maxWidth: '220px'
                        }}
                      >
                        <option value="">— Select Registered Student —</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>
                            #{s.id} {s.name} ({s.course})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={rec.subject || ''}
                        onChange={e => updateRecord(idx, 'subject', e.target.value)}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          fontSize: '0.825rem',
                          width: '180px'
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={rec.marks != null ? rec.marks : ''}
                        onChange={e => updateRecord(idx, 'marks', Number(e.target.value))}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          fontSize: '0.825rem',
                          width: '75px',
                          fontWeight: '700',
                          color: Number(rec.marks) < 60 ? 'var(--danger)' : 'var(--success)'
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={rec.attendance != null ? rec.attendance : ''}
                        onChange={e => updateRecord(idx, 'attendance', Number(e.target.value))}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          fontSize: '0.825rem',
                          width: '75px'
                        }}
                      />
                    </td>
                    <td>
                      {Number(rec.marks) < 60 ? (
                        <span className="risk-badge HIGH" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                          Needs Focus
                        </span>
                      ) : (
                        <span className="risk-badge LOW" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                          Satisfactory
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => deleteRecord(idx)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title="Remove row"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
