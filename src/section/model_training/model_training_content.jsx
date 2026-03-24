import React from 'react';

function ModelTraining({ activeStep, setActiveStep, userStats, logActivity }) {
  // Define both of your specific Roboflow project links
  const roboflowObjectLink = "https://app.roboflow.com/seelai/seelai-objects/annotate";
  const roboflowFaceLink = "https://app.roboflow.com/seelai/seelai-face/annotate";
  const colabLink = "https://colab.research.google.com/";

  return (
    <div className="main-content">
      <div className="header-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        ML Pipeline
      </div>
      <h1 className="page-title">Manage YOLOv8 Model</h1>
      <p className="page-subtitle">Annotate object detection data, train your models in the cloud, and push the latest .tflite weights directly to the Flutter application.</p>

      <div className="content-grid">
        
        {/* LEFT COLUMN: Actions */}
        <div>
          <div className="section-title">Step 1 & 2: Data & Training</div>
          <div className="cards-grid">
            
            {/* Roboflow Card - UPDATED FOR TWO LINKS */}
            <div className={`action-card ${activeStep === 1 ? 'active' : ''}`} onClick={() => setActiveStep(1)}>
              <div className="card-header">
                <div className="card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Annotate Data
                </div>
                <div className="check-circle">
                  {activeStep === 1 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              </div>
              <div className="card-desc" style={{ marginBottom: '12px' }}>
                Select a dataset to review uploads and draw bounding boxes.
              </div>
              
              {/* Added Two Buttons for Objects and Faces */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', cursor: 'pointer', fontWeight: '500', fontSize: '13px', color: '#374151' }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the card's onClick from misfiring
                    setActiveStep(1);
                    logActivity("Opened Roboflow: Objects");
                    window.open(roboflowObjectLink, '_blank');
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#f9fafb'}
                >
                  Edit Objects
                </button>
                <button 
                  style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', cursor: 'pointer', fontWeight: '500', fontSize: '13px', color: '#374151' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveStep(1);
                    logActivity("Opened Roboflow: Faces");
                    window.open(roboflowFaceLink, '_blank');
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#f9fafb'}
                >
                  Edit Faces
                </button>
              </div>
            </div>

            {/* Colab Card */}
            <div className={`action-card ${activeStep === 2 ? 'active' : ''}`} onClick={() => { setActiveStep(2); logActivity("Opened Colab"); window.open(colabLink, '_blank'); }}>
              <div className="card-header">
                <div className="card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  Train Model
                </div>
                <div className="check-circle">
                  {activeStep === 2 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              </div>
              <div className="card-desc">Run YOLOv8 training scripts via Google Colab notebooks.</div>
            </div>
          </div>

          <div className="section-title">Step 3: App Deployment</div>
          {/* Deploy Card */}
          <div className={`action-card ${activeStep === 3 ? 'active' : ''}`} onClick={() => setActiveStep(3)} style={{ cursor: 'default' }}>
            <div className="card-header">
              <div className="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload to Firebase
              </div>
              <div className="check-circle" style={{ cursor: 'pointer' }}>
                {activeStep === 3 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
            </div>
            <div className="card-desc">Upload the compiled `.tflite` model. The Flutter app will automatically fetch this update on the next launch.</div>
            
            <div className="file-upload-wrapper">
              <input type="file" accept=".tflite" className="file-input" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Info */}
        <div>
          <div className="info-card">
            <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 20px 0' }}>Live System Status</h3>
            <ul className="info-list">
              <li className="info-list-item">
                <div className="info-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                {userStats.total} Total Registered Users
              </li>
              <li className="info-list-item">
                <div className="info-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div>
                {userStats.partially_sighted} Partially Sighted Users
              </li>
              <li className="info-list-item">
                <div className="info-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></div>
                Active Model: YOLOv8 (v1.2)
              </li>
              <li className="info-list-item">
                <div className="info-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                Firebase Sync: Healthy
              </li>
            </ul>
          </div>

          <div className="tip-card">
            <div className="tip-title">Pro tip</div>
            <div className="tip-desc">
              When you upload a new <strong>.tflite</strong> file, ensure the labels mapping file (`labels.txt`) is also updated if you added new object classes during the Roboflow annotation phase.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ModelTraining;