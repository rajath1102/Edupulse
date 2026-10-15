import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoginModal from './components/LoginModal';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Analytics from './pages/Analytics';
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

  // Load students from Spring Boot REST API
  async function loadStudents() {
    setLoadingStudents(true);
    try {
      const data = await api.getAllStudents();
      setStudents(data || []);
      if (data && data.length > 0 && !selectedStudentId) {
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

  function handleStudentAdded(newStudent) {
    setStudents(prev => [newStudent, ...prev]);
    setSelectedStudentId(String(newStudent.id));
  }

  function handleNavigateToAi(studentId) {
    setSelectedStudentId(String(studentId));
    setCurrentSection('ai-advisor');
  }

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
              students={students}
              selectedStudentId={selectedStudentId}
              onSelectStudent={setSelectedStudentId}
              onRefreshStudents={loadStudents}
            />
          )}

          {currentSection === 'students' && (
            <Students
              students={students}
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
              students={students}
              selectedStudentId={selectedStudentId}
              onSelectStudent={setSelectedStudentId}
            />
          )}

          {currentSection === 'ai-advisor' && (
            <AiAdvisor
              students={students}
              selectedStudentId={selectedStudentId}
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
