// C:\seelai-web-dashboard\src\pages\admin\admin_dashboard.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { database, auth } from '../../firebase'; 
import { ref, push, set, serverTimestamp, onValue } from 'firebase/database';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// 1. FIXED PATH: Point to the new styles folder
import '../../styles/dashboard.css'; 

// 2. FIXED PATH: Point to the new components/sidebar folder
import Sidebar from '../../components/sidebar/sidebar';

// 3. This path is already correct!
import ModelTraining from '../../section/model_training'; 

function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userStats, setUserStats] = useState({ total: 0, partially_sighted: 0, caretakers: 0 });
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [activeView, setActiveView] = useState('model_training'); 
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        navigate('/'); 
      }
    });

    const usersRef = ref(database, 'user_info');
    const unsubscribeData = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const partiallySightedCount = data.partially_sighted ? Object.keys(data.partially_sighted).length : 0;
        const caretakerCount = data.caretaker ? Object.keys(data.caretaker).length : 0;
        setUserStats({
          total: partiallySightedCount + caretakerCount,
          partially_sighted: partiallySightedCount,
          caretakers: caretakerCount
        });
      }
    });

    return () => {
      unsubscribe();
      unsubscribeData();
    };
  }, [navigate]);

  const logActivity = async (actionName) => {
    if (!currentUser) return;
    try {
      const logsRef = ref(database, 'activity_logs');
      await set(push(logsRef), {
        userId: currentUser.uid,
        action: actionName,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Logging failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <div className="main-content"><h1 className="page-title">Dashboard Overview</h1></div>;
      case 'user_management':
        return <div className="main-content"><h1 className="page-title">User Management</h1></div>;
      case 'activity_logs':
        return <div className="main-content"><h1 className="page-title">Activity Logs</h1></div>;
      case 'model_training':
        return (
          <ModelTraining 
            activeStep={activeStep} 
            setActiveStep={setActiveStep} 
            userStats={userStats} 
            logActivity={logActivity} 
          />
        );
      default:
        return <div className="main-content">Select a view</div>;
    }
  };

  if (!currentUser) return <div style={{ padding: '40px', fontFamily: 'Poppins' }}>Loading workspace...</div>;

  return (
    <div className="dashboard-container">
      <Sidebar 
        handleLogout={handleLogout} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      {renderContent()}
    </div>
  );
}

export default AdminDashboard;