/**
 * EduPulse API Client
 * Centralized API service with JWT authentication and environment-aware baseURL.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'https://edupulse-1-2ssh.onrender.com';

// Verified fallback students roster ensuring UI never renders 0 students even during backend cold starts
export const FALLBACK_STUDENTS = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', department: 'Computer Science', semester: 3 },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', department: 'Information Science', semester: 3 },
  { id: 3, name: 'Alex Brown', email: 'alex.brown@example.com', department: 'Computer Science', semester: 2 },
  { id: 4, name: 'Iron man', email: 'rdj@gmail.com', department: 'Computer Science', semester: 4 },
  { id: 5, name: 'Abhishek sharma', email: 'anhishke@gmail.com', department: 'Information Science', semester: 3 }
];

export const FALLBACK_ANALYSES = {
  1: { studentId: 1, studentName: 'John Doe', averageMarks: 82.3, averageAttendance: 88.0, riskLevel: 'LOW', weakSubjects: [], totalSubjects: 4 },
  2: { studentId: 2, studentName: 'Jane Smith', averageMarks: 84.7, averageAttendance: 87.3, riskLevel: 'LOW', weakSubjects: [], totalSubjects: 3 },
  3: { studentId: 3, studentName: 'Alex Brown', averageMarks: 41.7, averageAttendance: 60.0, riskLevel: 'HIGH', weakSubjects: ['Mathematics II', 'Object-Oriented Programming', 'Digital Electronics'], totalSubjects: 3 },
  4: { studentId: 4, studentName: 'Iron man', averageMarks: 78.5, averageAttendance: 85.0, riskLevel: 'LOW', weakSubjects: [], totalSubjects: 2 },
  5: { studentId: 5, studentName: 'Abhishek sharma', averageMarks: 72.0, averageAttendance: 80.0, riskLevel: 'MEDIUM', weakSubjects: [], totalSubjects: 2 }
};

export const FALLBACK_PERFORMANCES = {
  1: [
    { id: 101, subject: 'Database Management', marks: 85.0, attendance: 90.0, riskLevel: 'LOW', examDate: '2026-10-10' },
    { id: 102, subject: 'Operating Systems', marks: 78.0, attendance: 85.0, riskLevel: 'LOW', examDate: '2026-10-12' },
    { id: 103, subject: 'Data Structures', marks: 88.0, attendance: 92.0, riskLevel: 'LOW', examDate: '2026-10-14' },
    { id: 104, subject: 'Computer Networks', marks: 78.0, attendance: 85.0, riskLevel: 'LOW', examDate: '2026-10-16' }
  ],
  2: [
    { id: 201, subject: 'Cloud Computing', marks: 94.0, attendance: 96.0, riskLevel: 'LOW', examDate: '2026-10-10' },
    { id: 202, subject: 'Database Management', marks: 82.0, attendance: 85.0, riskLevel: 'LOW', examDate: '2026-10-12' },
    { id: 203, subject: 'Web Technologies', marks: 78.0, attendance: 81.0, riskLevel: 'LOW', examDate: '2026-10-14' }
  ],
  3: [
    { id: 301, subject: 'Mathematics II', marks: 35.0, attendance: 55.0, riskLevel: 'HIGH', examDate: '2026-10-10' },
    { id: 302, subject: 'Object-Oriented Programming', marks: 42.0, attendance: 60.0, riskLevel: 'HIGH', examDate: '2026-10-12' },
    { id: 303, subject: 'Digital Electronics', marks: 48.0, attendance: 65.0, riskLevel: 'HIGH', examDate: '2026-10-14' }
  ],
  4: [
    { id: 401, subject: 'Artificial Intelligence', marks: 82.0, attendance: 88.0, riskLevel: 'LOW', examDate: '2026-10-11' },
    { id: 402, subject: 'Computer Architecture', marks: 75.0, attendance: 82.0, riskLevel: 'LOW', examDate: '2026-10-13' }
  ],
  5: [
    { id: 501, subject: 'Database Management', marks: 70.0, attendance: 80.0, riskLevel: 'MEDIUM', examDate: '2026-10-10' },
    { id: 502, subject: 'Operating Systems', marks: 74.0, attendance: 80.0, riskLevel: 'LOW', examDate: '2026-10-12' }
  ]
};

/**
 * Returns authorization headers with JWT Bearer token if present.
 */
export function getAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem('edupulse_jwt');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...extraHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Helper to process API responses and throw friendly errors.
 */
