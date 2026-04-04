// C:\seelai-web-dashboard\src\pages\admin\admin_dashboard.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { database, auth } from '../../firebase'; 
import { ref, push, set, serverTimestamp, onValue } from 'firebase/database';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import DashboardOverview from '../../section/dashboard/dashboard_content';
import UserManagement from '../../section/user_management/user_management_content';
import ActivityLogs from '../../section/activity_logs/activity_logs_content';
import '../../styles/variables.css';
import '../../styles/sidebar.css';
import '../../styles/dashboard.css'; 
import Sidebar from '../../components/sidebar/sidebar';
import ModelTraining from '../../section/model_training/model_training_content'; 

function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userStats, setUserStats] = useState({ total: 0, partially_sighted: 0, caretakers: 0 });
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [activeView, setActiveView] = useState('dashboard'); 
  const [activeStep, setActiveStep] = useState(1);
  
  // State for the mobile hamburger menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        
        console.log("🔥 Raw Data from Firebase:", data);
        
        const partiallySightedCount = data.partially_sighted ? Object.keys(data.partially_sighted).length : 0;
        const caretakerCount = data.caretaker ? Object.keys(data.caretaker).length : 0;
        const mswdCount = data.mswd ? Object.keys(data.mswd).length : 0;
        const superadminCount = data.superadmin ? Object.keys(data.superadmin).length : 0;

        let pendingCaretakersCount = 0;
        if (data.caretaker) {
          Object.values(data.caretaker).forEach(user => {
            if (user.approved === false && user.rejected !== true) {
              pendingCaretakersCount++;
            }
          });
        }

        setUserStats({
          total: partiallySightedCount + caretakerCount + mswdCount + superadminCount,
          partially_sighted: partiallySightedCount,
          caretakers: caretakerCount,
          mswd: mswdCount + superadminCount,
          pending: pendingCaretakersCount
        });
      } else {
        console.warn("⚠️ Firebase connection successful, but 'user_info' is empty or doesn't exist.");
        setUserStats({ total: 0, partially_sighted: 0, caretakers: 0, mswd: 0, pending: 0 });
      }
    }, (error) => {
      console.error("❌ Firebase Read Error:", error);
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
        return <DashboardOverview userStats={userStats} setActiveView={setActiveView} />; 
      case 'user_management':
        return <UserManagement logActivity={logActivity} />; 
      case 'activity_logs':
        return <ActivityLogs />; 
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
      
      {/* Mobile Header (Only visible on small screens) */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/assets/seelai_logo.png" alt="SEELAI Logo" style={{ width: '32px', height: 'auto' }} />
          <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-main)' }}>SEELAI</span>
        </div>
        <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Dark Overlay Background for Mobile */}
      <div 
        className={`sidebar-overlay ${isMobileMenuOpen ? 'active' : ''}`} 
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      <Sidebar 
        handleLogout={handleLogout} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
        activeView={activeView}
        setActiveView={setActiveView}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />
      {renderContent()}
    </div>
  );
}

export default AdminDashboard;