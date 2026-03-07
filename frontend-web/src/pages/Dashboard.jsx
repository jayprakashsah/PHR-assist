import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  PlusCircle, Calendar, Building, ChevronDown, ChevronUp,
  Pill, Volume2, LogOut, ShieldCheck, CheckCircle, HelpCircle,
  Activity, FileText, Heart, Clock, Award, Zap, Cpu,
  Sparkles, BadgeCheck, User, Bell, Settings, Search,
  Download, Share2, Printer, BookOpen, Brain,
  Microscope, Stethoscope, Thermometer, AlertCircle
} from 'lucide-react';

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [stats, setStats] = useState({
    totalReports: 0,
    uniqueDoctors: 0,
    medications: 0,
    lastVisit: null
  });
  // Upload modal state
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    const fetchReports = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/reports/user/${userId}`);
        setReports(response.data);

        // Calculate stats
        const uniqueDocs = [...new Set(response.data.map(r => r.doctorName))].length;
        const meds = response.data.reduce((acc, r) => acc + (r.medicines?.length || 0), 0);
        const lastVisit = response.data.length > 0
          ? new Date(Math.max(...response.data.map(r => new Date(r.visitDate))))
          : null;

        setStats({
          totalReports: response.data.length,
          uniqueDoctors: uniqueDocs,
          medications: meds,
          lastVisit: lastVisit
        });
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userId, navigate]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // ── Upload handlers ──────────────────────────────────────────────────
  const openUpload = () => { setShowUpload(true); setSelectedFiles([]); setUploadSuccess(false); };
  const closeUpload = () => { setShowUpload(false); setSelectedFiles([]); setUploadSuccess(false); };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setAnalyzing(true);
    try {
      // 1. Send files to Python AI Engine for analysis and audio generation
      const aiFormData = new FormData();
      selectedFiles.forEach(f => aiFormData.append('files', f));

      let extractedData = {};
      try {
        const aiResponse = await axios.post('http://localhost:8000/analyze-report', aiFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (aiResponse.data.status === 'success') {
          extractedData = aiResponse.data.data;
        }
      } catch (aiErr) {
        console.error('AI Analysis failed, falling back to basic upload:', aiErr);
      }

      setAnalyzing(false);

      // 2. Send files + AI extracted data to Node.js generic backend
      const nodeFormData = new FormData();
      selectedFiles.forEach(f => nodeFormData.append('files', f));

      const reportPayload = {
        patientId: userId,
        diseaseName: extractedData.diseaseName || selectedFiles.map(f => f.name).join(', '),
        hospitalName: extractedData.hospitalName || 'Uploaded Document',
        doctorName: extractedData.doctorName || 'Self Upload',
        visitDate: extractedData.visitDate || new Date().toISOString(),
        extractedText: extractedData.extractedText || `Uploaded ${selectedFiles.length} file(s) for analysis.`,
        reasonForCondition: extractedData.reasonForCondition || '',
        medicines: extractedData.medicines || [],
        actionPlan: extractedData.actionPlan || [],
        voiceReportUrl: extractedData.voiceReportUrl || null,
      };

      nodeFormData.append('reportData', JSON.stringify(reportPayload));

      await axios.post('http://localhost:5001/api/reports/add', nodeFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 3. Setup Reminders automatically if medicines exist
      if (reportPayload.medicines && reportPayload.medicines.length > 0) {
        try {
          await axios.post('http://localhost:5001/api/reminders/add-bulk', {
            userId: userId,
            medicines: reportPayload.medicines
          });
        } catch (remErr) {
          console.error('Failed to set automatic reminders:', remErr);
        }
      }

      setUploadSuccess(true);
      // Refresh reports list
      const res = await axios.get(`http://localhost:5001/api/reports/user/${userId}`);
      setReports(res.data);
      setStats(prev => ({ ...prev, totalReports: res.data.length }));
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please ensure both Node and AI servers are running.');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.diseaseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.doctorName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterDate === 'all') return matchesSearch;
    if (filterDate === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return matchesSearch && new Date(report.visitDate) >= oneMonthAgo;
    }
    if (filterDate === 'year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return matchesSearch && new Date(report.visitDate) >= oneYearAgo;
    }
    return matchesSearch;
  });

  // Group reports by month for timeline
  const groupReportsByMonth = () => {
    const grouped = {};
    filteredReports.forEach(report => {
      const date = new Date(report.visitDate);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(report);
    });
    return grouped;
  };

  const groupedReports = groupReportsByMonth();

  return (
    <div style={styles.container}>
      {/* Floating Particles Background - Fewer on mobile */}
      <div style={styles.particles}>
        {[...Array(windowWidth <= 768 ? 5 : 15)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${15 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Header with Gradient - Responsive padding */}
      <div style={{
        ...styles.header,
        padding: windowWidth <= 480 ? '10px 15px' : windowWidth <= 768 ? '12px 20px' : '15px 30px',
      }}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.logo}>
              <ShieldCheck size={windowWidth <= 480 ? 24 : windowWidth <= 768 ? 28 : 32} color="#3498db" />
              <span style={{
                ...styles.logoText,
                fontSize: windowWidth <= 480 ? '16px' : windowWidth <= 768 ? '18px' : '20px',
              }}>
                Smart<span style={{ color: '#3498db' }}>.Health</span>
              </span>
            </div>
            {windowWidth > 768 && (
              <div style={styles.welcomeBadge}>
                <Sparkles size={16} color="#3498db" />
                <span>Welcome back, {userName}</span>
              </div>
            )}
          </div>

          <div style={styles.headerRight}>
            <button style={{
              ...styles.iconButton,
              padding: windowWidth <= 480 ? '8px' : '10px',
            }} className="icon-3d">
              <Bell size={windowWidth <= 480 ? 16 : 20} />
            </button>
            <button style={{
              ...styles.iconButton,
              padding: windowWidth <= 480 ? '8px' : '10px',
            }} className="icon-3d">
              <Settings size={windowWidth <= 480 ? 16 : 20} />
            </button>
            {windowWidth > 768 && (
              <button onClick={handleLogout} style={styles.logoutButton} className="btn-outline-3d">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Dashboard - Responsive grid */}
      <div style={{
        ...styles.statsGrid,
        gridTemplateColumns: windowWidth <= 480
          ? '1fr'
          : windowWidth <= 768
            ? 'repeat(2, 1fr)'
            : 'repeat(4, 1fr)',
        padding: windowWidth <= 480 ? '15px' : windowWidth <= 768 ? '20px' : '30px',
      }}>
        <div style={styles.statCard} className="stat-card">
          <div style={styles.statIconContainer}>
            <FileText size={windowWidth <= 480 ? 20 : 24} color="#3498db" />
          </div>
          <div style={styles.statInfo}>
            <span style={{
              ...styles.statValue,
              fontSize: windowWidth <= 480 ? '24px' : '32px',
            }}>{stats.totalReports}</span>
            <span style={styles.statLabel}>Total Reports</span>
          </div>
          {windowWidth > 480 && (
            <div style={styles.statTrend}>+{Math.floor(stats.totalReports * 0.2)} this year</div>
          )}
        </div>

        <div style={styles.statCard} className="stat-card">
          <div style={styles.statIconContainer}>
            <User size={windowWidth <= 480 ? 20 : 24} color="#2ecc71" />
          </div>
          <div style={styles.statInfo}>
            <span style={{
              ...styles.statValue,
              fontSize: windowWidth <= 480 ? '24px' : '32px',
            }}>{stats.uniqueDoctors}</span>
            <span style={styles.statLabel}>Healthcare Providers</span>
          </div>
        </div>

        <div style={styles.statCard} className="stat-card">
          <div style={styles.statIconContainer}>
            <Pill size={windowWidth <= 480 ? 20 : 24} color="#e74c3c" />
          </div>
          <div style={styles.statInfo}>
            <span style={{
              ...styles.statValue,
              fontSize: windowWidth <= 480 ? '24px' : '32px',
            }}>{stats.medications}</span>
            <span style={styles.statLabel}>Prescriptions</span>
          </div>
        </div>

        <div style={styles.statCard} className="stat-card">
          <div style={styles.statIconContainer}>
            <Calendar size={windowWidth <= 480 ? 20 : 24} color="#9b59b6" />
          </div>
          <div style={styles.statInfo}>
            <span style={{
              ...styles.statValue,
              fontSize: windowWidth <= 480 ? '14px' : '32px',
            }}>
              {stats.lastVisit ? new Date(stats.lastVisit).toLocaleDateString() : 'N/A'}
            </span>
            <span style={styles.statLabel}>Last Visit</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        ...styles.mainContent,
        padding: windowWidth <= 480 ? '0 15px' : windowWidth <= 768 ? '0 20px' : '0 30px',
      }}>
        {/* Search and Filter Bar - Stack on mobile */}
        <div style={{
          ...styles.searchBar,
          flexDirection: windowWidth <= 768 ? 'column' : 'row',
          alignItems: windowWidth <= 768 ? 'stretch' : 'center',
        }}>
          <div style={styles.searchInputContainer}>
            <Search size={20} color="#7f8c8d" />
            <input
              type="text"
              placeholder={windowWidth <= 480 ? "Search reports..." : "Search by condition, hospital, or doctor..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={{
            ...styles.filterContainer,
            flexDirection: windowWidth <= 480 ? 'column' : 'row',
            width: windowWidth <= 480 ? '100%' : 'auto',
          }}>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{
                ...styles.filterSelect,
                width: windowWidth <= 480 ? '100%' : 'auto',
              }}
            >
              <option value="all">All Time</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>

            <button
              onClick={openUpload}
              style={{
                ...styles.uploadButton,
                width: windowWidth <= 480 ? '100%' : 'auto',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
              }}
              className="btn-3d"
            >
              <PlusCircle size={18} />
              <span>{windowWidth <= 480 ? 'Upload' : 'Upload Report'}</span>
            </button>
          </div>
        </div>

        {/* Timeline View */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}>
              <Activity size={windowWidth <= 480 ? 32 : 48} color="#3498db" style={styles.spinnerIcon} />
            </div>
            <p style={styles.loadingText}>Decrypting your medical records...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>
              <FileText size={windowWidth <= 480 ? 48 : 64} color="#3498db" />
            </div>
            <h3 style={{
              ...styles.emptyStateTitle,
              fontSize: windowWidth <= 480 ? '20px' : '24px',
            }}>No Reports Found</h3>
            <p style={styles.emptyStateText}>
              {searchTerm ? 'Try adjusting your search criteria' : 'Upload your first medical report to get started'}
            </p>
            {!searchTerm && (
              <button onClick={openUpload} style={{ ...styles.emptyStateButton, border: 'none', cursor: 'pointer' }} className="btn-3d">
                <PlusCircle size={18} />
                Upload Your First Report
              </button>
            )}
          </div>
        ) : (
          <div style={styles.timeline}>
            {Object.entries(groupedReports).map(([monthYear, monthReports]) => (
              <div key={monthYear} style={styles.timelineSection}>
                <div style={styles.timelineHeader}>
                  <div style={styles.timelineDot}></div>
                  <h3 style={{
                    ...styles.timelineMonth,
                    fontSize: windowWidth <= 480 ? '16px' : '18px',
                  }}>{monthYear}</h3>
                  <div style={styles.timelineLine}></div>
                </div>

                <div style={{
                  ...styles.reportsGrid,
                  gridTemplateColumns: windowWidth <= 768
                    ? '1fr'
                    : 'repeat(auto-fill, minmax(500px, 1fr))',
                }}>
                  {monthReports.map((report) => {
                    const isExpanded = expandedId === report._id;

                    return (
                      <div
                        key={report._id}
                        style={{
                          ...styles.reportCard,
                          ...(isExpanded ? styles.reportCardExpanded : {})
                        }}
                        className="feature-card-3d"
                      >
                        {/* Card Header */}
                        <div
                          onClick={() => toggleExpand(report._id)}
                          style={styles.reportHeader}
                        >
                          <div style={styles.reportHeaderLeft}>
                            <div style={styles.reportIcon}>
                              <FileText size={windowWidth <= 480 ? 20 : 24} color="#3498db" />
                            </div>
                            <div style={styles.reportInfo}>
                              <h4 style={{
                                ...styles.reportTitle,
                                fontSize: windowWidth <= 480 ? '16px' : '18px',
                              }}>
                                {report.diseaseName || "General Assessment"}
                              </h4>
                              <div style={{
                                ...styles.reportMeta,
                                flexDirection: windowWidth <= 480 ? 'column' : 'row',
                                gap: windowWidth <= 480 ? '5px' : '15px',
                              }}>
                                <span style={styles.reportMetaItem}>
                                  <Calendar size={14} color="#7f8c8d" />
                                  {new Date(report.visitDate).toLocaleDateString()}
                                </span>
                                <span style={styles.reportMetaItem}>
                                  <Building size={14} color="#7f8c8d" />
                                  {windowWidth <= 480 && report.hospitalName.length > 20
                                    ? `${report.hospitalName.substring(0, 20)}...`
                                    : report.hospitalName}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={styles.reportHeaderRight}>
                            {report.voiceReportUrl && (
                              <div style={styles.audioBadge}>
                                <Volume2 size={16} color="#e67e22" />
                              </div>
                            )}
                            <div style={styles.expandIcon}>
                              {isExpanded ?
                                <ChevronUp size={20} color="#3498db" /> :
                                <ChevronDown size={20} color="#7f8c8d" />
                              }
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div style={styles.reportDetails}>
                            {/* Doctor & Summary */}
                            <div style={styles.detailSection}>
                              <div style={styles.doctorBadge}>
                                <Stethoscope size={16} color="#3498db" />
                                <span>Dr. {report.doctorName}</span>
                              </div>

                              {report.reasonForCondition && (
                                <div style={styles.reasonBox}>
                                  <HelpCircle size={16} color="#e74c3c" />
                                  <p style={styles.reasonText}>
                                    <strong>Diagnosis Reason:</strong> {report.reasonForCondition}
                                  </p>
                                </div>
                              )}

                              <div style={styles.summaryBox}>
                                <Brain size={16} color="#9b59b6" />
                                <p style={styles.summaryText}>{report.extractedText}</p>
                              </div>
                            </div>

                            {/* Action Plan & Medicines - Stack on mobile */}
                            <div style={{
                              ...styles.detailGrid,
                              gridTemplateColumns: windowWidth <= 768 ? '1fr' : '1fr 1fr',
                            }}>
                              {report.actionPlan && report.actionPlan.length > 0 && (
                                <div style={styles.actionPlanBox}>
                                  <div style={styles.sectionTitle}>
                                    <CheckCircle size={18} color="#2ecc71" />
                                    <h4 style={styles.sectionTitleh4}>Action Plan</h4>
                                  </div>
                                  <ul style={styles.actionPlanList}>
                                    {report.actionPlan.map((step, index) => (
                                      <li key={index} style={styles.actionPlanItem}>
                                        <BadgeCheck size={16} color="#2ecc71" />
                                        <span>{step}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {report.medicines && report.medicines.length > 0 && (
                                <div style={styles.medicinesBox}>
                                  <div style={styles.sectionTitle}>
                                    <Pill size={18} color="#e67e22" />
                                    <h4 style={styles.sectionTitleh4}>Prescriptions</h4>
                                  </div>
                                  <div style={styles.medicinesList}>
                                    {report.medicines.map((med, index) => (
                                      <div key={index} style={styles.medicineItem}>
                                        <div style={styles.medicineHeader}>
                                          <span style={styles.medicineName}>{med.name}</span>
                                          <span style={styles.medicineSpec}>{med.specification}</span>
                                        </div>
                                        {med.purpose && (
                                          <div style={styles.medicinePurpose}>
                                            <Sparkles size={12} color="#f39c12" />
                                            <span>{med.purpose}</span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Audio Player - Responsive */}
                            {report.voiceReportUrl && (
                              <div style={{
                                ...styles.audioPlayer,
                                flexDirection: windowWidth <= 480 ? 'column' : 'row',
                                alignItems: windowWidth <= 480 ? 'flex-start' : 'center',
                              }}>
                                <Volume2 size={18} color="#e67e22" />
                                <span style={styles.audioLabel}>Clinical Audio Summary</span>
                                <audio
                                  controls
                                  src={report.voiceReportUrl}
                                  style={{
                                    ...styles.audioElement,
                                    width: windowWidth <= 480 ? '100%' : 'auto',
                                  }}
                                />
                              </div>
                            )}

                            {/* Action Buttons - Wrap on mobile */}
                            <div style={{
                              ...styles.reportActions,
                              flexWrap: 'wrap',
                              justifyContent: windowWidth <= 480 ? 'center' : 'flex-end',
                            }}>
                              <button style={styles.actionButton}>
                                <Download size={16} />
                                {windowWidth > 480 && 'Download'}
                              </button>
                              <button style={styles.actionButton}>
                                <Share2 size={16} />
                                {windowWidth > 480 && 'Share'}
                              </button>
                              <button style={styles.actionButton}>
                                <Printer size={16} />
                                {windowWidth > 480 && 'Print'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Upload Modal ──────────────────────────────────────────────── */}
      {showUpload && (
        <div style={styles.modalOverlay} onClick={closeUpload}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>

            {uploadSuccess ? (
              <div style={styles.successBox}>
                <CheckCircle size={56} color="#2ecc71" />
                <h3 style={{ color: '#fff', margin: '16px 0 8px', fontSize: 24 }}>Uploaded!</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>Your report has been saved to your vault.</p>
                <button onClick={closeUpload} style={styles.modalBtn}>Close</button>
              </div>
            ) : (
              <>
                <div style={styles.modalHeader}>
                  <h3 style={styles.modalTitle}>Upload Health Report</h3>
                  <button onClick={closeUpload} style={styles.modalClose}>✕</button>
                </div>

                {/* Drag & Drop zone */}
                <div
                  style={{
                    ...styles.dropZone,
                    borderColor: dragOver ? '#3498db' : 'rgba(52,152,219,0.3)',
                    background: dragOver ? 'rgba(52,152,219,0.1)' : 'rgba(255,255,255,0.03)',
                  }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <FileText size={48} color="#3498db" style={{ marginBottom: 12 }} />
                  <p style={{ color: '#fff', fontWeight: 600, marginBottom: 6 }}>
                    {dragOver ? 'Drop files here' : 'Drag & drop files here'}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                    or <span style={{ color: '#3498db', cursor: 'pointer' }}>browse from device</span>
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 8 }}>
                    Supports PDF, JPG, PNG, DOCX
                  </p>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.docx"
                    style={{ display: 'none' }}
                    onChange={handleFileInput}
                  />
                </div>

                {/* File list */}
                {selectedFiles.length > 0 && (
                  <div style={styles.fileList}>
                    {selectedFiles.map((f, i) => (
                      <div key={i} style={styles.fileItem}>
                        <FileText size={16} color="#3498db" />
                        <span style={{ flex: 1, fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginRight: 8 }}>{(f.size / 1024).toFixed(0)} KB</span>
                        <button onClick={() => removeFile(i)} style={styles.removeBtn}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || uploading}
                  style={{
                    ...styles.modalBtn,
                    opacity: selectedFiles.length === 0 || uploading ? 0.7 : 1,
                    cursor: selectedFiles.length === 0 || uploading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {uploading ? (
                    <>
                      <Activity size={18} className={analyzing ? "pulse-anim" : ""} />
                      {analyzing ? 'AI is analyzing and generating audio...' : 'Uploading...'}
                    </>
                  ) : (
                    `Extract with AI & Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile Logout Button - Only visible on mobile */}
      {windowWidth <= 768 && (
        <div style={{
          ...styles.mobileLogout,
          padding: windowWidth <= 480 ? '15px' : '20px',
        }}>
          <button onClick={handleLogout} style={styles.mobileLogoutButton}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Add keyframe animations */}
      <style jsx>{`
        @keyframes float-particle {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse-anim {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .pulse-anim {
          animation: pulse-anim 1.5s ease-in-out infinite;
        }

        .icon-3d:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.15);
        }
        
        .btn-outline-3d:hover {
          transform: translateY(-2px);
          background: rgba(231,76,60,0.15);
        }
        
        .btn-3d:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(52,152,219,0.3);
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          border-color: rgba(52,152,219,0.3);
        }
        
        .feature-card-3d:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: '100vh',
    backgroundColor: '#0a0f1c',
    color: '#ffffff',
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
    width: '4px',
    height: '4px',
    backgroundColor: '#3498db',
    borderRadius: '50%',
    boxShadow: '0 0 20px #3498db',
  },
  header: {
    background: 'rgba(10, 15, 28, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(52, 152, 219, 0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoText: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  welcomeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(52, 152, 219, 0.1)',
    borderRadius: '30px',
    border: '1px solid rgba(52, 152, 219, 0.3)',
    fontSize: '14px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  iconButton: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    transition: 'all 0.3s ease',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'rgba(231, 76, 60, 0.1)',
    border: '1px solid rgba(231, 76, 60, 0.3)',
    borderRadius: '12px',
    color: '#e74c3c',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  statsGrid: {
    display: 'grid',
    gap: '20px',
    maxWidth: '1400px',
    margin: '0 auto 30px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  statIconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    background: 'rgba(52, 152, 219, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '15px',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
  },
  statTrend: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    fontSize: '12px',
    color: '#2ecc71',
    background: 'rgba(46, 204, 113, 0.1)',
    padding: '4px 8px',
    borderRadius: '20px',
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  searchBar: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '30px',
    gap: '20px',
  },
  searchInputContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '12px 16px',
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    '::placeholder': {
      color: 'rgba(255,255,255,0.5)',
    },
  },
  filterContainer: {
    display: 'flex',
    gap: '15px',
  },
  filterSelect: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
  },
  uploadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    borderRadius: '12px',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px',
  },
  loadingSpinner: {
    animation: 'rotate 2s linear infinite',
    marginBottom: '20px',
  },
  spinnerIcon: {
    margin: '0 auto',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '30px',
    border: '2px dashed rgba(255,255,255,0.1)',
  },
  emptyStateIcon: {
    marginBottom: '20px',
  },
  emptyStateTitle: {
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '10px',
  },
  emptyStateText: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '30px',
  },
  emptyStateButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    borderRadius: '30px',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },
  timelineSection: {
    position: 'relative',
  },
  timelineHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px',
  },
  timelineDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#3498db',
    boxShadow: '0 0 20px #3498db',
  },
  timelineMonth: {
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
  },
  timelineLine: {
    flex: 1,
    height: '2px',
    background: 'linear-gradient(90deg, rgba(52,152,219,0.3), transparent)',
  },
  reportsGrid: {
    display: 'grid',
    gap: '20px',
  },
  reportCard: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.05)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  reportCardExpanded: {
    background: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(52,152,219,0.3)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  },
  reportHeader: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },
  reportHeaderLeft: {
    display: 'flex',
    gap: '15px',
  },
  reportIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    background: 'rgba(52,152,219,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  reportTitle: {
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
  },
  reportMeta: {
    display: 'flex',
  },
  reportMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
  },
  reportHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  audioBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(230, 126, 34, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportDetails: {
    padding: '20px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  detailSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  doctorBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(52,152,219,0.1)',
    borderRadius: '30px',
    fontSize: '14px',
    alignSelf: 'flex-start',
  },
  reasonBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '15px',
    background: 'rgba(231, 76, 60, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(231, 76, 60, 0.1)',
  },
  reasonText: {
    margin: 0,
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: '1.5',
  },
  summaryBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '15px',
    background: 'rgba(155, 89, 182, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(155, 89, 182, 0.1)',
  },
  summaryText: {
    margin: 0,
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: '1.5',
  },
  detailGrid: {
    display: 'grid',
    gap: '15px',
  },
  actionPlanBox: {
    padding: '15px',
    background: 'rgba(46, 204, 113, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(46, 204, 113, 0.1)',
  },
  medicinesBox: {
    padding: '15px',
    background: 'rgba(230, 126, 34, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(230, 126, 34, 0.1)',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '15px',
  },
  sectionTitleh4: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
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
    gap: '8px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: '1.4',
  },
  medicinesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  medicineItem: {
    padding: '10px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
  },
  medicineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px',
    flexWrap: 'wrap',
    gap: '5px',
  },
  medicineName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
  },
  medicineSpec: {
    fontSize: '12px',
    padding: '2px 8px',
    background: 'rgba(231, 76, 60, 0.1)',
    borderRadius: '12px',
    color: '#e74c3c',
  },
  medicinePurpose: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
  },
  audioPlayer: {
    display: 'flex',
    gap: '15px',
    padding: '15px',
    background: 'rgba(230, 126, 34, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(230, 126, 34, 0.1)',
  },
  audioLabel: {
    fontSize: '14px',
    color: '#e67e22',
  },
  audioElement: {
    flex: 1,
    height: '40px',
  },
  reportActions: {
    display: 'flex',
    gap: '10px',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  mobileLogout: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  mobileLogoutButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '15px',
    background: 'rgba(231, 76, 60, 0.1)',
    border: '1px solid rgba(231, 76, 60, 0.3)',
    borderRadius: '12px',
    color: '#e74c3c',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  // ── Modal ──────────────────────────────────────────
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
  },
  modalBox: {
    background: 'linear-gradient(135deg, #0f1929, #1a2540)',
    border: '1px solid rgba(52,152,219,0.25)',
    borderRadius: 24,
    padding: '28px 28px 24px',
    width: '100%',
    maxWidth: 520,
    boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
  },
  modalClose: {
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    color: '#fff',
    width: 34,
    height: 34,
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropZone: {
    border: '2px dashed',
    borderRadius: 16,
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 16,
  },
  fileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 16,
    maxHeight: 180,
    overflowY: 'auto',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: '8px 12px',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    fontSize: 14,
    padding: 2,
  },
  modalBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    border: 'none',
    borderRadius: 14,
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 0 8px',
    textAlign: 'center',
  },
};


export default Dashboard;