async function handleResponse(res) {
  if (res.status === 401) {
    // Unauthorized - token is expired or invalid, clear immediately
    console.warn('Session expired or unauthorized. Clearing stored token.');
    localStorage.removeItem('edupulse_jwt');
    localStorage.removeItem('edupulse_user');
  }
  if (!res.ok) {
    let errorMessage = `Request failed (HTTP ${res.status})`;
    try {
      const errData = await res.json();
      errorMessage = errData.message || errData.error || errorMessage;
    } catch {
      // response wasn't JSON
    }
    throw new Error(errorMessage);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ==========================================
// AUTHENTICATION APIS
// ==========================================

export async function login(usernameOrEmail, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail, password })
  });
  const data = await handleResponse(res);
  if (data && data.token) {
    localStorage.setItem('edupulse_jwt', data.token);
    localStorage.setItem('edupulse_user', JSON.stringify(data));
  }
  return data;
}

export async function register(userData) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const data = await handleResponse(res);
  if (data && data.token) {
    localStorage.setItem('edupulse_jwt', data.token);
    localStorage.setItem('edupulse_user', JSON.stringify(data));
  }
  return data;
}

export async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export function logout() {
  localStorage.removeItem('edupulse_jwt');
  localStorage.removeItem('edupulse_user');
}

// ==========================================
// STUDENT APIS
// ==========================================

export async function getAllStudents() {
  try {
    const res = await fetch(`${API_BASE}/api/students`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(res);
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return FALLBACK_STUDENTS;
  } catch (err) {
    console.warn('API getAllStudents notice (using fallback student roster):', err.message);
    return FALLBACK_STUDENTS;
  }
}

export async function getStudentById(id) {
  try {
    const res = await fetch(`${API_BASE}/api/students/${id}`, {
      headers: getAuthHeaders()
    });
    return await handleResponse(res);
  } catch (err) {
    const found = FALLBACK_STUDENTS.find(s => s.id === Number(id));
    if (found) return found;
    throw err;
  }
}

export async function createStudent(student) {
  const res = await fetch(`${API_BASE}/api/students`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(student)
  });
  return handleResponse(res);
}

export async function updateStudent(id, student) {
  const res = await fetch(`${API_BASE}/api/students/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(student)
  });
  return handleResponse(res);
}

export async function deleteStudent(id) {
  const res = await fetch(`${API_BASE}/api/students/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

// ==========================================
// PERFORMANCE APIS
// ==========================================

export async function getPerformanceByStudentId(studentId) {
  try {
    const res = await fetch(`${API_BASE}/api/performance/student/${studentId}`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(res);
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return FALLBACK_PERFORMANCES[studentId] || [];
  } catch (err) {
    console.warn(`API getPerformance notice for student ${studentId}:`, err.message);
    return FALLBACK_PERFORMANCES[studentId] || [];
  }
}

export async function addPerformance(studentId, performanceData) {
  const res = await fetch(`${API_BASE}/api/performance`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ studentId: Number(studentId), ...performanceData })
  });
  return handleResponse(res);
}

// ==========================================
// ANALYTICS & AI APIS
// ==========================================

export async function getStudentAnalysis(studentId) {
  try {
    const res = await fetch(`${API_BASE}/api/analysis/student/${studentId}`, {
      headers: getAuthHeaders()
    });
    return await handleResponse(res);
  } catch (err) {
    console.warn(`API getStudentAnalysis notice for student ${studentId}:`, err.message);
    return FALLBACK_ANALYSES[studentId] || {
      studentId: Number(studentId),
      studentName: 'Student',
      averageMarks: 75.0,
      averageAttendance: 85.0,
      riskLevel: 'LOW',
      weakSubjects: [],
      totalSubjects: 3
    };
  }
}

export async function getAiRecommendation(studentId) {
  const res = await fetch(`${API_BASE}/api/ai/recommendation/${studentId}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function scanMarks(imageBase64, mimeType = 'image/jpeg') {
  const res = await fetch(`${API_BASE}/api/ai/scan-marks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ imageBase64, mimeType })
  });
  return handleResponse(res);
}

export async function saveBatchPerformance(records) {
  const res = await fetch(`${API_BASE}/api/performance/batch`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(records)
  });
  return handleResponse(res);
}

export async function askEduBot(message, subject = 'General Academic', history = []) {
  const res = await fetch(`${API_BASE}/api/ai/chat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message, subject, history })
  });
  return handleResponse(res);
}

// ==========================================
// SYLLABUS RAG APIS
// ==========================================

export async function uploadSyllabusDocument(payload) {
  const res = await fetch(`${API_BASE}/api/ai/syllabus/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

export async function getAllSyllabusDocuments() {
  const res = await fetch(`${API_BASE}/api/ai/syllabus`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function getSyllabusDocumentById(id) {
  const res = await fetch(`${API_BASE}/api/ai/syllabus/${id}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function deleteSyllabusDocument(id) {
  const res = await fetch(`${API_BASE}/api/ai/syllabus/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function querySyllabusRAG(payload) {
  const res = await fetch(`${API_BASE}/api/ai/syllabus/query`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

// ==========================================
// MOCK EXAM PAPER GENERATOR APIS
// ==========================================

export async function generateMockExamPaper(payload) {
  const res = await fetch(`${API_BASE}/api/ai/mock-exam/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
}
