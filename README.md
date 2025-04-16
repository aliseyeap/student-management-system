# 🎓 Student Management System

This is a full-stack web-based **Student Management System** built to support multiple user roles (Admin, Lecturer, Student). It offers role-based access to academic features such as course management, grading, and performance tracking.

This project was built using **Java (Spring Boot)** for the backend, **React with Vite** for the frontend, and **MySQL with Hibernate (ORM)** for persistent data handling.

---

## 🚀 Features

### 🔐 General Features
- Login: Secure login with role-based redirection
- Profile Management: View and update personal profile information
- Change Password: Update account password securely
- Dashboard: Personalized dashboard based on user role

### 👨‍🎓 Student Features
- Course Enrollment:
  - View available courses for registration
  - Register for courses within the allowed registration period
  - Drop registered courses before the drop deadline
- Academic Records:
  - View detailed performance for each enrolled course (quiz, midterm, final exam scores)
  - View overall academic summary including CGPA across all enrolled courses
- Lecturers:
  - Access a directory of lecturers with their details

### 🧑‍🏫 Lecturer Features
- Students: View the list of all students in the system
- Courses: View only the courses assigned to the lecturer
- Enrollments: 
  - Assign students to their courses
  - Drop or re-enroll students from courses
- Grades:
  - Input individual scores for quizzes, midterms, and final exams
  - Automatically calculate final score and generate grade
- Reports (Downloadable as PDF or Excel):
  - List of Students
  - List of Courses (assigned to lecturer)
  - Enrollments (filterable by course)
  - Grades (filterable by course)

### 🛠️ Admin Panel
- Dashboard: View an overview of system stats and activity
- Students Management (CRUD): Add, update, delete, and list student accounts
- Lecturers Management (CRUD): Manage lecturer profiles and access
- Courses Management (CRUD): Create and maintain course records
- Course Assignment: Assign available courses to specific lecturers
- Course Enrollments: View which students are enrolled in which courses
- Grades: View student grades per course or view detailed student performance
- Reports (Downloadable as PDF or Excel):
  - List of Lecturers
  - List of Students
  - List of Courses
  - Course Assignments
  - Course Enrollments (filterable by course)
  - Grades Report (filterable by course)

---

## 🧰 Tech Stack

- **Frontend:** React (Vite), HTML, CSS, JavaScript
- **Backend:** Java (Spring Boot), Hibernate ORM
- **Database:** MySQL
- **API Communication:** RESTful APIs
- **Security:** JWT, validation, OWASP best practices

---

## 💻 Getting Started

Follow the steps below to run the Student Management System on your local environment.

### 1. Clone the Repository

```bash
git clone https://github.com/aliseyeap/student-management-system.git
```

### 2. Set Up the Database
- Open MySQL Workbench or your preferred MySQL GUI
- Create a new database named:
```bash
srt_db
```
- Alternatively, the database will be auto-created if it doesn’t exist, due to:
```bash
spring.datasource.url=jdbc:mysql://localhost:3306/srt_db?createDatabaseIfNotExist=true
```

### 3. Configure Backend (Spring Boot)
- Navigate to the backend/ folder
- Review or update the application.properties file:
```bash
spring.application.name=student-result-tracking-backend

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/srt_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update

# JWT Security
jwt.secret=7Gf3D3mO19rPvJxO0FiKZoNzzP08DTh9Y2Bz5c2X+uU=
jwt.expiration=86400000
```
- Start the backend server using Maven:
```bash
./mvnw spring-boot:run
```

### 4. Configure Frontend (React + Vite)
- Navigate to the frontend/ folder
- Install dependencies:
```bash
npm install
```
- Start the development server:
```bash
npm run dev
```

### 5. Launch the Application
- Backend API Login Endpoint:
```bash
http://localhost:8080/api/auth/login
```
- Frontend Login Page:
```bash
http://localhost:3000/api/auth/login
```

---
## 🔐 Login & User Management
- Default Admin Account:
```bash
Email:    Admin@gmail.com
Password: Admin@123
```
- Important Notes:
  - Only Admin can create new accounts for Lecturers and Students.
  - Self-registration is not available for users.

---

## 📷 Screenshots
### 👨‍🎓 Student Interface
#### 🏠 Dashboard
<img src="https://github.com/user-attachments/assets/be99d16a-d08c-4615-83ad-0642a7315bee" width="400"/>

#### 📋 Course View
<img src="https://github.com/user-attachments/assets/44d9296f-30d9-4b85-b7fd-32a8fbd819d5" width="400"/>

### 👨‍🏫 Lecturer Interface
#### 📝 Grade Management
<img src="https://github.com/user-attachments/assets/3d31d03e-1801-4daf-8d59-583e360510fe" width="400"/>

#### 📊 Enrollment Management
<img src="https://github.com/user-attachments/assets/f42b333f-2f07-4bb9-a113-f25c05038eb6" width="400"/>

### 🛠️ Admin Interface
#### 👥 Course Assignment
<img src="https://github.com/user-attachments/assets/b941a0ed-83da-4496-91df-69aae2e9ff1f" width="400"/>

#### 📚 Course Management
<img src="https://github.com/user-attachments/assets/ddf04b0f-f56d-427d-ba10-108de7ead2b7" width="400"/>

---
## 👨‍💻 Author
Developed by @aliseyeap.

---
## 📄 License
This project is developed for academic purposes and is not intended for commercial distribution. Please consult the authors for reuse or enhancement.
