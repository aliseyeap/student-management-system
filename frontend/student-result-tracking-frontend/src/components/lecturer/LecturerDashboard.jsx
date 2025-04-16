import { useState } from "react";
import LecturerSidebar from "./LecturerSidebar";
import LecturerHeader from "./LecturerHeader";
import LecturerMainContent from "./LecturerMainContent";
import '../css/LecturerDashboard.css';

function LecturerDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="lecturer-dashboard">
      <LecturerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="lecturer-main-content">
        <LecturerHeader activeTab={activeTab} />
        <div className="content-area">
          <LecturerMainContent activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
}

export default LecturerDashboard;
