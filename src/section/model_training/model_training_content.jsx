import React, { useState, useRef } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import '../../styles/model_training.css'; 

function ModelTraining({ activeStep, setActiveStep, logActivity }) {
  
  // The key is successfully loaded from Vite here
  const roboflowApiKey = import.meta.env.VITE_ROBOFLOW_API_KEY || "wtru0Ykkig3JX15h70VZ";

  const roboflowObjectLink = "https://app.roboflow.com/seelais-workspace/seelai-objects-s7rir/3/";
  const roboflowFaceLink = "https://app.roboflow.com/seelais-workspace/seelai-face-eordb/";
  const kaggleLink = "https://www.kaggle.com/";

  // The summarized Kaggle notebook script for UI display
  const notebookCode = `# SEELAI: YOLOv8 Training Pipeline (Overview)
# Note: Download the full notebook below for complete execution.

# 1. Setup Environment & Dependencies
!pip install --upgrade ultralytics roboflow

# 2. Authenticate & Download Custom Dataset
from roboflow import Roboflow
rf = Roboflow(api_key="${roboflowApiKey}")
dataset = version.download("yolov8")

# 3. Train YOLOv8 Nano Model
!yolo task=detect mode=train model=yolov8n.pt epochs=120 imgsz=640

# 4. Evaluate Model Metrics
# (Generates Confusion Matrix, mAP Graphs, Precision/Recall)

# 5. Export to TFLite (INT8 Quantized for Mobile App)
!yolo export format=tflite optimize=True int8=True

# 6. Download Mobile Model
# (Exports best_int8.tflite for deployment)`;

  const [selectedFiles, setSelectedFiles] = useState([]); 
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // States for Tutorials
  const [tutorialStep1, setTutorialStep1] = useState(0);
  const [tutorialStep2, setTutorialStep2] = useState(0);
  const [tutorialStep3, setTutorialStep3] = useState(0);

  const tutorialDataStep1 = [
    { image: '/assets/tutorial_1.jpg', title: 'Find Your Uploads', desc: 'Under the Unassigned column, click Annotate Images to begin labeling your newly uploaded dataset.' },
    { image: '/assets/tutorial_2.jpg', title: 'Choose Labeling Method', desc: 'When prompted, select Label Myself to manually annotate your dataset using the built-in tools.' },
    { image: '/assets/tutorial_3.jpg', title: 'Start the Job', desc: 'Under the Annotating column, click Start Annotating -> to open the image editor.' },
    { image: '/assets/tutorial_4.jpg', title: 'Draw Bounding Boxes', desc: 'Select the Bounding Box tool from the right toolbar to start drawing tight rectangles around the objects.' },
    { image: '/assets/tutorial_5.jpg', title: 'Assign Classes', desc: 'Type the correct class name (e.g., Takure) into the Annotation Editor and click Save (Enter).' },
    { image: '/assets/tutorial_6.jpg', title: 'Add to Dataset', desc: 'Click Add to Dataset, review your Train/Valid/Test split, and confirm to add the images to your pipeline.' }
  ];

  const tutorialDataStep2 = [
    { image: '/assets/tutorial_1.1.jpg', title: 'Enable GPU Acceleration', desc: 'Navigate to Settings > Accelerator and select a GPU (e.g., GPU T4 x2) to speed up training in Kaggle.' },
    { image: '/assets/tutorial_2.1.jpg', title: 'Hardware Check', desc: 'Run the !nvidia-smi cell to confirm your Kaggle notebook is successfully connected to the GPU.' },
    { image: '/assets/tutorial_3.1.jpg', title: 'Install Dependencies', desc: 'Execute this cell to configure your working directory and install the Ultralytics framework.' },
    { image: '/assets/tutorial_4.1.jpg', title: 'Download Custom Dataset', desc: 'Securely pull your augmented images and format them perfectly for YOLOv8 using Roboflow.' },
    { image: '/assets/tutorial_5.1.jpg', title: 'Custom Training', desc: 'Execute this cell to begin the official training loop for the YOLOv8 Nano model.' },
    { image: '/assets/tutorial_6.1.jpg', title: 'Visualize Confusion Matrix', desc: 'Evaluate misclassifications and see exactly what your model is getting right or confused about.' },
    { image: '/assets/tutorial_7.1.jpg', title: 'Review Training Metrics', desc: 'Check the Loss and Accuracy graphs. Downward loss and upward mAP indicate active learning.' },
    { image: '/assets/tutorial_8.1.jpg', title: 'Validation Predictions', desc: 'A visual sanity check to manually confirm bounding boxes and confidence scores.' },
    { image: '/assets/tutorial_9.1.jpg', title: 'Print Overall Metrics', desc: 'Run a final definitive evaluation against your validation dataset to check Total mAP@50.' },
    { image: '/assets/tutorial_10.1.jpg', title: 'Export to TFLite', desc: 'Convert the model into a lightweight format with INT8 quantization for seamless mobile integration.' }
  ];

  // UPDATED STEP 3 TUTORIAL DATA
  const tutorialDataStep3 = [
    { image: '/assets/deploy_1.png', title: 'Prepare Your Files', desc: 'Locate the exported best_int8.tflite model and your labels.txt file from the Kaggle working directory.' },
    { image: '/assets/deploy_2.png', title: 'Select for Deployment', desc: 'Click the upload zone or drag and drop your files. Both files are required for the mobile app to function.' },
    { image: '/assets/deploy_3.png', title: 'Deploy to Drive', desc: 'Click Deploy to securely upload the quantized models to your connected Google Drive storage.' }
  ];

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      setUploadStatus(''); 
      if (logActivity) logActivity(`Selected ${files.length} file(s) for deployment`);
    }
  };

  const nextStep = () => setActiveStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 1));

  const loginAndUpload = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.file',
    onSuccess: async (tokenResponse) => {
      setIsUploading(true);
      let successCount = 0;

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadStatus(`Uploading ${file.name} (${i + 1} of ${selectedFiles.length})...`);
        
        const success = await uploadSingleFile(tokenResponse.access_token, file);
        if (success) successCount++;
      }

      setIsUploading(false);
      
      if (successCount === selectedFiles.length) {
        setUploadStatus('Deployment Successful!');
      } else {
        setUploadStatus(`Finished with errors. ${successCount}/${selectedFiles.length} uploaded.`);
      }
    },
    onError: () => {
      setUploadStatus('Authentication Failed. Please try again.');
      setIsUploading(false);
    },
  });

  const uploadSingleFile = async (accessToken, fileToUpload) => {
    const FOLDER_ID = "1PhAuBbUcgLcMEoUnQoU0vHTBMv4KoQMl"; 

    try {
      const uploadRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=media',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/octet-stream', 
          },
          body: fileToUpload,
        }
      );
      
      const fileData = await uploadRes.json();

      await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}?addParents=${FOLDER_ID}&removeParents=root`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: fileToUpload.name }),
      });

      if(logActivity) logActivity(`Deployed ${fileToUpload.name} to designated Drive folder`);
      return true; 
      
    } catch (error) {
      console.error(`Failed to upload ${fileToUpload.name}:`, error);
      return false; 
    }
  };

  return (
    <div style={{ height: '100%', overflowY: 'hidden', width: '100%' }}>
      <div className="main-content wizard-page-wrapper" style={{ paddingBottom: '16px' }}>
        
        <div className="header-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          ML Pipeline
        </div>
        <h1 className="page-title">Manage YOLOv8 Model</h1>
        <p className="page-subtitle">Follow this step-by-step process to annotate data, train the model, and push the latest .tflite weights to storage.</p>

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

        <div className="step-content-container" key={activeStep}>
          
          {/* STEP 1 */}
          {activeStep === 1 && (
            <div className="action-card active glassy-card">
              <div className="split-content-layout">
                
                {/* Step 1 Left Column */}
                <div className="split-info-col">
                  <div className="card-header">
                    <div className="card-title">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      Step 1: Annotate Data
                    </div>
                  </div>
                  <div className="card-desc">
                    Review user uploads and draw bounding boxes for accuracy. Select a dataset below to begin editing. If you are new to this process, flip through the quick tutorial.
                  </div>

                  <div className="dataset-btn-container">
                    <button 
                      className="dataset-card-btn"
                      onClick={() => {
                        if(logActivity) logActivity("Opened Roboflow: Objects");
                        window.open(roboflowObjectLink, '_blank');
                      }}
                    >
                      <div className="icon-wrapper">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                      </div>
                      <div className="text-wrapper">
                        <div className="btn-header">
                          <span className="btn-title">Objects Dataset</span>
                          <span className="btn-badge">Everyday Items</span>
                        </div>
                        <p className="btn-explanation">
                          Trains the model to detect environmental hazards, household tools, and navigational landmarks to assist the user safely.
                        </p>
                      </div>
                    </button>

                    <button 
                      className="dataset-card-btn"
                      onClick={() => {
                        if(logActivity) logActivity("Opened Roboflow: Faces");
                        window.open(roboflowFaceLink, '_blank');
                      }}
                    >
                      <div className="icon-wrapper">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                      <div className="text-wrapper">
                        <div className="btn-header">
                          <span className="btn-title">Faces Dataset</span>
                          <span className="btn-badge">Caretaker Profiles</span>
                        </div>
                        <p className="btn-explanation">
                          Isolated for privacy. Trains the model to securely recognize authorized caretakers, family, and frequent visitors.
                        </p>
                      </div>
                    </button>
                  </div>
                  
                  <div className="dataset-explanation">
                    <h4 className="dataset-explanation-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      Dataset Context
                    </h4>
                    <p>
                      <strong>Objects:</strong> Trains the model to detect environmental hazards, household tools, and navigational landmarks to assist the user safely.
                    </p>
                    <p>
                      <strong>Faces:</strong> Isolated for privacy. Trains the model to securely recognize authorized caretakers, family, and frequent visitors.
                    </p>
                  </div>
                </div>

                {/* Step 1 Right Column (Tutorial) */}
                <div className="tutorial-container">
                  <div className="tutorial-image-wrapper">
                    <img src={tutorialDataStep1[tutorialStep1].image} alt={`Tutorial step ${tutorialStep1 + 1}`} className="tutorial-image" />                      
                    <div className="tutorial-overlay">
                      <span className="tutorial-badge">Step {tutorialStep1 + 1} of {tutorialDataStep1.length}</span>
                    </div>
                  </div>
                  <div className="tutorial-controls">
                    <button className="icon-btn" onClick={() => setTutorialStep1(Math.max(0, tutorialStep1 - 1))} disabled={tutorialStep1 === 0}>
                        ←
                    </button>
                    <div className="tutorial-text">
                        <h4>{tutorialDataStep1[tutorialStep1].title}</h4>
                        <p>{tutorialDataStep1[tutorialStep1].desc}</p>
                    </div>
                    <button className="icon-btn" onClick={() => setTutorialStep1(Math.min(tutorialDataStep1.length - 1, tutorialStep1 + 1))} disabled={tutorialStep1 === tutorialDataStep1.length - 1}>
                        →
                    </button>
                  </div>
                  <div className="carousel-dots">
                    {tutorialDataStep1.map((_, idx) => (
                        <div key={idx} className={`dot ${idx === tutorialStep1 ? 'active' : ''}`} onClick={() => setTutorialStep1(idx)}></div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2 */}
          {activeStep === 2 && (
            <div className="action-card active glassy-card">
              <div className="split-content-layout">
                
                {/* Step 2 Left Column (Code Block) */}
                <div className="split-info-col">
                  <div className="card-header">
                    <div className="card-title">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                      Step 2: Train Model in Kaggle
                    </div>
                  </div>
                  <div className="card-desc" style={{ marginBottom: '0' }}>
                    Download the notebook and import it into Kaggle, or copy the code below. Connect to a GPU to speed up training.
                  </div>

                  <div className="mac-window">
                    <div className="mac-header">
                      <div className="mac-buttons">
                        <span className="mac-dot close"></span>
                        <span className="mac-dot minimize"></span>
                        <span className="mac-dot maximize"></span>
                      </div>
                      <span className="mac-title">seelai_model_training.py</span>
                    </div>
                    
                    <pre className="colab-code-block solid-code">
                      {notebookCode.split('\n').map((line, i) => (
                        <div key={i} className="code-line">
                          <span className="line-number">{i + 1}</span>
                          <span className="line-content">{line}</span>
                        </div>
                      ))}
                    </pre>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', alignSelf: 'flex-start' }}>
                    <a 
                      href="/assets/yolo_objects.ipynb" 
                      download="yolo_objects.ipynb"
                      className="robo-btn secondary-glass-btn"
                      onClick={() => { if(logActivity) logActivity("Downloaded Kaggle Notebook"); }}
                      style={{ textDecoration: 'none' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Download Notebook
                    </a>
                    
                    <button 
                      className="robo-btn primary-glass-btn"
                      onClick={() => {
                        if(logActivity) logActivity("Opened Kaggle");
                        window.open(kaggleLink, '_blank');
                      }}
                    >
                      Open Kaggle
                    </button>
                  </div>
                </div>

                {/* Step 2 Right Column (Tutorial) */}
                <div className="tutorial-container">
                  <div className="tutorial-image-wrapper">
                    <img src={tutorialDataStep2[tutorialStep2].image} alt={`Tutorial step ${tutorialStep2 + 1}`} className="tutorial-image" />                      
                    <div className="tutorial-overlay">
                      <span className="tutorial-badge">Step {tutorialStep2 + 1} of {tutorialDataStep2.length}</span>
                    </div>
                  </div>
                  <div className="tutorial-controls">
                    <button className="icon-btn" onClick={() => setTutorialStep2(Math.max(0, tutorialStep2 - 1))} disabled={tutorialStep2 === 0}>
                        ←
                    </button>
                    <div className="tutorial-text">
                        <h4>{tutorialDataStep2[tutorialStep2].title}</h4>
                        <p>{tutorialDataStep2[tutorialStep2].desc}</p>
                    </div>
                    <button className="icon-btn" onClick={() => setTutorialStep2(Math.min(tutorialDataStep2.length - 1, tutorialStep2 + 1))} disabled={tutorialStep2 === tutorialDataStep2.length - 1}>
                        →
                    </button>
                  </div>
                  <div className="carousel-dots">
                    {tutorialDataStep2.map((_, idx) => (
                        <div key={idx} className={`dot ${idx === tutorialStep2 ? 'active' : ''}`} onClick={() => setTutorialStep2(idx)}></div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3 */}
          {activeStep === 3 && (
            <div className="action-card active glassy-card">
              <div className="split-content-layout">
                
                {/* Step 3 Left Column */}
                <div className="split-info-col">
                  <div className="card-header">
                    <div className="card-title">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      Step 3: Upload & Deploy
                    </div>
                  </div>
                  <div className="card-desc">
                    Select your exported <strong>.tflite</strong> model and <strong>labels.txt</strong> file, then click deploy to push them to Google Drive.
                  </div>
                  
                  <div 
                    className="custom-upload-zone glassy-upload"
                    onClick={() => !isUploading && fileInputRef.current.click()}
                    style={{ opacity: isUploading ? 0.6 : 1, cursor: isUploading ? 'not-allowed' : 'pointer' }}
                  >
                    <input 
                      type="file" 
                      multiple 
                      accept=".tflite,.txt" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    
                    <div className="upload-btn primary-solid-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      Browse Files
                    </div>
                    
                    <div className="upload-text">
                      {selectedFiles.length > 0 ? (
                        <div style={{ color: 'var(--text-main)', fontWeight: '600' }}>
                          {selectedFiles.length} file(s) selected:
                          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', textAlign: 'left', fontWeight: 'normal' }}>
                            {selectedFiles.map((f, index) => <li key={index}>{f.name}</li>)}
                          </ul>
                        </div>
                      ) : (
                        "or drag and drop files here"
                      )}
                    </div>
                  </div>

                  {uploadStatus && (
                    <div style={{ marginTop: '16px', textAlign: 'center', fontWeight: 'bold', color: uploadStatus.includes('Error') || uploadStatus.includes('Failed') ? 'red' : 'var(--primary)' }}>
                      {uploadStatus}
                    </div>
                  )}

                  <div className="tip-card glassy-tip">
                    <div className="tip-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <div className="tip-content">
                      <div className="tip-title">Pro tip</div>
                      <div className="tip-desc">
                        Hold down <strong>Ctrl</strong> (Windows) or <strong>Cmd</strong> (Mac) when selecting files to upload both the model and labels mapping file at the same time.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 Right Column (Tutorial) */}
                <div className="tutorial-container">
                  <div className="tutorial-image-wrapper">
                    <img src={tutorialDataStep3[tutorialStep3].image} alt={`Tutorial step ${tutorialStep3 + 1}`} className="tutorial-image" />                      
                    <div className="tutorial-overlay">
                      <span className="tutorial-badge">Step {tutorialStep3 + 1} of {tutorialDataStep3.length}</span>
                    </div>
                  </div>
                  <div className="tutorial-controls">
                    <button className="icon-btn" onClick={() => setTutorialStep3(Math.max(0, tutorialStep3 - 1))} disabled={tutorialStep3 === 0}>
                        ←
                    </button>
                    <div className="tutorial-text">
                        <h4>{tutorialDataStep3[tutorialStep3].title}</h4>
                        <p>{tutorialDataStep3[tutorialStep3].desc}</p>
                    </div>
                    <button className="icon-btn" onClick={() => setTutorialStep3(Math.min(tutorialDataStep3.length - 1, tutorialStep3 + 1))} disabled={tutorialStep3 === tutorialDataStep3.length - 1}>
                        →
                    </button>
                  </div>
                  <div className="carousel-dots">
                    {tutorialDataStep3.map((_, idx) => (
                        <div key={idx} className={`dot ${idx === tutorialStep3 ? 'active' : ''}`} onClick={() => setTutorialStep3(idx)}></div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}
  
          <div className="wizard-actions">
            <button 
              className="btn-back" 
              onClick={prevStep}
              style={{ visibility: activeStep === 1 || isUploading ? 'hidden' : 'visible' }}
            >
              Back
            </button>
            
            {activeStep < 3 ? (
              <button className="btn-next primary-solid-btn" onClick={nextStep}>
                Next Step
              </button>
            ) : uploadStatus === 'Deployment Successful!' ? (
              <button 
                className="btn-next primary-solid-btn" 
                onClick={() => {
                  setSelectedFiles([]);
                  setUploadStatus('');
                  alert("Deployment Complete! The models are ready.");
                }}
              >
                Deploy Again!
              </button>
            ) : (
              <button 
                className="btn-next primary-solid-btn" 
                disabled={selectedFiles.length === 0 || isUploading}
                style={{ opacity: (selectedFiles.length === 0 || isUploading) ? 0.5 : 1 }}
                onClick={() => loginAndUpload()}
              >
                {isUploading ? 'Deploying...' : 'Deploy to Drive'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default ModelTraining;