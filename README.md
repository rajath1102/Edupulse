# EDUPULSE – AI-Powered Adaptive Learning & Personalized Student Performance Analytics Platform

> **A modern, clean, Spring Boot & MySQL academic project designed for student performance tracking, predictive academic risk assessment, and generative AI study recommendations.**

---

## 📌 Project Overview
**EduPulse** is an educational analytics and adaptive learning platform designed to help educators, academic mentors, and students identify learning gaps before it is too late. By continuously monitoring individual subject marks and attendance rates, the platform automatically categorizes students into risk tiers (**LOW**, **MEDIUM**, **HIGH**), identifies specific weak subjects, and uses **Google Gemini AI** to generate personalized, actionable remediation study plans.

---

## 🎯 Problem Statement
In conventional educational environments:
1. Student risk and weak areas are typically identified only **after** end-semester examination results are declared.
2. Academic advisors lack an automated, data-driven way to compute average marks, attendance trends, and at-risk students across disciplines.
3. Students rarely receive personalized, subject-specific study routines tailored to their individual weaknesses and attendance gaps.

**EduPulse** bridges this gap by providing an end-to-end automated platform that combines relational performance tracking with real-time AI advisory.

---

## 🚀 Objectives
- **Centralized Student Records**: Easily register, update, and manage student profiles.
- **Granular Subject Tracking**: Log marks and attendance per subject for every student.
- **Automated Academic Risk Engine**: Dynamically compute average scores and classify risk level based on rigorous business rules.
- **Weak Subject Discovery**: Automatically detect subjects where student scores fall below threshold (< 50%).
- **AI-Powered Adaptive Learning**: Leverage Google Gemini API to synthesize student analytics and produce personalized, motivating weekly study plans.
- **High Fault Tolerance**: Seamless fallback to a rule-based advisor if an AI API key is not configured, ensuring 100% platform uptime.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Language** | Java 17 (or Java 21) | Robust, enterprise-grade backend language |
| **Framework** | Spring Boot 3.3.4 | Rapid application framework & dependency injection |
| **Web / REST** | Spring Web (Spring MVC) | RESTful API controllers and HTTP routing |
| **ORM / Data Access** | Spring Data JPA / Hibernate | Object-Relational Mapping and CRUD abstraction |
| **Database** | MySQL 8.x | Relational database persistence |
| **Validation** | Jakarta Bean Validation (Hibernate Validator) | Input validation for email, marks, attendance |
| **AI Integration** | Google Gemini API (REST / `gemini-1.5-flash`) | Natural language generative study planning |
| **Build Tool** | Apache Maven | Dependency and lifecycle management |

---

## 🏛️ Architecture & Data Flow

```text
 Client (Postman / Browser / cURL)
                │
                ▼
      REST Controller Layer
  (Student, Performance, Analysis, AI)
                │
                ▼
        Service Layer
 (Business Logic, Validation, Analytics, Gemini Client)
                │
                ▼
       Repository Layer
    (Spring Data JPA Interfaces)
                │
                ▼
         MySQL Database
    (students, performances)
```

### Risk Calculation Rules
- **Average Marks $\ge$ 75%** $\rightarrow$ `LOW` Risk (Strong academic standing)
- **Average Marks $\ge$ 50% and < 75%** $\rightarrow$ `MEDIUM` Risk (Satisfactory, needs improvement in weak subjects)
- **Average Marks < 50%** $\rightarrow$ `HIGH` Risk (Immediate remediation needed)
- **Weak Subject Definition**: Any individual subject score `< 50.0` marks.

---

## 📁 Project Structure

```text
edupulse/
├── src/
│   ├── main/
│   │   ├── java/com/edupulse/
│   │   │   ├── config/
│   │   │   │   ├── AppConfig.java          # RestTemplate & CORS configuration
│   │   │   │   └── DataInitializer.java    # Seeds initial demo students & marks
│   │   │   ├── controller/
│   │   │   │   ├── StudentController.java
│   │   │   │   ├── PerformanceController.java
│   │   │   │   ├── AnalysisController.java
│   │   │   │   └── AiRecommendationController.java
│   │   │   ├── dto/
│   │   │   │   ├── PerformanceRequestDTO.java
│   │   │   │   ├── PerformanceResponseDTO.java
│   │   │   │   ├── PerformanceAnalysisDTO.java
│   │   │   │   ├── AiRecommendationResponseDTO.java
│   │   │   │   └── ErrorResponse.java
│   │   │   ├── exception/
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   ├── BadRequestException.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   ├── model/
│   │   │   │   ├── Student.java
│   │   │   │   └── Performance.java
│   │   │   ├── repository/
│   │   │   │   ├── StudentRepository.java
│   │   │   │   └── PerformanceRepository.java
│   │   │   ├── service/
│   │   │   │   ├── StudentService.java
│   │   │   │   ├── PerformanceService.java
│   │   │   │   ├── AnalysisService.java
│   │   │   │   └── AiRecommendationService.java
│   │   │   └── EduPulseApplication.java    # Spring Boot Main Entrypoint
│   │   └── resources/
│   │       └── application.properties      # MySQL & Gemini config
│   └── test/
│       ├── java/com/edupulse/
│       │   └── EduPulseApplicationTests.java
│       └── resources/
│           ├── application.properties      # H2 In-Memory DB for tests
│           └── mockito-extensions/
├── mvnw.cmd                                # Windows Maven wrapper runner
├── run.ps1                                 # Quick-launch PowerShell script
├── sample_data.sql                         # MySQL schema & seed script
├── pom.xml                                 # Maven dependencies
└── README.md                               # Project documentation
```

