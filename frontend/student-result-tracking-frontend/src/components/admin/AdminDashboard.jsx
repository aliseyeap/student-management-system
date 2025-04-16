import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';
import '../css/AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="admin-dashboard">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Header activeTab={activeTab} />
        <div className="content-area">
          <MainContent activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
