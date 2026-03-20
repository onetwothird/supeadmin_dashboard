import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { database, auth } from '../firebase';
import { ref, push, set, serverTimestamp } from 'firebase/database';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const primaryColor = '#8B5CF6';
  
  const roboflowLink = "https://app.roboflow.com/"; 
  const colabLink = "https://colab.research.google.com/";

  // --- SECURITY CHECK ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        navigate('/'); // Kick back to login if not authenticated
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // --- LOGGING & ACTIONS ---
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
      console.error("Failed to log activity:", error);
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

  const styles = {
    container: { padding: '40px', backgroundColor: '#F3F4F6', minHeight: '100vh', fontFamily: '"Inter", -apple-system, sans-serif', color: '#333', boxSizing: 'border-box' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', maxWidth: '1200px', margin: '0 auto 48px auto' },
    header: { fontSize: '32px', fontWeight: '800', margin: 0, color: '#111827', letterSpacing: '-0.02em' },
    subtitle: { fontSize: '16px', color: '#6B7280', margin: '8px 0 0 0' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' },
    card: { backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' },
    cardTitle: { fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px' },
    cardText: { fontSize: '15px', color: '#4B5563', lineHeight: '1.6', marginBottom: '32px', flexGrow: 1 },
    button: { backgroundColor: primaryColor, color: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '14px 20px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', width: '100%' },
    logoutBtn: { backgroundColor: '#FFFFFF', color: '#EF4444', border: '1.5px solid #FCA5A5', padding: '12px 24px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
    fileInputWrapper: { marginBottom: '24px', position: 'relative' },
    fileInput: { 
        fontSize: '14px', 
        color: '#4B5563', 
        cursor: 'pointer',
        width: '100%',
        padding: '10px',
        border: '1.5px dashed #D1D5DB',
        borderRadius: '12px',
        backgroundColor: '#F9FAFB',
        boxSizing: 'border-box'
    }
  };

  if (!currentUser) return <div>Loading...</div>;

  return (
    <>
      <style>
        {`
          /* GLOBAL CARET FIX */
          .unselectable-wrapper { user-select: none; -webkit-user-select: none; -ms-user-select: none; }
          .unselectable-wrapper input, .unselectable-wrapper button, .unselectable-wrapper a { user-select: auto; -webkit-user-select: auto; -ms-user-select: auto; }

          /* TIGHTER, SMOOTHER ANIMATIONS */
          @keyframes microFadeUp { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
          
          .stagger-1 { opacity: 0; animation: microFadeUp 0.4s ease-out 0.05s forwards; }
          .stagger-2 { opacity: 0; animation: microFadeUp 0.4s ease-out 0.1s forwards; }
          
          .modern-card { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
          .modern-card:hover { transform: translateY(-2px); box-shadow: 0 16px 32px -8px rgba(0,0,0,0.08) !important; border-color: #D1D5DB !important; }

          .modern-btn { transition: transform 0.2s ease, box-shadow 0.2s ease; }
          .modern-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px -4px rgba(139, 92, 246, 0.4) !important; }
          .modern-btn:active:not(:disabled) { transform: translateY(0); }

          .logout-btn { transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease; }
          .logout-btn:hover { background-color: #FEF2F2 !important; transform: translateY(-1px); box-shadow: 0 6px 16px -4px rgba(239, 68, 68, 0.2) !important; }
          
          input[type="file"]::file-selector-button { border: none; background: #8B5CF6; color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; margin-right: 12px; transition: background-color 0.2s ease, transform 0.2s ease; }
          input[type="file"]::file-selector-button:hover { background: #7C3AED; transform: translateY(-1px); }
        `}
      </style>

      {/* Applied the unselectable wrapper here */}
      <div className="unselectable-wrapper" style={styles.container}>
        <div style={styles.topBar} className="stagger-1">
          <div>
            <h2 style={styles.header}>IT Control Center</h2>
            <p style={styles.subtitle}>Manage the machine learning pipeline.</p>
          </div>
          <button style={styles.logoutBtn} className="logout-btn" onClick={handleLogout}>Log Out</button>
        </div>

        <div style={styles.grid} className="stagger-2">
          <div style={styles.card} className="modern-card">
            <div style={styles.cardTitle}>1. Annotate Data</div>
            <div style={styles.cardText}>Access the Roboflow workspace to upload new images and draw bounding boxes.</div>
            <button style={styles.button} className="modern-btn" onClick={() => { logActivity("Opened Roboflow"); window.open(roboflowLink, '_blank'); }}>Open Roboflow</button>
          </div>

          <div style={styles.card} className="modern-card">
            <div style={styles.cardTitle}>2. Train Model</div>
            <div style={styles.cardText}>Run the YOLO training script in the cloud.</div>
            <button style={styles.button} className="modern-btn" onClick={() => { logActivity("Opened Colab"); window.open(colabLink, '_blank'); }}>Open Google Colab</button>
          </div>

          <div style={styles.card} className="modern-card">
            <div style={styles.cardTitle}>3. Deploy Model</div>
            <div style={styles.cardText}>Upload the compiled .tflite file to update mobile apps.</div>
            <div style={styles.fileInputWrapper}>
                <input type="file" accept=".tflite" style={styles.fileInput} />
            </div>
            <button style={styles.button} className="modern-btn" onClick={() => logActivity("Uploaded Model")}>Upload to Firebase</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;