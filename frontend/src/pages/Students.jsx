import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  PlusCircle, 
  BarChart2, 
  Sparkles,
  BookOpen,
  Mail,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AddStudentModal from '../components/AddStudentModal';
import AddMarksModal from '../components/AddMarksModal';

export default function Students({ 
  students, 
  onStudentAdded, 
  onSelectStudent, 
  onNavigateToAi 
}) {
  const { isTeacherOrAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');

  // Modal controls
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [activeStudentForMarks, setActiveStudentForMarks] = useState(null);

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'ALL' || student.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const courses = ['ALL', ...new Set(students.map(s => s.course))];

  return (
    <div className="students-page">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>Student Academic Directory</h2>
          <p>Browse student profiles, enroll new students, and log performance scores</p>
        </div>
        {isTeacherOrAdmin && (
          <button
            onClick={() => setShowAddStudent(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <UserPlus size={16} /> Add New Student
          </button>
        )}
      </div>

      {/* Filters and search */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search student by name, email, or course…"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Course:</span>
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '0.875rem',
              background: 'var(--bg)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            {courses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <span className="badge-api" style={{ marginLeft: '8px' }}>
            {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}
          </span>
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="students-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Learner</th>
                <th>Email Address</th>
                <th>Department / Course</th>
                <th>Year</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    No students match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td>#{student.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '0.8rem'
                        }}>
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <strong>{student.name}</strong>
                      </div>
                    </td>
                    <td>{student.email}</td>
                    <td>{student.course}</td>
                    <td>
                      <span style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        padding: '2px 8px',
                        borderRadius: '100px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        Year {student.year}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {isTeacherOrAdmin && (
                          <button
                            onClick={() => setActiveStudentForMarks(student)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              background: 'var(--surface)',
                              color: 'var(--text-secondary)',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Add subject marks & attendance"
                          >
                            <PlusCircle size={13} color="var(--primary)" /> Add Marks
                          </button>
                        )}
                        <button
                          onClick={() => onSelectStudent(student.id)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: '1px solid #c7d2fe',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="View student analytics in Dashboard"
                        >
                          <BarChart2 size={13} /> View Analytics
                        </button>
                        <button
                          onClick={() => onNavigateToAi(student.id)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: '1px solid #c4b5fd',
                            background: '#f5f3ff',
                            color: '#7c3aed',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Generate AI study plan"
                        >
                          <Sparkles size={13} /> AI Plan
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={showAddStudent}
        onClose={() => setShowAddStudent(false)}
        onStudentAdded={onStudentAdded}
      />

      {/* Add Marks Modal */}
      <AddMarksModal
        isOpen={Boolean(activeStudentForMarks)}
        student={activeStudentForMarks}
        onClose={() => setActiveStudentForMarks(null)}
        onPerformanceAdded={() => {
          // Re-trigger selection or refresh
          if (activeStudentForMarks) {
            onSelectStudent(activeStudentForMarks.id);
          }
        }}
      />
    </div>
  );
}
