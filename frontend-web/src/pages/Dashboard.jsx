import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
<<<<<<< HEAD
import {
  PlusCircle, Calendar, Building, ChevronDown, ChevronUp,
  Pill, Volume2, LogOut, ShieldCheck, CheckCircle, HelpCircle,
=======
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  PlusCircle, Calendar, Building, ChevronDown, ChevronUp, 
  Pill, Volume2, LogOut, ShieldCheck, CheckCircle, HelpCircle, 
>>>>>>> e5788e615c75eae463b3b1553d6c2202668a334a
  Activity, FileText, Heart, Clock, Award, Zap, Cpu,
  Sparkles, BadgeCheck, User, Bell, Settings, Search,
  Download, Share2, Printer, BookOpen, Brain,
  Microscope, Stethoscope, Thermometer, AlertCircle, FileImage, Trash2, Edit, Globe
} from 'lucide-react';

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [stats, setStats] = useState({
    totalReports: 0, uniqueDoctors: 0, medications: 0, lastVisit: null
  });
<<<<<<< HEAD
  // Upload modal state
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
=======
  
  const [translations, setTranslations] = useState({});
  const [isTranslating, setIsTranslating] = useState(null); 
>>>>>>> e5788e615c75eae463b3b1553d6c2202668a334a

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
<<<<<<< HEAD
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

=======
    const handleResize = () => setWindowWidth(window.innerWidth);
>>>>>>> e5788e615c75eae463b3b1553d6c2202668a334a
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
<<<<<<< HEAD
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

=======
    if (!userId) return navigate('/');
>>>>>>> e5788e615c75eae463b3b1553d6c2202668a334a
    fetchReports();
  }, [userId, navigate]);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/reports/user/${userId}`);
      setReports(response.data);
      
      const uniqueDocs = [...new Set(response.data.map(r => r.doctorName))].length;
      const meds = response.data.reduce((acc, r) => acc + (r.medicines?.length || 0), 0);
      const lastVisit = response.data.length > 0 ? new Date(Math.max(...response.data.map(r => new Date(r.visitDate)))) : null;
      
      setStats({ totalReports: response.data.length, uniqueDoctors: uniqueDocs, medications: meds, lastVisit });
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);
  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const handleTranslate = async (reportId, text) => {
    const selectElement = document.getElementById(`lang-${reportId}`);
    const targetLang = selectElement.value;

    if (targetLang === "English") {
      const newTranslations = { ...translations };
      delete newTranslations[reportId];
      setTranslations(newTranslations);
      return;
    }

    setIsTranslating(reportId);
    try {
      const response = await axios.post("http://localhost:8000/translate", {
        text: text,
        target_language: targetLang
      });
      setTranslations(prev => ({ ...prev, [reportId]: response.data.translatedText }));
    } catch (error) {
      alert("Failed to translate text. Check if Python server is running.");
    } finally {
      setIsTranslating(null);
    }
  };

<<<<<<< HEAD
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

=======
  const chartData = [...reports]
    .filter(r => r.vitals && (r.vitals.heartRate || r.vitals.bloodSugar || r.vitals.temperature))
    .sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate))
    .map(r => ({
      date: new Date(r.visitDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      HeartRate: r.vitals.heartRate,
      BloodSugar: r.vitals.bloodSugar,
      Temperature: r.vitals.temperature
    }));

  const handleDownload = (report) => {
    const content = `MEDICAL REPORT\n\nDiagnosis: ${report.diseaseName}\nDoctor: ${report.doctorName}\nHospital: ${report.hospitalName}\nDate: ${new Date(report.visitDate).toLocaleDateString()}\n\nSUMMARY:\n${translations[report._id] || report.extractedText}\n\nACTION PLAN:\n${report.actionPlan?.join('\n') || 'None'}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `SmartPHR_${report.diseaseName}.txt`; a.click();
  };

  const handleShare = async (report) => {
    if (navigator.share) {
      try { await navigator.share({ title: `Medical Report: ${report.diseaseName}`, text: `Diagnosis: ${report.diseaseName}\nDoctor: Dr. ${report.doctorName}\nSummary: ${translations[report._id] || report.extractedText}` }); } 
      catch (err) { console.log('User cancelled share', err); }
    } else { alert("Sharing not supported on this browser."); }
  };

  const handlePrint = (report) => {
    const printContent = `<div style="font-family: sans-serif; padding: 20px;"><h1>Medical Report: ${report.diseaseName}</h1><p><strong>Doctor:</strong> ${report.doctorName}</p><hr/><h3>Summary</h3><p>${translations[report._id] || report.extractedText}</p>${report.croppedScanUrl ? `<img src="${report.croppedScanUrl}" style="max-width: 400px;"/>` : ''}</div>`;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(printContent); printWindow.document.close();
    printWindow.focus(); printWindow.print(); printWindow.close();
  };

  const handleDelete = async (reportId) => {
    if (window.confirm("Delete this report permanently?")) {
      try {
        await axios.delete(`http://localhost:5001/api/reports/${reportId}`);
        setReports(reports.filter(r => r._id !== reportId));
        setStats(prev => ({ ...prev, totalReports: prev.totalReports - 1 }));
      } catch (error) { alert("Failed to delete report."); }
    }
  };

  const handleEdit = (reportId) => navigate(`/edit/${reportId}`);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.diseaseName?.toLowerCase().includes(searchTerm.toLowerCase()) || report.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) || report.doctorName?.toLowerCase().includes(searchTerm.toLowerCase());