---

## ⚙️ MySQL Setup

1. **Start the MySQL Service** (if not already running):
   - In Windows Services (`services.msc`), find **MySQL80** and click **Start**.
   - Or open PowerShell as Administrator and run:
     ```powershell
     Start-Service MYSQL80
     ```

2. **Create the Database**:
   Log into your MySQL client (Command Line or MySQL Workbench):
   ```sql
   CREATE DATABASE IF NOT EXISTS edupulse;
   ```

3. **Verify Database Credentials**:
   Open `src/main/resources/application.properties` and ensure `spring.datasource.username` and `spring.datasource.password` match your local MySQL settings (defaults are `root` / `root`).

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/edupulse?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
   spring.datasource.username=root
   spring.datasource.password=root
   ```

*(Note: Hibernate will automatically generate and update tables due to `spring.jpa.hibernate.ddl-auto=update`)*.

---

## 🤖 Google Gemini API Setup (Optional)

The application includes built-in fault tolerance: **it runs and works completely even without a Gemini API key** by using an intelligent rule-based academic advisor.

To connect live Google Gemini AI:
1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Set the environment variable in your terminal before running:

**Windows PowerShell:**
```powershell
$env:GEMINI_API_KEY="AIzaSyYourActualKeyHere..."
```

**Windows Command Prompt (cmd):**
```cmd
set GEMINI_API_KEY=AIzaSyYourActualKeyHere...
```

**Linux / macOS:**
```bash
export GEMINI_API_KEY="AIzaSyYourActualKeyHere..."
```

---

## ▶️ How to Run the Application

You can run the application with any of the following options:

### Option 1: Using the included PowerShell script (Recommended for Windows)
```powershell
.\run.ps1
```

### Option 2: Using the Maven script
```powershell
.\mvnw.cmd spring-boot:run
```

### Option 3: Standard Maven (if installed in system PATH)
```bash
mvn spring-boot:run
```

Once started, the server runs at: `http://localhost:8080`.

---

## 📊 Pre-Loaded Sample Data
On the very first run, `DataInitializer.java` automatically populates the database with 3 representative student profiles:

1. **ID 1: John Doe** (Medium Risk, Average Marks: 62.25%, Weak Subject: *Data Structures & Algorithms* [45 marks])
2. **ID 2: Jane Smith** (Low Risk, Average Marks: 85.0%, No weak subjects, Attendance: 92.33%)
3. **ID 3: Alex Brown** (High Risk, Average Marks: 41.67%, Weak in 3 subjects, Attendance: 60.0%)

You can immediately test the endpoints without manually inserting data first!

---

## 📡 Complete REST API Endpoints

### 1. Student Management (`/api/students`)

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `POST` | `/api/students` | Register a new student | `201 Created` |
| `GET` | `/api/students` | Retrieve list of all students | `200 OK` |
| `GET` | `/api/students/{id}` | Retrieve specific student by ID | `200 OK` / `404 Not Found` |
| `PUT` | `/api/students/{id}` | Update existing student record | `200 OK` |
| `DELETE` | `/api/students/{id}` | Remove student and associated records | `200 OK` |

### 2. Performance Tracking (`/api/performance`)

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `POST` | `/api/performance` | Add subject marks & attendance | `201 Created` |
| `GET` | `/api/performance/student/{studentId}` | Get all marks for a student | `200 OK` |

### 3. Performance Analysis (`/api/analysis`)

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/api/analysis/student/{studentId}` | Compute average marks, attendance, weak subjects & risk | `200 OK` |

### 4. AI Adaptive Study Recommendation (`/api/ai`)

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `POST` | `/api/ai/recommendation/{studentId}` | Generate personalized AI study plan | `200 OK` |

---

## 🧪 Example API Requests & Responses

### 1. Register a Student
**Request:**
```bash
curl -X POST http://localhost:8080/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rahul Sharma",
    "email": "rahul.sharma@example.com",
    "course": "Computer Science",
    "year": 3
  }'
