import React, { useState, useRef } from 'react';
import '../../styles/model_training.css'; 

function ModelTraining({ activeStep, setActiveStep, logActivity }) {
  const roboflowObjectLink = "https://app.roboflow.com/seelai/seelai-objects/annotate";
  const roboflowFaceLink = "https://app.roboflow.com/seelai/seelai-face/annotate";
  const colabLink = "https://colab.research.google.com/";

  // State to hold the selected file name for UI feedback
  const [selectedFileName, setSelectedFileName] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      if (logActivity) logActivity(`Selected model file: ${file.name}`);
    }
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', width: '100%' }}>
      <div className="main-content" style={{ paddingBottom: '100px' }}>
        
        <div className="header-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          ML Pipeline
        </div>
        <h1 className="page-title">Manage YOLOv8 Model</h1>
        <p className="page-subtitle">Annotate object detection data, train your models in the cloud, and push the latest .tflite weights directly to the Flutter application.</p>

        {/* --- STEP 1 & 2 --- */}
        <h3 className="step-section-title">Step 1 & 2: Data & Training</h3>
        
        {/* Placed Step 1 and Step 2 inside a 2-column grid so they sit side-by-side */}
        <div className="cards-grid-2">
          
          {/* Card 1: Annotate Data */}
          <div className={`action-card ${activeStep === 1 ? 'active' : ''}`} onClick={() => setActiveStep(1)}>
            <div className="card-header">
              <div className="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Annotate Data
              </div>
              <div className="check-circle">
                {activeStep === 1 && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
            </div>
            <div className="card-desc">
              Select a dataset to review user uploads and manually draw bounding boxes for accuracy.
            </div>
            
            <div className="robo-btn-group">
              <button 
                className="robo-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStep(1);
                  if(logActivity) logActivity("Opened Roboflow: Objects");
                  window.open(roboflowObjectLink, '_blank');
                }}
              >
                Edit Objects
              </button>
              <button 
                className="robo-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStep(1);
                  if(logActivity) logActivity("Opened Roboflow: Faces");
                  window.open(roboflowFaceLink, '_blank');
                }}
              >
                Edit Faces
              </button>
            </div>
          </div>

          {/* Card 2: Train Model */}
          <div className={`action-card ${activeStep === 2 ? 'active' : ''}`} onClick={() => setActiveStep(2)}>
            <div className="card-header">
              <div className="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                Train Model
              </div>
              <div className="check-circle">
                {activeStep === 2 && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
            </div>
            <div className="card-desc">
              Run YOLOv8 training scripts via Google Colab notebooks to generate new weights.
            </div>
            
            <div className="robo-btn-group">
              <button 
                className="robo-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStep(2);
                  if(logActivity) logActivity("Opened Colab");
                  window.open(colabLink, '_blank');
                }}
              >
                Open Google Colab
              </button>
            </div>
          </div>

        </div>

        {/* --- STEP 3 --- */}
        <h3 className="step-section-title">Step 3: App Deployment</h3>
        
        {/* Full width grid for Step 3 */}
        <div className="cards-grid-1">
          <div className={`action-card ${activeStep === 3 ? 'active' : ''}`} onClick={() => setActiveStep(3)}>
            <div className="card-header">
              <div className="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload to Firebase
              </div>
              <div className="check-circle">
                {activeStep === 3 && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
            </div>
            <div className="card-desc">
              Upload the compiled <strong>.tflite</strong> model. The Flutter app will automatically fetch this update on the next launch.
            </div>
            
            <div 
              className="custom-upload-zone"
              onClick={() => fileInputRef.current.click()}
            >
              <input 
                type="file" 
                accept=".tflite" 
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              <div className="upload-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Browse Files
              </div>
              
              <span className="upload-text">
                {selectedFileName ? (
                  <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{selectedFileName}</span>
                ) : (
                  "or drag and drop .tflite file here"
                )}
              </span>
            </div>
          </div>
        </div>

        {/* FULL WIDTH PRO TIP BANNER */}
        <div className="tip-card">
          <div className="tip-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div className="tip-content">
            <div className="tip-title">Pro tip</div>
            <div className="tip-desc">
              When you upload a new <strong>.tflite</strong> file, ensure the labels mapping file (<code>labels.txt</code>) is also updated if you added new object classes during the Roboflow annotation phase.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ModelTraining;