>>>>>>> e5788e615c75eae463b3b1553d6c2202668a334a
    if (filterDate === 'all') return matchesSearch;
    if (filterDate === 'month') {
      const oneMonthAgo = new Date(); oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return matchesSearch && new Date(report.visitDate) >= oneMonthAgo;
    }
    if (filterDate === 'year') {
      const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return matchesSearch && new Date(report.visitDate) >= oneYearAgo;
    }
    return matchesSearch;
  });

  const groupedReports = filteredReports.reduce((acc, report) => {
    const date = new Date(report.visitDate);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(report);
    return acc;
  }, {});

  return (
    <div style={styles.container}>
      <div style={{ ...styles.header, padding: windowWidth <= 480 ? '10px 15px' : '15px 30px' }}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.logo}><ShieldCheck size={32} color="#3498db" /><span style={styles.logoText}>Smart<span style={{ color: '#3498db' }}>.Health</span></span></div>
          </div>
<<<<<<< HEAD

=======
>>>>>>> e5788e615c75eae463b3b1553d6c2202668a334a
          <div style={styles.headerRight}>
            <button onClick={handleLogout} style={styles.logoutButton} className="btn-outline-3d"><LogOut size={18} /><span>Logout</span></button>
          </div>
        </div>
      </div>

<<<<<<< HEAD
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
=======
      <div style={{ ...styles.statsGrid, gridTemplateColumns: windowWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', padding: '20px 30px' }}>
>>>>>>> e5788e615c75eae463b3b1553d6c2202668a334a
        <div style={styles.statCard} className="stat-card">
          <div style={styles.statIconContainer}><FileText size={24} color="#3498db" /></div>
          <div style={styles.statInfo}><span style={styles.statValue}>{stats.totalReports}</span><span style={styles.statLabel}>Total Reports</span></div>
        </div>
        <div style={styles.statCard} className="stat-card">
          <div style={styles.statIconContainer}><User size={24} color="#2ecc71" /></div>
          <div style={styles.statInfo}><span style={styles.statValue}>{stats.uniqueDoctors}</span><span style={styles.statLabel}>Providers</span></div>
        </div>
        <div style={styles.statCard} className="stat-card">
          <div style={styles.statIconContainer}><Pill size={24} color="#e74c3c" /></div>
          <div style={styles.statInfo}><span style={styles.statValue}>{stats.medications}</span><span style={styles.statLabel}>Prescriptions</span></div>
        </div>
        <div style={styles.statCard} className="stat-card">
          <div style={styles.statIconContainer}><Calendar size={24} color="#9b59b6" /></div>
          <div style={styles.statInfo}><span style={{...styles.statValue, fontSize: '20px'}}>{stats.lastVisit ? new Date(stats.lastVisit).toLocaleDateString() : 'N/A'}</span><span style={styles.statLabel}>Last Visit</span></div>
        </div>
      </div>

      <div style={{ ...styles.mainContent, padding: '0 30px' }}>
        
        {chartData.length > 0 && (
          <div className="animate-fade-in" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '25px', marginBottom: '40px', backdropFilter: 'blur(10px)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity color="#e74c3c" /> Health Trends
            </h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#7f8c8d" />
                  <YAxis stroke="#7f8c8d" />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="HeartRate" name="Heart Rate (bpm)" stroke="#e74c3c" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="BloodSugar" name="Blood Sugar (mg/dL)" stroke="#3498db" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div style={{ ...styles.searchBar, flexDirection: windowWidth <= 768 ? 'column' : 'row' }}>
          <div style={styles.searchInputContainer}>
            <Search size={20} color="#7f8c8d" />
            <input type="text" placeholder="Search by condition or doctor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
          </div>
<<<<<<< HEAD

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
=======
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link to="/scan" style={styles.uploadButton} className="btn-3d"><PlusCircle size={18} /><span>Upload Report</span></Link>
>>>>>>> e5788e615c75eae463b3b1553d6c2202668a334a
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}><Activity size={48} color="#3498db" style={{animation: 'spin 2s linear infinite'}} /></div>
        ) : filteredReports.length === 0 ? (
<<<<<<< HEAD
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
=======
          <div style={styles.emptyState}><h3>No Reports Found</h3></div>
>>>>>>> e5788e615c75eae463b3b1553d6c2202668a334a
        ) : (
          <div style={styles.timeline}>
            {Object.entries(groupedReports).map(([monthYear, monthReports]) => (
              <div key={monthYear} style={styles.timelineSection}>
<<<<<<< HEAD
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
=======
                <div style={styles.timelineHeader}><div style={styles.timelineDot}></div><h3 style={styles.timelineMonth}>{monthYear}</h3><div style={styles.timelineLine}></div></div>
                
                <div style={{ ...styles.reportsGrid, gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(auto-fill, minmax(500px, 1fr))' }}>
>>>>>>> e5788e615c75eae463b3b1553d6c2202668a334a
                  {monthReports.map((report) => {
                    const isExpanded = expandedId === report._id;

                    return (
<<<<<<< HEAD
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
=======
                      <div key={report._id} style={{ ...styles.reportCard, ...(isExpanded ? styles.reportCardExpanded : {}) }} className="feature-card-3d">
                        <div onClick={() => toggleExpand(report._id)} style={styles.reportHeader}>
>>>>>>> e5788e615c75eae463b3b1553d6c2202668a334a
                          <div style={styles.reportHeaderLeft}>
                            <div style={styles.reportIcon}><FileText size={24} color="#3498db" /></div>
                            <div style={styles.reportInfo}>
                              <h4 style={styles.reportTitle}>{report.diseaseName || "General Assessment"}</h4>
                              <div style={styles.reportMeta}>
                                <span style={styles.reportMetaItem}><Calendar size={14} />{new Date(report.visitDate).toLocaleDateString()}</span>
                                <span style={styles.reportMetaItem}><Building size={14} />{report.hospitalName}</span>
                              </div>
                            </div>
                          </div>
<<<<<<< HEAD

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
=======
                          
                          {/* BADGES RE-ADDED HERE */}
                          <div style={styles.reportHeaderRight}>
                            {report.voiceReportUrl && <div style={{width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(230, 126, 34, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Volume2 size={16} color="#e67e22" /></div>}
                            {report.croppedScanUrl && <div style={{width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(52, 152, 219, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><FileImage size={16} color="#3498db" /></div>}
                            <div style={styles.expandIcon}>{isExpanded ? <ChevronUp size={20} color="#3498db" /> : <ChevronDown size={20} color="#7f8c8d" />}</div>
>>>>>>> e5788e615c75eae463b3b1553d6c2202668a334a
                          </div>
                        </div>

                        {isExpanded && (
                          <div style={styles.reportDetails}>
<<<<<<< HEAD
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
=======
                            
                            {report.vitals && (report.vitals.bloodPressure || report.vitals.heartRate || report.vitals.bloodSugar || report.vitals.temperature) && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', padding: '15px', backgroundColor: 'rgba(52, 152, 219, 0.05)', borderRadius: '12px', border: '1px solid rgba(52, 152, 219, 0.1)' }}>
                                {report.vitals.bloodPressure && (
                                  <div><span style={{fontSize: '11px', color: '#7f8c8d', fontWeight: 'bold'}}>BLOOD PRESSURE</span><br/><span style={{fontSize: '16px', color: '#3498db', fontWeight: 'bold'}}>{report.vitals.bloodPressure}</span></div>
                                )}
                                {report.vitals.heartRate && (
                                  <div><span style={{fontSize: '11px', color: '#7f8c8d', fontWeight: 'bold'}}>HEART RATE</span><br/><span style={{fontSize: '16px', color: '#e74c3c', fontWeight: 'bold'}}>{report.vitals.heartRate} bpm</span></div>
                                )}
                                {report.vitals.bloodSugar && (
                                  <div><span style={{fontSize: '11px', color: '#7f8c8d', fontWeight: 'bold'}}>BLOOD SUGAR</span><br/><span style={{fontSize: '16px', color: '#9b59b6', fontWeight: 'bold'}}>{report.vitals.bloodSugar} mg/dL</span></div>
                                )}
                                {report.vitals.temperature && (
                                  <div><span style={{fontSize: '11px', color: '#7f8c8d', fontWeight: 'bold'}}>TEMPERATURE</span><br/><span style={{fontSize: '16px', color: '#f1c40f', fontWeight: 'bold'}}>{report.vitals.temperature}°</span></div>
                                )}
>>>>>>> e5788e615c75eae463b3b1553d6c2202668a334a
                              </div>
                            )}

                            <div style={styles.detailSection}>
                              <div style={styles.doctorBadge}><Stethoscope size={16} color="#3498db" /><span>Dr. {report.doctorName}</span></div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', background: 'rgba(155, 89, 182, 0.05)', borderRadius: '12px', border: '1px solid rgba(155, 89, 182, 0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Brain size={16} color="#9b59b6" />
                                    <span style={{ color: '#9b59b6', fontWeight: 'bold', fontSize: '14px' }}>AI Patient Summary</span>
                                  </div>
                                  
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <select id={`lang-${report._id}`} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
                                      <option style={{ color: 'black' }} value="English">English</option>
                                      <option style={{ color: 'black' }} value="Hindi">Hindi</option>
                                      <option style={{ color: 'black' }} value="Tamil">Tamil</option>
                                      <option style={{ color: 'black' }} value="Telugu">Telugu</option>
                                      <option style={{ color: 'black' }} value="Spanish">Spanish</option>
                                      <option style={{ color: 'black' }} value="French">French</option>
                                    </select>
                                    <button 
                                      onClick={() => handleTranslate(report._id, report.extractedText)}
                                      disabled={isTranslating === report._id}
                                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: isTranslating === report._id ? 'default' : 'pointer' }}
                                    >
                                      {isTranslating === report._id ? <Activity size={14} className="spinner" /> : <Globe size={14} />}
                                      Translate
                                    </button>
                                  </div>
                                </div>
                                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                                  {translations[report._id] ? translations[report._id] : report.extractedText}
                                </p>
                              </div>
                            </div>

                            {/* --- AUDIO PLAYER RE-ADDED HERE --- */}
                            {report.voiceReportUrl && (
                              <div style={{ display: 'flex', gap: '15px', padding: '15px', background: 'rgba(230, 126, 34, 0.05)', borderRadius: '12px', border: '1px solid rgba(230, 126, 34, 0.1)', alignItems: 'center', flexWrap: 'wrap' }}>
                                <Volume2 size={18} color="#e67e22" />
                                <span style={{ fontSize: '14px', color: '#e67e22', fontWeight: 'bold' }}>Clinical Audio Summary</span>
                                <audio controls src={report.voiceReportUrl} style={{ flex: 1, minWidth: '200px', height: '40px' }} />
                              </div>
                            )}

                            {report.croppedScanUrl && (
                              <div style={{ padding: '15px', background: 'rgba(52, 152, 219, 0.05)', borderRadius: '12px', border: '1px solid rgba(52, 152, 219, 0.1)', textAlign: 'center' }}>
                                <img src={report.croppedScanUrl} alt="Medical Scan" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
                              </div>
                            )}

                            {/* UTILITIES */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleEdit(report._id)} style={{...styles.actionButton, color: '#f1c40f', borderColor: 'rgba(241, 196, 15, 0.3)'}}><Edit size={16} /> Edit</button>
                                <button onClick={() => handleDelete(report._id)} style={{...styles.actionButton, color: '#e74c3c', borderColor: 'rgba(231, 76, 60, 0.3)'}}><Trash2 size={16} /> Delete</button>
                              </div>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleDownload(report)} style={styles.actionButton}><Download size={16} /> Save</button>
                                <button onClick={() => handleShare(report)} style={styles.actionButton}><Share2 size={16} /> Share</button>
                                <button onClick={() => handlePrint(report)} style={styles.actionButton}><Printer size={16} /> Print</button>
                              </div>
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
<<<<<<< HEAD

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
=======
      <style jsx>{`.icon-3d:hover { transform: translateY(-2px); } .actionButton:hover { background: rgba(255,255,255,0.1) !important; } @keyframes spin { 100% { transform: rotate(360deg); } } .spinner { animation: spin 2s linear infinite; }`}</style>
>>>>>>> e5788e615c75eae463b3b1553d6c2202668a334a
    </div>
  );
}

const styles = {
<<<<<<< HEAD
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
=======
  container: { fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#0a0f1c', color: '#ffffff', overflowX: 'hidden' },
  header: { background: 'rgba(10, 15, 28, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(52, 152, 219, 0.2)', position: 'sticky', top: 0, zIndex: 100 },
  headerContent: { maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '30px' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoText: { fontWeight: 'bold', color: '#ffffff', fontSize: '20px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '15px' },
  logoutButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(231, 76, 60, 0.1)', border: '1px solid rgba(231, 76, 60, 0.3)', borderRadius: '12px', color: '#e74c3c', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  statsGrid: { display: 'grid', gap: '20px', maxWidth: '1400px', margin: '0 auto' },
  statCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)' },
  statIconContainer: { width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(52, 152, 219, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' },
  statInfo: { display: 'flex', flexDirection: 'column', gap: '5px' },
  statValue: { fontWeight: 'bold', color: '#ffffff', fontSize: '32px' },
  statLabel: { fontSize: '14px', color: 'rgba(255,255,255,0.7)' },
  mainContent: { maxWidth: '1400px', margin: '0 auto' },
  searchBar: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', gap: '20px' },
  searchInputContainer: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px' },
  searchInput: { flex: 1, background: 'none', border: 'none', color: '#ffffff', outline: 'none' },
  uploadButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #3498db, #2980b9)', borderRadius: '12px', color: '#ffffff', textDecoration: 'none' },
  timeline: { display: 'flex', flexDirection: 'column', gap: '40px' },
  timelineSection: { position: 'relative' },
  timelineHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
  timelineDot: { width: '12px', height: '12px', borderRadius: '50%', background: '#3498db' },
  timelineMonth: { fontWeight: '600', color: '#ffffff', margin: 0 },
  timelineLine: { flex: 1, height: '2px', background: 'linear-gradient(90deg, rgba(52,152,219,0.3), transparent)' },
  reportsGrid: { display: 'grid', gap: '20px' },
  reportCard: { background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' },
  reportCardExpanded: { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(52,152,219,0.3)' },
  reportHeader: { padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  reportHeaderLeft: { display: 'flex', gap: '15px' },
  reportIcon: { width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(52,152,219,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  reportInfo: { display: 'flex', flexDirection: 'column', gap: '8px' },
  reportTitle: { fontWeight: '600', color: '#ffffff', margin: 0 },
  reportMeta: { display: 'flex', gap: '15px' },
  reportMetaItem: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' },
  reportHeaderRight: { display: 'flex', alignItems: 'center', gap: '15px' },
  expandIcon: { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  reportDetails: { padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' },
  detailSection: { display: 'flex', flexDirection: 'column', gap: '15px' },
  doctorBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(52,152,219,0.1)', borderRadius: '30px', fontSize: '14px', alignSelf: 'flex-start' },
  actionButton: { display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', cursor: 'pointer' }
>>>>>>> e5788e615c75eae463b3b1553d6c2202668a334a
};


export default Dashboard;