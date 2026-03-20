//C:\seelai-web-dashboard\src\pages\admin_dashboard.jsx

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
    container: { padding: '40px', backgroundColor: '#FAFAFA', minHeight: '100vh', fontFamily: '"Inter", sans-serif', color: '#333' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    header: { fontSize: '28px', fontWeight: '700', margin: 0, color: '#111827' },
    subtitle: { fontSize: '16px', color: '#6B7280', margin: '8px 0 0 0' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1200px' },
    card: { backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column' },
    cardTitle: { fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' },
    cardText: { fontSize: '14px', color: '#4B5563', lineHeight: '1.5', marginBottom: '24px', flexGrow: 1 },
    button: { backgroundColor: primaryColor, color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '12px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', width: '100%' },
    logoutBtn: { backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    fileInput: { marginBottom: '16px', fontSize: '14px', color: '#4B5563' }
  };

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.header}>IT Control Center</h2>
          <p style={styles.subtitle}>Manage the machine learning pipeline.</p>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>1. Annotate Data</div>
          <div style={styles.cardText}>Access the Roboflow workspace to upload new images and draw bounding boxes.</div>
          <button style={styles.button} onClick={() => { logActivity("Opened Roboflow"); window.open(roboflowLink, '_blank'); }}>Open Roboflow</button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>2. Train Model</div>
          <div style={styles.cardText}>Run the YOLOv8 training script in the cloud.</div>
          <button style={styles.button} onClick={() => { logActivity("Opened Colab"); window.open(colabLink, '_blank'); }}>Open Google Colab</button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>3. Deploy Model</div>
          <div style={styles.cardText}>Upload the compiled .tflite file to update mobile apps.</div>
          <input type="file" accept=".tflite" style={styles.fileInput} />
          <button style={styles.button} onClick={() => logActivity("Uploaded Model")}>Upload to Firebase</button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;