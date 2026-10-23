import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoginModal from './components/LoginModal';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Analytics from './pages/Analytics';
import AiScanner from './pages/AiScanner';
import AiAdvisor from './pages/AiAdvisor';
import EduBotPage from './pages/EduBotPage';
import SyllabusRagPage from './pages/SyllabusRagPage';
import MockExamPage from './pages/MockExamPage';
import EduBotWidget from './components/EduBotWidget';
import SettingsPage from './pages/Settings';
import * as api from './api';
import './App.css';

function MainApp() {
  const { user, role } = useAuth();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [students, setStudents] = useState(api.FALLBACK_STUDENTS);
  const [selectedStudentId, setSelectedStudentId] = useState('1');
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const isStudent = role === 'ROLE_STUDENT';
  const myStudentId = user?.studentId;

  // Load students from Spring Boot REST API
  async function loadStudents(isRetry = false) {
    setLoadingStudents(true);
    try {
      const data = await api.getAllStudents();
      const studentList = (Array.isArray(data) && data.length > 0) ? data : api.FALLBACK_STUDENTS;
      setStudents(studentList);
      
      // Auto-select student based on role
      if (isStudent && myStudentId) {
        setSelectedStudentId(String(myStudentId));
      } else if (studentList.length > 0) {
        if (!selectedStudentId || !studentList.some(s => String(s.id) === String(selectedStudentId))) {
          setSelectedStudentId(String(studentList[0].id));
        }
      }
    } catch (err) {
      console.warn('Student list fetch notice:', err);
      setStudents(api.FALLBACK_STUDENTS);
      if (!selectedStudentId) {
        setSelectedStudentId('1');
      }
    } finally {
      setLoadingStudents(false);
    }
  }

  // Reload students on user/role change
  useEffect(() => {
    loadStudents();
  }, [user, role]);

  // Ensure student selection is locked to the logged-in student when in student role,
  // or defaults to first available student if switching to teacher/admin
  useEffect(() => {
    if (isStudent && myStudentId) {
      setSelectedStudentId(String(myStudentId));
    } else if (!isStudent && students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(String(students[0].id));
    }
  }, [isStudent, myStudentId, students]);

  function handleStudentAdded(newStudent) {
    setStudents(prev => [newStudent, ...prev]);
    setSelectedStudentId(String(newStudent.id));
  }

  function handleNavigateToAi(studentId) {
    setSelectedStudentId(String(studentId));
    setCurrentSection('ai-advisor');
  }

  // STUDENT PRIVACY FILTER:
  // If the user is logged in as a student, filter the list so they ONLY see their personal record;
  // if not found, show the student roster so the screen is NEVER blank (0 students)!
  let visibleStudents = students;
  if (isStudent && myStudentId) {
    const filtered = students.filter(s => s.id === Number(myStudentId));
    if (filtered.length > 0) {
      visibleStudents = filtered;
    }
  }

  const effectiveSelectedId = (isStudent && myStudentId)
    ? String(myStudentId)
    : (selectedStudentId || '1');

  return (
    <div className="app-container">
      <Sidebar
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      <div className="main-content">
        <Topbar
          currentSection={currentSection}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />

        <main className="page">
          {currentSection === 'dashboard' && (
            <Dashboard
              students={visibleStudents}
              selectedStudentId={effectiveSelectedId}
              onSelectStudent={setSelectedStudentId}
              onRefreshStudents={loadStudents}
            />
          )}

          {currentSection === 'edubot' && (
            <EduBotPage />
          )}

          {currentSection === 'syllabus-rag' && (
            <SyllabusRagPage />
          )}

          {currentSection === 'mock-exam' && (
            <MockExamPage />
          )}

          {currentSection === 'students' && (
            <Students
              students={visibleStudents}
              onStudentAdded={handleStudentAdded}
              onSelectStudent={(id) => {
                setSelectedStudentId(String(id));
                setCurrentSection('dashboard');
              }}
              onNavigateToAi={handleNavigateToAi}
            />
          )}

          {currentSection === 'analytics' && (
            <Analytics
              students={visibleStudents}
              selectedStudentId={effectiveSelectedId}
              onSelectStudent={setSelectedStudentId}
            />
          )}

          {currentSection === 'ai-scanner' && (
            <AiScanner
              students={students}
              onRefreshStudents={loadStudents}
            />
          )}

          {currentSection === 'ai-advisor' && (
            <AiAdvisor
              students={visibleStudents}
              selectedStudentId={effectiveSelectedId}
              onSelectStudent={setSelectedStudentId}
            />
          )}

          {currentSection === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Floating Global EduBot Chat Launcher */}
      <EduBotWidget onNavigateToFullPage={() => setCurrentSection('edubot')} />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
