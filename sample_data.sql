-- ===================================================================
-- EDUPULSE - MySQL Database Setup & Sample Seed Script
-- ===================================================================

-- 1. Create Database
CREATE DATABASE IF NOT EXISTS edupulse;
USE edupulse;

-- Note: Hibernate will automatically create the tables 'students' and 'performances'
-- on application startup due to 'spring.jpa.hibernate.ddl-auto=update'.

-- Optional manual SQL inserts (if you want to seed directly in MySQL Workbench):
/*
INSERT INTO students (name, email, course, academic_year) VALUES
('John Doe', 'john.doe@example.com', 'Computer Science', 3),
('Jane Smith', 'jane.smith@example.com', 'Information Technology', 4),
('Alex Brown', 'alex.brown@example.com', 'Computer Science', 2);

-- John Doe (Medium Risk, Weak in DSA)
INSERT INTO performances (student_id, subject, marks, attendance) VALUES
(1, 'Data Structures & Algorithms', 45.0, 72.0),
(1, 'Database Management Systems', 68.0, 85.0),
(1, 'Computer Networks', 74.0, 80.0),
(1, 'Operating Systems', 62.0, 78.0);

-- Jane Smith (Low Risk, High Performer)
INSERT INTO performances (student_id, subject, marks, attendance) VALUES
(2, 'Machine Learning', 88.0, 92.0),
(2, 'Cloud Computing', 82.0, 90.0),
(2, 'Software Engineering', 85.0, 95.0);

-- Alex Brown (High Risk, Weak in 3 subjects)
INSERT INTO performances (student_id, subject, marks, attendance) VALUES
(3, 'Mathematics II', 35.0, 55.0),
(3, 'Object-Oriented Programming', 42.0, 60.0),
(3, 'Digital Electronics', 48.0, 65.0);
*/
