/**
 * EduPulse API Client
 * Centralized API service with JWT authentication and environment-aware baseURL.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'https://edupulse-1-2ssh.onrender.com';

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
  const res = await fetch(`${API_BASE}/api/students`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function getStudentById(id) {
  const res = await fetch(`${API_BASE}/api/students/${id}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
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
  const res = await fetch(`${API_BASE}/api/performance/student/${studentId}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
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
  const res = await fetch(`${API_BASE}/api/analysis/student/${studentId}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
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
