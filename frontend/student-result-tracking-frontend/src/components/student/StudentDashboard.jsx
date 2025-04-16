import { useState } from "react";
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';
import StudentMainContent from './StudentMainContent';
import '../css/StudentDashboard.css';

function StudentDashboard(){
  const [ activeTab, setActiveTab] = useState("dashboard");

  return(
    <div className="student-dashboard">
      <StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="student-main-content">
        <StudentHeader activeTab={activeTab} />
        <div className="content-area">
          <StudentMainContent activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard;