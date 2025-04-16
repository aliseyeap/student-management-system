import StudentDashboardContent from './StudentDashboardContent';
import StudentEnrollmentManagement from './StudentEnrollmentManagement';
import StudentAcademicPerformance from './StudentAcademicPerformance';
import StudentLecturerDirectory from './StudentLecturerDirectory';

function StudentMainContent({ activeTab, setActiveTab }) {
  switch (activeTab) {
    case 'dashboard':
      return <StudentDashboardContent setActiveTab={setActiveTab} />;
    case 'enrollment':
    return <StudentEnrollmentManagement />;
    case 'academics':
      return <StudentAcademicPerformance />;
    case 'lecturers':
      return <StudentLecturerDirectory />;
    default:
      return <StudentDashboardContent setActiveTab={setActiveTab} />;
  }
}

export default StudentMainContent;