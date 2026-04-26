import React, { useState, useRef } from 'react';
import '../../styles/model_training.css'; 

function ModelTraining({ activeStep, setActiveStep, logActivity }) {
  const roboflowObjectLink = "https://app.roboflow.com/seelai/seelai-objects/annotate";
  const roboflowFaceLink = "https://app.roboflow.com/seelai/seelai-face/annotate";
  const colabLink = "https://colab.research.google.com/";

  const [selectedFileName, setSelectedFileName] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      if (logActivity) logActivity(`Selected model file: ${file.name}`);
    }
  };

  const nextStep = () => setActiveStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 1));

  return (
    <div style={{ height: '100%', overflowY: 'auto', width: '100%' }}>
      <div className="main-content" style={{ paddingBottom: '100px' }}>
        
        <div className="header-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          ML Pipeline
        </div>
        <h1 className="page-title">Manage YOLOv8 Model</h1>
        <p className="page-subtitle">Follow this step-by-step process to annotate data, train the model, and push the latest .tflite weights to storage.</p>

        {/* --- WIZARD STEPPER UI --- */}
        <div className="wizard-stepper">
          <div className={`step-indicator ${activeStep >= 1 ? (activeStep > 1 ? 'completed' : 'active') : ''}`}>
            <div className="step-circle">1</div>
            <span>Annotate</span>
          </div>
          <div className={`step-line ${activeStep >= 2 ? 'active' : ''}`}></div>
          
          <div className={`step-indicator ${activeStep >= 2 ? (activeStep > 2 ? 'completed' : 'active') : ''}`}>
            <div className="step-circle">2</div>
            <span>Train Model</span>
          </div>
          <div className={`step-line ${activeStep >= 3 ? 'active' : ''}`}></div>

          <div className={`step-indicator ${activeStep === 3 ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <span>Deploy</span>
          </div>
        </div>

        {/* --- DYNAMIC STEP CONTENT --- */}
        <div className="step-content-container" key={activeStep}>
          
          {/* STEP 1: ANNOTATE */}
          {activeStep === 1 && (
            <div className="action-card active">
              <div className="card-header">
                <div className="card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Step 1: Annotate Data
                </div>
              </div>
              <div className="card-desc">
                Select a dataset to review user uploads and manually draw bounding boxes for accuracy. Ensure all new objects and faces are correctly labeled before moving to the training phase.
              </div>
              
              <div className="robo-btn-group" style={{ marginBottom: '24px' }}>
                <button 
                  className="robo-btn"
                  onClick={() => {
                    if(logActivity) logActivity("Opened Roboflow: Objects");
                    window.open(roboflowObjectLink, '_blank');
                  }}
                >
                  Edit Objects Dataset
                </button>
                <button 
                  className="robo-btn"
                  onClick={() => {
                    if(logActivity) logActivity("Opened Roboflow: Faces");
                    window.open(roboflowFaceLink, '_blank');
                  }}
                >
                  Edit Faces Dataset
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TRAIN */}
          {activeStep === 2 && (
            <div className="action-card active">
              <div className="card-header">
                <div className="card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  Step 2: Train Model in Colab
                </div>
              </div>
              <div className="card-desc" style={{ marginBottom: '0' }}>
                Create a new notebook in Google Colab, connect to a T4 GPU, and use the following code to train your YOLOv8 model and export it to a format the mobile app can read.
              </div>

              <div className="colab-code-block">
                <span className="code-comment"># 1. Install dependencies</span><br/>
                !pip install ultralytics roboflow<br/><br/>

                <span className="code-comment"># 2. Import YOLO and load pre-trained weights</span><br/>
                <span className="code-keyword">from</span> ultralytics <span className="code-keyword">import</span> YOLO<br/>
                model = YOLO(<span className="code-string">'yolov8n.pt'</span>)<br/><br/>

                <span className="code-comment"># 3. Train the model (replace with your dataset YAML)</span><br/>
                results = model.train(data=<span className="code-string">'dataset/data.yaml'</span>, epochs=<span className="code-string">50</span>, imgsz=<span className="code-string">640</span>)<br/><br/>
                
                <span className="code-comment"># 4. Export specifically to TensorFlow Lite for the mobile assistant</span><br/>
                model.export(format=<span className="code-string">'tflite'</span>)
              </div>
              
              <button 
                className="robo-btn"
                style={{ alignSelf: 'flex-start', padding: '10px 24px' }}
                onClick={() => {
                  if(logActivity) logActivity("Opened Colab");
                  window.open(colabLink, '_blank');
                }}
              >
                Open Google Colab
              </button>
            </div>
          )}

          {/* STEP 3: DEPLOY */}
          {activeStep === 3 && (
            <div className="action-card active">
              <div className="card-header">
                <div className="card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Step 3: Upload & Deploy
                </div>
              </div>
              <div className="card-desc">
                After downloading the exported <strong>.tflite</strong> file from Colab, upload it here to push it to Firebase/Google Drive. The application will fetch these updated weights on the next launch.
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

              {/* Pro Tip Banner specifically for Step 3 */}
              <div className="tip-card" style={{ marginTop: '24px' }}>
                <div className="tip-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div className="tip-content">
                  <div className="tip-title">Pro tip</div>
                  <div className="tip-desc">
                    Ensure the labels mapping file (<code>labels.txt</code>) is also updated if you added new classes during the annotation phase.
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* --- WIZARD NAVIGATION FOOTER --- */}
          <div className="wizard-actions">
            <button 
              className="btn-back" 
              onClick={prevStep}
              style={{ visibility: activeStep === 1 ? 'hidden' : 'visible' }}
            >
              Back
            </button>
            
            {activeStep < 3 ? (
              <button className="btn-next" onClick={nextStep}>
                Next Step
              </button>
            ) : (
              <button className="btn-next" onClick={() => {
                if(logActivity && selectedFileName) logActivity("Deployed new model to storage");
                alert("Model deployment initiated!");
              }}>
                Complete Deployment
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default ModelTraining;