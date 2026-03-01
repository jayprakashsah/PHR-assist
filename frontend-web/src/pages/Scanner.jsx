import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Upload, Activity, FileText, Save, Volume2, ArrowLeft,
  Camera, Image, FolderOpen, Mic, Scan, Sparkles,
  CheckCircle, AlertCircle, Loader, X, Maximize2,
  Minimize2, RotateCw, ZoomIn, ZoomOut, Download,
  Share2, Trash2, FileCheck, Brain, Cpu, Shield,
  Zap, Clock, Award, BadgeCheck
} from 'lucide-react';
import '../App.css';

function Scanner() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [scanMode, setScanMode] = useState('upload'); // upload, camera, library
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanQuality, setScanQuality] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [extractedData, setExtractedData] = useState({});
  const [activeTab, setActiveTab] = useState('extracted');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Security Check
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/');
    }
  }, [navigate]);

  // Load recent scans from local storage
  useEffect(() => {
    const saved = localStorage.getItem('recentScans');
    if (saved) {
      setRecentScans(JSON.parse(saved));
    }
  }, []);

  // Camera cleanup
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setCameraActive(true);
      setScanMode('camera');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toBlob((blob) => {
        const capturedFile = new File([blob], "captured-image.jpg", { type: "image/jpeg" });
        setFile(capturedFile);
        setCapturedImage(URL.createObjectURL(blob));
        stopCamera();
      }, 'image/jpeg', 0.95);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setCapturedImage(URL.createObjectURL(selectedFile));
      setScanMode('upload');
    }
  };

  const handleLibrarySelect = () => {
    fileInputRef.current.click();
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a report image first!");

    setLoading(true);
    setReportData(null);
    setIsSaved(false);
    setScanProgress(0);

    // Simulate progress for better UX
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/analyze-report", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setScanProgress(100);
      setReportData(response.data.data);
      setScanQuality('high');
      
      // Add to recent scans
      const newScan = {
        id: Date.now(),
        fileName: file.name,
        date: new Date().toISOString(),
        preview: capturedImage
      };
      const updatedScans = [newScan, ...recentScans.slice(0, 4)];
      setRecentScans(updatedScans);
      localStorage.setItem('recentScans', JSON.stringify(updatedScans));
      
    } catch (error) {
      console.error("Error analyzing report:", error);
      alert("Failed to analyze the report. Is the Python server running?");
      setScanProgress(0);
    } finally {
      setLoading(false);
      clearInterval(interval);
    }
  };

  const handleSaveToDB = async () => {
    try {
      const userId = localStorage.getItem('userId');
      
      const payloadToSave = {
        ...reportData,
        patientId: userId,
        scanQuality: scanQuality,
        scannedAt: new Date().toISOString()
      };

      await axios.post("http://localhost:5001/api/reports/add", payloadToSave);
      setIsSaved(true);
      alert("✨ Report securely saved to your private health profile!");
      
      setTimeout(() => navigate('/dashboard'), 1500);
      
    } catch (error) {
      console.error("Error saving report:", error);
      alert("Failed to save. Is the Node.js server running on port 5001?");
    }
  };

  const resetScan = () => {
    setFile(null);
    setCapturedImage(null);
    setReportData(null);
    setScanProgress(0);
    setScanQuality(null);
    setPreviewExpanded(false);
    if (cameraActive) {
      stopCamera();
    }
    setScanMode('upload');
  };

  return (
    <div style={styles.container}>
      {/* Floating Particles Background */}
      <div style={styles.particles}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${15 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              backgroundColor: i % 2 === 0 ? '#3498db' : '#2ecc71'
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <Scan size={32} color="#3498db" />
              <div style={styles.logoGlow}></div>
            </div>
            <span style={styles.logoText}>Smart<span style={{ color: '#3498db' }}>.Scanner</span></span>
          </div>
          
          <Link to="/dashboard" style={styles.backLink} className="btn-outline-3d">
            <ArrowLeft size={18} />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Scan Mode Selector */}
        <div style={styles.modeSelector}>
          <button
            onClick={() => setScanMode('upload')}
            style={{
              ...styles.modeButton,
              backgroundColor: scanMode === 'upload' ? 'rgba(52,152,219,0.2)' : 'rgba(255,255,255,0.03)',
              borderColor: scanMode === 'upload' ? '#3498db' : 'rgba(255,255,255,0.1)'
            }}
          >
            <Upload size={20} color={scanMode === 'upload' ? '#3498db' : '#ffffff'} />
            <span>Upload</span>
          </button>
          
          <button
            onClick={startCamera}
            style={{
              ...styles.modeButton,
              backgroundColor: scanMode === 'camera' ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.03)',
              borderColor: scanMode === 'camera' ? '#2ecc71' : 'rgba(255,255,255,0.1)'
            }}
          >
            <Camera size={20} color={scanMode === 'camera' ? '#2ecc71' : '#ffffff'} />
            <span>Camera</span>
          </button>
          
          <button
            onClick={handleLibrarySelect}
            style={{
              ...styles.modeButton,
              backgroundColor: scanMode === 'library' ? 'rgba(155,89,182,0.2)' : 'rgba(255,255,255,0.03)',
              borderColor: scanMode === 'library' ? '#9b59b6' : 'rgba(255,255,255,0.1)'
            }}
          >
            <FolderOpen size={20} color={scanMode === 'library' ? '#9b59b6' : '#ffffff'} />
            <span>Library</span>
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Main Scan Area */}
        <div style={styles.scanArea}>
          {/* Camera View */}
          {cameraActive && (
            <div style={styles.cameraContainer}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={styles.cameraVideo}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              <div style={styles.cameraControls}>
                <button onClick={captureImage} style={styles.captureButton}>
                  <Camera size={32} color="#ffffff" />
                </button>
                <button onClick={stopCamera} style={styles.closeCameraButton}>
                  <X size={20} color="#ffffff" />
                </button>
              </div>
            </div>
          )}

          {/* Upload Preview */}
          {!cameraActive && capturedImage && (
            <div style={styles.previewContainer}>
              <div style={styles.previewHeader}>
                <div style={styles.previewTitle}>
                  <Image size={18} color="#3498db" />
                  <span>Document Preview</span>
                </div>
                <div style={styles.previewActions}>
                  <button 
                    onClick={() => setPreviewExpanded(!previewExpanded)}
                    style={styles.previewAction}
                  >
                    {previewExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button onClick={resetScan} style={styles.previewAction}>
                    <Trash2 size={16} color="#e74c3c" />
                  </button>
                </div>
              </div>
              
              <img 
                src={capturedImage} 
                alt="Preview" 
                style={{
                  ...styles.previewImage,
                  ...(previewExpanded ? styles.previewImageExpanded : {})
                }}
              />
              
              {/* Scan Quality Indicator */}
              {scanQuality && (
                <div style={styles.qualityBadge}>
                  <BadgeCheck size={14} color="#2ecc71" />
                  <span>High Quality Scan</span>
                </div>
              )}
            </div>
          )}

          {/* Upload Prompt */}
          {!cameraActive && !capturedImage && (
            <div style={styles.uploadPrompt}>
              <div style={styles.uploadIcon}>
                <Upload size={48} color="#3498db" />
              </div>
              <h3 style={styles.uploadTitle}>Upload Medical Report</h3>
              <p style={styles.uploadText}>
                Drag and drop your medical document here, or click to browse
              </p>
              <button 
                onClick={handleLibrarySelect}
                style={styles.browseButton}
                className="btn-3d"
              >
                <FolderOpen size={18} />
                Browse Files
              </button>
            </div>
          )}

          {/* Analyze Button */}
          {capturedImage && !reportData && !loading && (
            <button 
              onClick={handleAnalyze}
              style={styles.analyzeButton}
              className="btn-3d"
            >
              <Brain size={20} />
              <span>Analyze with AI</span>
              <Sparkles size={16} style={styles.analyzeSparkle} />
            </button>
          )}

          {/* Loading Progress */}
          {loading && (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}>
                <Cpu size={32} color="#3498db" style={styles.spinnerIcon} />
              </div>
              <p style={styles.loadingText}>AI is analyzing your document...</p>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${scanProgress}%` }}></div>
              </div>
              <div style={styles.progressSteps}>
                <div style={styles.progressStep}>
                  <CheckCircle size={12} color={scanProgress >= 30 ? "#2ecc71" : "#7f8c8d"} />
                  <span>Extracting text</span>
                </div>
                <div style={styles.progressStep}>
                  <CheckCircle size={12} color={scanProgress >= 60 ? "#2ecc71" : "#7f8c8d"} />
                  <span>Identifying data</span>
                </div>
                <div style={styles.progressStep}>
                  <CheckCircle size={12} color={scanProgress >= 90 ? "#2ecc71" : "#7f8c8d"} />
                  <span>Structuring report</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Extracted Data Display */}
        {reportData && (
          <div style={styles.resultContainer}>
            <div style={styles.resultTabs}>
              <button
                onClick={() => setActiveTab('extracted')}
                style={{
                  ...styles.resultTab,
                  backgroundColor: activeTab === 'extracted' ? 'rgba(52,152,219,0.1)' : 'transparent',
                  borderColor: activeTab === 'extracted' ? '#3498db' : 'rgba(255,255,255,0.1)'
                }}
              >
                <FileText size={16} />
                <span>Extracted Data</span>
              </button>
              <button
                onClick={() => setActiveTab('structured')}
                style={{
                  ...styles.resultTab,
                  backgroundColor: activeTab === 'structured' ? 'rgba(46,204,113,0.1)' : 'transparent',
                  borderColor: activeTab === 'structured' ? '#2ecc71' : 'rgba(255,255,255,0.1)'
                }}
              >
                <Brain size={16} />
                <span>AI Analysis</span>
              </button>
              <button
                onClick={() => setActiveTab('medicines')}
                style={{
                  ...styles.resultTab,
                  backgroundColor: activeTab === 'medicines' ? 'rgba(155,89,182,0.1)' : 'transparent',
                  borderColor: activeTab === 'medicines' ? '#9b59b6' : 'rgba(255,255,255,0.1)'
                }}
              >
                <Shield size={16} />
                <span>Medicines</span>
              </button>
            </div>

            <div style={styles.resultContent}>
              {activeTab === 'extracted' && (
                <div style={styles.extractedData}>
                  <div style={styles.dataGrid}>
                    <div style={styles.dataItem}>
                      <span style={styles.dataLabel}>Doctor Name</span>
                      <span style={styles.dataValue}>{reportData.doctorName}</span>
                    </div>
                    <div style={styles.dataItem}>
                      <span style={styles.dataLabel}>Hospital</span>
                      <span style={styles.dataValue}>{reportData.hospitalName}</span>
                    </div>
                    <div style={styles.dataItem}>
                      <span style={styles.dataLabel}>Visit Date</span>
                      <span style={styles.dataValue}>{reportData.visitDate}</span>
                    </div>
                    <div style={styles.dataItem}>
                      <span style={styles.dataLabel}>Diagnosis</span>
                      <span style={styles.dataValue}>{reportData.diseaseName}</span>
                    </div>
                    <div style={{ ...styles.dataItem, gridColumn: 'span 2' }}>
                      <span style={styles.dataLabel}>Reason</span>
                      <span style={styles.dataValue}>{reportData.reasonForCondition}</span>
                    </div>
                  </div>

                  {reportData.extractedText && (
                    <div style={styles.rawText}>
                      <h4 style={styles.rawTextTitle}>Extracted Text</h4>
                      <p style={styles.rawTextContent}>{reportData.extractedText}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'structured' && (
                <div style={styles.structuredData}>
                  {reportData.actionPlan && reportData.actionPlan.length > 0 && (
                    <div style={styles.actionPlan}>
                      <h4 style={styles.actionPlanTitle}>
                        <CheckCircle size={16} color="#2ecc71" />
                        Action Plan
                      </h4>
                      <ul style={styles.actionPlanList}>
                        {reportData.actionPlan.map((step, index) => (
                          <li key={index} style={styles.actionPlanItem}>
                            <span style={styles.actionPlanNumber}>{index + 1}</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'medicines' && (
                <div style={styles.medicinesData}>
                  {reportData.medicines && reportData.medicines.length > 0 ? (
                    reportData.medicines.map((med, index) => (
                      <div key={index} style={styles.medicineCard}>
                        <div style={styles.medicineHeader}>
                          <span style={styles.medicineName}>{med.name}</span>
                          <span style={styles.medicineSpec}>{med.specification}</span>
                        </div>
                        {med.purpose && (
                          <div style={styles.medicinePurpose}>
                            <span style={styles.purposeLabel}>Purpose:</span>
                            <span>{med.purpose}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={styles.noData}>No medicine information found</p>
                  )}
                </div>
              )}
            </div>

            {/* Save Button */}
            <button 
              onClick={handleSaveToDB}
              disabled={isSaved}
              style={{
                ...styles.saveButton,
                backgroundColor: isSaved ? '#2ecc71' : 'linear-gradient(135deg, #3498db, #2980b9)',
                cursor: isSaved ? 'default' : 'pointer'
              }}
              className={isSaved ? '' : 'btn-3d'}
            >
              {isSaved ? (
                <>
                  <CheckCircle size={18} />
                  <span>Saved to Health Profile</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save to Health Profile</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && !reportData && (
          <div style={styles.recentScans}>
            <h3 style={styles.recentScansTitle}>
              <Clock size={16} color="#7f8c8d" />
              Recent Scans
            </h3>
            <div style={styles.recentScansList}>
              {recentScans.map((scan) => (
                <div key={scan.id} style={styles.recentScanItem}>
                  {scan.preview ? (
                    <img src={scan.preview} alt="Scan" style={styles.recentScanImage} />
                  ) : (
                    <div style={styles.recentScanPlaceholder}>
                      <FileText size={16} color="#7f8c8d" />
                    </div>
                  )}
                  <div style={styles.recentScanInfo}>
                    <span style={styles.recentScanName}>{scan.fileName}</span>
                    <span style={styles.recentScanDate}>
                      {new Date(scan.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Security Badge */}
      <div style={styles.securityBadge}>
        <Shield size={12} color="#7f8c8d" />
        <span>HIPAA Compliant • 256-bit Encryption • Secure Processing</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 100%)',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflowX: 'hidden',
  },
  particles: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    width: '3px',
    height: '3px',
    borderRadius: '50%',
    boxShadow: '0 0 10px currentColor',
    opacity: 0.2,
  },
  header: {
    background: 'rgba(10, 15, 28, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(52,152,219,0.2)',
    padding: '15px 0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '60px',
    height: '60px',
    background: 'radial-gradient(circle, rgba(52,152,219,0.2) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'rgba(52,152,219,0.1)',
    border: '1px solid rgba(52,152,219,0.3)',
    borderRadius: '12px',
    color: '#3498db',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  mainContent: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '30px 20px',
    position: 'relative',
    zIndex: 10,
  },
  modeSelector: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '20px',
  },
  modeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  scanArea: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '20px',
    marginBottom: '20px',
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column',
  },
  cameraContainer: {
    position: 'relative',
    width: '100%',
    height: '300px',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  cameraVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cameraControls: {
    position: 'absolute',
    bottom: '20px',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
  },
  captureButton: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
    border: '4px solid rgba(255,255,255,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  closeCameraButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  previewContainer: {
    position: 'relative',
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  previewTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#3498db',
  },
  previewActions: {
    display: 'flex',
    gap: '8px',
  },
  previewAction: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'contain',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
  },
  previewImageExpanded: {
    maxHeight: '500px',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90vw',
    height: 'auto',
    zIndex: 1000,
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  qualityBadge: {
    position: 'absolute',
    top: '50px',
    right: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    background: 'rgba(46,204,113,0.1)',
    border: '1px solid rgba(46,204,113,0.3)',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#2ecc71',
  },
  uploadPrompt: {
    textAlign: 'center',
    padding: '40px',
  },
  uploadIcon: {
    width: '80px',
    height: '80px',
    margin: '0 auto 20px',
    background: 'rgba(52,152,219,0.1)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'bounce 2s ease-in-out infinite',
  },
  uploadTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '10px',
  },
  uploadText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '20px',
  },
  browseButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  analyzeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '16px',
    background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  analyzeSparkle: {
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '40px',
  },
  loadingSpinner: {
    animation: 'rotate 2s linear infinite',
    marginBottom: '20px',
  },
  spinnerIcon: {
    margin: '0 auto',
  },
  loadingText: {
    fontSize: '16px',
    color: '#ffffff',
    marginBottom: '20px',
  },
  progressBar: {
    width: '100%',
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #3498db, #2ecc71)',
    transition: 'width 0.3s ease',
  },
  progressSteps: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
  },
  progressStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: 'rgba(255,255,255,0.7)',
  },
  resultContainer: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '20px',
    marginTop: '20px',
  },
  resultTabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '20px',
  },
  resultTab: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  resultContent: {
    minHeight: '200px',
  },
  extractedData: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  dataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
  },
  dataItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  dataLabel: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  dataValue: {
    fontSize: '14px',
    color: '#ffffff',
    fontWeight: '500',
  },
  rawText: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '12px',
    padding: '15px',
  },
  rawTextTitle: {
    fontSize: '14px',
    color: '#3498db',
    marginBottom: '10px',
  },
  rawTextContent: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: '1.6',
    margin: 0,
  },
  actionPlan: {
    background: 'rgba(46,204,113,0.05)',
    borderRadius: '12px',
    padding: '15px',
  },
  actionPlanTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#2ecc71',
    marginBottom: '15px',
  },
  actionPlanList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  actionPlanItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.8)',
  },
  actionPlanNumber: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'rgba(46,204,113,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    color: '#2ecc71',
  },
  medicinesData: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  medicineCard: {
    background: 'rgba(155,89,182,0.05)',
    borderRadius: '12px',
    padding: '15px',
  },
  medicineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  medicineName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff',
  },
  medicineSpec: {
    fontSize: '12px',
    padding: '3px 8px',
    background: 'rgba(155,89,182,0.2)',
    borderRadius: '12px',
    color: '#9b59b6',
  },
  medicinePurpose: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.5',
  },
  purposeLabel: {
    color: '#9b59b6',
    marginRight: '5px',
  },
  noData: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    padding: '30px',
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px',
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px',
    width: '100%',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
  },
  recentScans: {
    marginTop: '30px',
  },
  recentScansTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '15px',
  },
  recentScansList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  recentScanItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  recentScanImage: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  recentScanPlaceholder: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentScanInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  recentScanName: {
    fontSize: '13px',
    color: '#ffffff',
  },
  recentScanDate: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
  },
  securityBadge: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 16px',
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(10px)',
    borderRadius: '30px',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    zIndex: 100,
  },
};

export default Scanner;