```

**Response (`201 Created`):**
```json
{
  "id": 4,
  "name": "Rahul Sharma",
  "email": "rahul.sharma@example.com",
  "course": "Computer Science",
  "year": 3
}
```

---

### 2. Log Student Subject Marks & Attendance
**Request:**
```bash
curl -X POST http://localhost:8080/api/performance \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 4,
    "subject": "Operating Systems",
    "marks": 42.5,
    "attendance": 68.0
  }'
```

**Response (`201 Created`):**
```json
{
  "id": 11,
  "studentId": 4,
  "studentName": "Rahul Sharma",
  "subject": "Operating Systems",
  "marks": 42.5,
  "attendance": 68.0
}
```

---

### 3. Get Student Performance Analysis
**Request:**
```bash
curl -X GET http://localhost:8080/api/analysis/student/1
```

**Response (`200 OK`):**
```json
{
  "studentId": 1,
  "studentName": "John Doe",
  "averageMarks": 62.25,
  "weakSubjects": [
    "Data Structures & Algorithms"
  ],
  "averageAttendance": 81.25,
  "riskLevel": "MEDIUM",
  "totalSubjects": 4
}
```

---

### 4. Generate AI-Powered Study Recommendation
**Request:**
```bash
curl -X POST http://localhost:8080/api/ai/recommendation/1
```

**Response (`200 OK`):**
```json
{
  "studentId": 1,
  "studentName": "John Doe",
  "riskLevel": "MEDIUM",
  "averageMarks": 62.25,
  "averageAttendance": 81.25,
  "weakSubjects": [
    "Data Structures & Algorithms"
  ],
  "recommendation": "=== PERSONALIZED STUDY PLAN (EduPulse Adaptive Advisor) ===\n\nStudent: John Doe\nCalculated Risk Level: MEDIUM\n\n1. Performance Assessment: Moderate Risk\n   Your average score is 62.25%, showing good foundational knowledge but scope for distinction.\n   - Focus specifically on raising scores in: Data Structures & Algorithms.\n   - Dedicate 1.5 hours daily to problem-solving and practicing past exam questions.\n\n2. Attendance & Engagement Guidance:\n   - Great job maintaining 81.25% attendance! Consistent presence strongly correlates with higher exam scores.\n\n3. Recommended Weekly Strategy:\n   - Monday to Friday: 2 hours of focused study using the Pomodoro technique.\n   - Saturday: Comprehensive self-assessment and practical coding problem sets.\n   - Sunday: Weekly review and planning next week's milestones.",
  "aiSource": "Google Gemini AI (gemini-1.5-flash)"
}
```

---

### 5. Error Handling Example (Validation Failure)
**Request (Marks out of range):**
```bash
curl -X POST http://localhost:8080/api/performance \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 1,
    "subject": "Physics",
    "marks": 150.0,
    "attendance": 80.0
  }'
```

**Response (`400 Bad Request`):**
```json
{
  "timestamp": "2026-09-20 13:40:00",
  "status": 400,
  "error": "Validation Error",
  "message": "Invalid request data provided",
  "details": [
    "marks: Marks cannot exceed 100"
  ]
}
```

---

## 🎓 College Placement Interview Talking Points

When presenting this project in an interview or viva:

1. **Why 3-Tier Architecture?**
   - Clean separation of concerns: `Controller` handles HTTP routing and input validation; `Service` handles business logic and analytics; `Repository` manages database interactions via Spring Data JPA.
2. **Why JPA/Hibernate?**
   - Object-Relational Mapping (ORM) abstracts raw SQL queries, provides entity relationship mapping (`@OneToMany`, `@ManyToOne`), and automatically updates database schema safely.
3. **How does the AI Recommendation work?**
   - EduPulse calculates deterministic analytics first (average marks, attendance, weak subjects, risk tier) and sends this structured context to Gemini AI via a curated prompt. This avoids AI hallucination while producing hyper-personalized advice.
4. **How did you achieve Fault Tolerance?**
   - The application does not crash if the Gemini API key is missing or invalid. It falls back to a deterministic rule-based engine, ensuring student and performance CRUD APIs remain completely operational.
5. **How is input validation handled?**
   - Using Jakarta Bean Validation annotations (`@NotBlank`, `@Email`, `@Min`, `@Max`) combined with a `@RestControllerAdvice` global exception handler that returns clean, user-friendly JSON error payloads.

---

## 🔮 Future Enhancements
- **Teacher / Student Role Portals**: Add Spring Security with JWT for role-based authentication.
- **Interactive Dashboard**: Build a lightweight React or Thymeleaf UI to visualize student performance charts.
- **Automated Email Alerts**: Send automated email notifications to students placed in the `HIGH` risk bracket.
- **Batch CSV Import**: Allow bulk uploading of student semester grades via CSV.
