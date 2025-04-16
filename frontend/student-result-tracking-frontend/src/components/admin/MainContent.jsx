import DashboardContent from './DashboardContent';
import StudentsContent from './StudentsContent';
import LecturersContent from './LecturersContent';
import CoursesContent from './CoursesContent';
import EnrollmentsContent from './EnrollmentsContent';
import GradesContent from './GradesContent';
import ReportsContent from './ReportsContent';
import AssignCourseContent from './AssignCourseContent';

function MainContent({ activeTab }) {
  switch (activeTab) {
    case 'dashboard':
      return <DashboardContent />;
    case 'students':
      return <StudentsContent />;
    case 'lecturers':
      return <LecturersContent />;
    case 'courses':
      return <CoursesContent />;
      case 'assign-course':
        return <AssignCourseContent />;
    case 'enrollments':
      return <EnrollmentsContent />;
    case 'grades':
      return <GradesContent />;
    case 'reports':
      return <ReportsContent />;
    default:
      return <DashboardContent />;
  }
}

export default MainContent;
