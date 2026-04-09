import React from 'react';

function Sidebar({ handleLogout, isDarkMode, toggleDarkMode, activeView, setActiveView, isOpen, setIsOpen }) {
  
  const handleNavClick = (view) => {
    setActiveView(view);
    if (window.innerWidth <= 992 && setIsOpen) {
      setIsOpen(false);
    }
  };

  const onLogoutClick = () => {
    sessionStorage.setItem('showLogoutToast', 'true');
    if (handleLogout) {
      handleLogout();
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      
      <div className="logo-area" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '24px',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img 
          src="/assets/seelai_logo.png"
          alt="SEELAI Logo" 
          style={{ 
            width: '40px',          
            height: '40px',         
            objectFit: 'contain', 
            display: 'block',
            borderRadius: '8px'     
          }} 
        />
          <span className="logo-text" style={{ 
            fontSize: '30px', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: '1'
          }}>
            SEELAI
          </span>
        </div>
        
        {isOpen && (
          <button 
            onClick={() => setIsOpen(false)} 
            style={{ 
              background: 'var(--hover-bg)', 
              border: 'none', 
              color: 'var(--text-main)', 
              cursor: 'pointer', 
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}
      </div>

      <div className="nav-menu">
        <div 
          className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavClick('dashboard')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>
          Dashboard
        </div>
        <div 
          className={`nav-item ${activeView === 'user_management' ? 'active' : ''}`}
          onClick={() => handleNavClick('user_management')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
          User Management
        </div>
        <div 
          className={`nav-item ${activeView === 'activity_logs' ? 'active' : ''}`}
          onClick={() => handleNavClick('activity_logs')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          Activity Logs
        </div>
        <div 
          className={`nav-item ${activeView === 'model_training' ? 'active' : ''}`}
          onClick={() => handleNavClick('model_training')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          Model Training
        </div>
      </div>

      <div className="sidebar-bottom">
        <div className="nav-item" onClick={toggleDarkMode}>
          {isDarkMode ? (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Light Mode</>
          ) : (
            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg> Dark Mode</>
          )}
        </div>
        {/* Removed the inline red color to match the theme */}
        <div className="nav-item" onClick={onLogoutClick}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Logout
        </div>
      </div>
    </div>
  );
}
export default Sidebar;