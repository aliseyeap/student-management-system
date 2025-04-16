import LecturerDashboardContent from './LecturerDashboardContent';
import LecturerStudentsContent from './LecturerStudentsContent';
import AssignedCourseContent from './AssignedCoursesContent';
import CourseEnrollmentContent from './CourseEnrollmentContent';
import GradeAssignmentContent from './GradeAssignmentContent';
import ReportGenerationContent from './ReportGenerationContent';

function LecturerMainContent ({activeTab}) {
  switch (activeTab) {
    case 'dashboard':
      return <LecturerDashboardContent />;
    case 'students':
    return <LecturerStudentsContent />;
    case 'courses':
      return <AssignedCourseContent />;
    case 'enrollment':
      return <CourseEnrollmentContent />;
    case 'grade':
      return <GradeAssignmentContent />;
    case 'reports':
      return <ReportGenerationContent />;
    default:
      return <LecturerDashboardContent />;
  }
}

export default LecturerMainContent