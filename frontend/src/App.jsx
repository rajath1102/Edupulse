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
import SettingsPage from './pages/Settings';
import * as api from './api';
import './App.css';

function MainApp() {
  const { user, role } = useAuth();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const isStudent = role === 'ROLE_STUDENT';
  const myStudentId = user?.studentId;

  // Load students from Spring Boot REST API
  async function loadStudents() {
    setLoadingStudents(true);
    try {
      const data = await api.getAllStudents();
      setStudents(data || []);
      
      // Auto-select student based on role
      if (isStudent && myStudentId) {
        setSelectedStudentId(String(myStudentId));
      } else if (data && data.length > 0 && !selectedStudentId) {
        setSelectedStudentId(String(data[0].id));
      }
    } catch (err) {
      console.warn('Student list fetch notice:', err);
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
  // If the user is logged in as a student, filter the list so they ONLY see their personal record!
  const visibleStudents = (isStudent && myStudentId)
    ? students.filter(s => s.id === Number(myStudentId))
    : students;

  const effectiveSelectedId = (isStudent && myStudentId)
    ? String(myStudentId)
    : selectedStudentId;

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
