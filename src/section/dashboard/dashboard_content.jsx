import React, { useState, useEffect } from 'react';
import { auth, database } from '../../firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get, query, limitToLast } from 'firebase/database';
// Import your CSS file here (if not already imported in a parent file)
import '../../styles/dashboard.css'; 

// Helper component for the counting animation
const AnimatedNumber = ({ value, duration = 1500 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationId = null;
    const finalValue = parseInt(value, 10) || 0;
    
    // If value is 0, skip the heavy math but update state asynchronously 
    if (finalValue === 0) {
      animationId = requestAnimationFrame(() => setCount(0));
      return () => cancelAnimationFrame(animationId);
    }

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Ease-out cubic function for a smooth slow-down at the end
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setCount(Math.floor(easeOut * finalValue));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        setCount(finalValue);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [value, duration]);

  return <>{count}</>;
};

function DashboardContent({ setActiveView }) {
  const [userName, setUserName] = useState('');
  
  // Real-time states for the dashboard
  const [stats, setStats] = useState({ total: 0, partially_sighted: 0, caretakers: 0, mswd: 0, pending: 0 });
  const [visionStats, setVisionStats] = useState({ objects_detected: 0, faces_registered: 0, scans_completed: 0, pending_training: 0 });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // 1. Fetch Current User Name
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let userRef = ref(database, `user_info/mswd/${user.uid}`);
        let snapshot = await get(userRef);

        if (snapshot.exists() && snapshot.val().name) {
          setUserName(snapshot.val().name);
        } else {
          userRef = ref(database, `user_info/superadmin/${user.uid}`);
          snapshot = await get(userRef);
          if (snapshot.exists() && snapshot.val().name) {
            setUserName(snapshot.val().name);
          } else {
            setUserName(user.displayName || 'Admin');
          }
        }
      }
    });

    // 2. Fetch User Demographics (Modified to RETURN data instead of setting state directly)
    const fetchDemographics = async () => {
      try {
        const [psSnap, ctSnap, mswdSnap] = await Promise.all([
          get(ref(database, 'user_info/partially_sighted')),
          get(ref(database, 'user_info/caretaker')),
          get(ref(database, 'user_info/mswd'))
        ]);

        const psData = psSnap.exists() ? psSnap.val() : {};
        const ctData = ctSnap.exists() ? ctSnap.val() : {};
        const mswdData = mswdSnap.exists() ? mswdSnap.val() : {};

        const psCount = Object.keys(psData).length;
        const ctCount = Object.keys(ctData).length;
        const mswdCount = Object.keys(mswdData).length;
        
        let pendingCaretakers = 0;
        Object.values(ctData).forEach(user => {
          if (user.approved === false && user.rejected !== true) {
            pendingCaretakers++;
          }
        });

        return {
          total: psCount + ctCount + mswdCount,
          partially_sighted: psCount,
          caretakers: ctCount,
          mswd: mswdCount,
          pending: pendingCaretakers
        };
      } catch (error) {
        console.error("Error fetching demographics:", error);
        return null;
      }
    };

    // 3. Fetch AI Model & Vision Data (Modified to RETURN data)
    const fetchVisionData = async () => {
      try {
        const [objSnap, faceSnap, scanSnap] = await Promise.all([
          get(ref(database, 'detected_objects')),
          get(ref(database, 'detected_faces')),
          get(ref(database, 'scanned_texts'))
        ]);

        let objCount = 0;
        let faceCount = 0;
        let scanCount = 0;

        if (objSnap.exists()) {
          Object.values(objSnap.val()).forEach(userDetections => objCount += Object.keys(userDetections).length);
        }
        if (faceSnap.exists()) {
          Object.values(faceSnap.val()).forEach(userFaces => faceCount += Object.keys(userFaces).length);
        }
        if (scanSnap.exists()) {
          Object.values(scanSnap.val()).forEach(userScans => scanCount += Object.keys(userScans).length);
        }

        return {
          objects_detected: objCount,
          faces_registered: faceCount,
          scans_completed: scanCount,
          pending_training: objCount + faceCount 
        };
      } catch (error) {
        console.error("Error fetching vision data:", error);
        return null;
      }
    };

    // 4. Fetch Recent Platform Activity (Modified to RETURN data)
    const fetchActivities = async () => {
      try {
        const activitiesQuery = query(ref(database, 'activity_logs'), limitToLast(4));
        const snapshot = await get(activitiesQuery);
        
        if (snapshot.exists()) {
          const acts = [];
          snapshot.forEach((childSnapshot) => {
            acts.push({ id: childSnapshot.key, ...childSnapshot.val() });
          });
          return acts.reverse();
        }
        return [];
      } catch (error) {
        console.error("Error fetching activities:", error);
        return [];
      }
    };

    // 5. THE FIX: Load everything simultaneously, THEN update the UI all at once
    const loadAllDashboardData = async () => {
      const [demoData, visionData, activitiesData] = await Promise.all([
        fetchDemographics(),
        fetchVisionData(),
        fetchActivities()
      ]);

      // React will batch these state updates together. 
      // All components will receive their target numbers at the exact same millisecond.
      if (demoData) setStats(demoData);
      if (visionData) setVisionStats(visionData);
      if (activitiesData) setRecentActivities(activitiesData);
    };

    loadAllDashboardData();

    return () => unsubscribe();
  }, []);

  return (
    <div className="main-content">
      
      {/* --- HEADER --- */}
      <h1 className="page-title">
        {userName ? `Hello, ${userName}!` : 'System Dashboard'}
      </h1>
      
      <div className="header-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
        Platform Overview
      </div>

      <p className="page-subtitle">
        A real-time overview of user registrations, platform activity, and AI model training data.
      </p>

      {/* --- USER DEMOGRAPHICS GRID --- */}
      <h3 className="section-title">User Demographics</h3>
      <div className="stats-grid">
        
        <div className="unified-card">
          <div className="stat-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Total Users
          </div>
          <div className="stat-value"><AnimatedNumber value={stats.total} /></div>
        </div>

        <div className="unified-card">
          <div className="stat-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Partially Sighted
          </div>
          <div className="stat-value"><AnimatedNumber value={stats.partially_sighted} /></div>
        </div>

        <div className="unified-card">
          <div className="stat-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Caretakers
          </div>
          <div className="stat-value"><AnimatedNumber value={stats.caretakers} /></div>
        </div>

        <div className="unified-card">
          <div className="stat-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            MSWD / Admins
          </div>
          <div className="stat-value"><AnimatedNumber value={stats.mswd} /></div>
        </div>
      </div>

      {/* --- AI & VISION DATA GRID --- */}
      <h3 className="section-title">AI Model & Vision Data</h3>
      <div className="vision-grid">
        
        <div className="unified-card">
          <div className="stat-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            Detected Objects
          </div>
          <div className="stat-value"><AnimatedNumber value={visionStats.objects_detected} /></div>
        </div>

        <div className="unified-card">
          <div className="stat-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><rect x="7" y="7" width="10" height="10" rx="2"></rect></svg>
            Faces Registered
          </div>
          <div className="stat-value"><AnimatedNumber value={visionStats.faces_registered} /></div>
        </div>

        <div className="unified-card">
          <div className="stat-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Texts Scanned
          </div>
          <div className="stat-value"><AnimatedNumber value={visionStats.scans_completed} /></div>
        </div>
      </div>

      {/* --- BOTTOM CONTENT GRID --- */}
      <h3 className="section-title">Action Required</h3>
      <div className="content-grid">
        
        {/* Left Column - Actions */}
        <div className="flex-column-gap">
          
          {/* Caretaker Approvals */}
          <div className="unified-card align-top">
            <div className="action-req-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              {stats.pending > 0 ? `${stats.pending} Pending Caretaker Approvals` : 'No Pending Approvals'}
            </div>
            <div className="action-req-desc">
              {stats.pending > 0 
                ? 'There are new caretaker accounts waiting for verification. Please review their submitted details and approve or reject them to grant platform access.'
                : 'All caretaker registrations have been reviewed. No immediate action is required at this time.'}
            </div>
            <div>
              <button onClick={() => setActiveView && setActiveView('user_management')} className="btn-outline">
                Go to User Management
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </div>

          {/* Model Training Queue */}
          <div className="unified-card align-top">
            <div className="action-req-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><circle cx="12" cy="12" r="4"></circle></svg>
              {visionStats.pending_training > 0 ? `${visionStats.pending_training} Datasets Ready for Training` : 'Model Training Queue'}
            </div>
            <div className="action-req-desc">
              {visionStats.pending_training > 0 
                ? 'New caretaker faces and custom objects have been uploaded. Review these images to train the TensorFlow Lite model and push updates to the mobile application.'
                : 'The YOLO algorithm and TensorFlow Lite models are up to date with the latest user-provided data.'}
            </div>
            <div>
              <button onClick={() => setActiveView && setActiveView('model_training')} className="btn-primary">
                Manage Model Training
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Status & Activity */}
        <div className="flex-column-gap">
          {/* Recent Activity */}
          <div className="unified-card align-top">
            <div className="activity-header">
              <h3>Recent Platform Activity</h3>
              <span onClick={() => setActiveView && setActiveView('activity_logs')}>View All</span>
            </div>
            
            <div className="activity-feed">
              {recentActivities.length > 0 ? (
                recentActivities.map((act) => (
                  <div key={act.id} className="activity-item">
                    <div className="activity-dot"></div>
                    <div>
                      <div className="activity-title">
                        {act.action?.replace(/_/g, ' ')}
                      </div>
                      <div className="activity-desc">
                        {act.details}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="activity-empty">No recent activity to display.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DashboardContent;