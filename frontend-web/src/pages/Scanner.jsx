import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, Activity, Save, ArrowLeft, Camera, Edit3, FileImage, X, AlertTriangle } from 'lucide-react';
import '../App.css'; 

function Scanner() {
  const [files, setFiles] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [currentMeds, setCurrentMeds] = useState(""); // NEW: Stores active meds for safety check
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/');
      return;
    }

    // NEW: Fetch active medications from your reminders to cross-check with new reports
    const fetchCurrentMeds = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/reminders/user/${userId}`);
        // Create a simple string of names: "Aspirin, Metformin, etc."
        const medNames = response.data.map(rem => rem.medicineName).join(', ');
        setCurrentMeds(medNames || "None");
      } catch (error) {
        console.error("Could not fetch current meds for safety check", error);
        setCurrentMeds("None");
      }
    };
    fetchCurrentMeds();
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]); 
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert("Please select at least one report image first!");

    setLoading(true);
    setReportData(null);
    setIsSaved(false);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file); 
    });

    // NEW: Send the active medications to the Python AI server
    formData.append("current_meds", currentMeds);

    try {
      const response = await axios.post("http://localhost:8000/analyze-report", formData);
      
      // FIX: We must add the second '.data' to unpack the Python response correctly!
      setReportData(response.data.data); 
      
    } catch (error) {
      console.error("Error analyzing report:", error);
      alert("Failed to analyze the report. Is the Python server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveToDB = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const payloadToSave = { ...reportData, patientId: userId };

      const formDataToSave = new FormData();
      formDataToSave.append("reportData", JSON.stringify(payloadToSave)); 
      
      files.forEach((file) => {
        formDataToSave.append("files", file);
      });

      await axios.post("http://localhost:5001/api/reports/add", formDataToSave, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setIsSaved(true);
      alert("Report AND Original Scans securely saved to your vault!");

      if (reportData.medicines && reportData.medicines.length > 0) {
        navigate('/confirm-reminders', { state: { medicines: reportData.medicines } });
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error("Error saving report:", error);
      alert("Failed to save to database. Check console.");
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2c3e50', margin: 0 }}>
          <Activity color="#e74c3c" /> Smart Batch Scanner
        </h1>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#3498db', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
          <ArrowLeft size={18} /> Back to Vault
        </Link>
      </div>

      {/* Uploader Section */}
      <div style={{ border: '2px dashed #bdc3c7', padding: '40px 20px', borderRadius: '12px', textAlign: 'center', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
          <label style={{ cursor: 'pointer', backgroundColor: '#f1f8ff', color: '#3498db', padding: '15px 25px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #3498db', transition: '0.2s' }}>
            <Camera size={20} /> Add Pages
            <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
        </div>

        {files.length > 0 && (
          <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{files.length} Pages Selected:</h4>
            {files.map((file, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8f9fa', padding: '8px 15px', borderRadius: '20px', border: '1px solid #ecf0f1' }}>
                <FileImage size={16} color="#27ae60" />
                <span style={{ fontSize: '14px', color: '#34495e', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                <X size={16} color="#e74c3c" style={{ cursor: 'pointer' }} onClick={() => removeFile(index)} />
              </div>
            ))}
          </div>
        )}
        
        <button 
          onClick={handleAnalyze} 
          disabled={loading || files.length === 0}
          style={{ padding: '12px 30px', backgroundColor: loading || files.length === 0 ? '#bdc3c7' : '#2c3e50', color: 'white', border: 'none', borderRadius: '8px', cursor: loading || files.length === 0 ? 'default' : 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', transition: '0.2s', fontWeight: 'bold' }}
        >
          <Upload size={18} />
          {loading ? "AI is cross-checking meds..." : "Analyze Safety & Data"}
        </button>
      </div>

      {reportData && (
        <>
          {/* NEW: CRITICAL DRUG INTERACTION BANNER */}
          {reportData.drugInteractions && reportData.drugInteractions.length > 0 && (
            <div className="animate-fade-in" style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '20px', borderRadius: '10px', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '15px', border: '2px solid #ef4444', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ backgroundColor: '#ef4444', padding: '15px', borderRadius: '8px' }}>
                  <AlertTriangle size={32} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '900' }}>
                    SAFETY WARNING: Interaction Detected
                  </h3>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>
                    The AI found conflicts between your current meds ({currentMeds}) and this new report.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {reportData.drugInteractions.map((interaction, idx) => (
                  <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', borderLeft: '5px solid #ef4444' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#1f2937' }}>{interaction.interactingDrugs}</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>{interaction.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI X-Ray Detection Banner */}
          {reportData.containsVisualScan && (
            <div className="animate-fade-in" style={{ backgroundColor: '#111827', color: 'white', padding: '20px', borderRadius: '10px', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '15px', borderLeft: '4px solid #3498db' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <FileImage size={32} color="#3498db" />
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#60a5fa' }}>Radiography Detected</h3>
                  <p style={{ margin: 0, color: '#d1d5db' }}>Type: <strong>{reportData.scanType}</strong></p>
                </div>
              </div>
              {reportData.croppedScanUrl && (
                <div style={{ textAlign: 'center', backgroundColor: 'black', padding: '10px', borderRadius: '8px' }}>
                  <img src={reportData.croppedScanUrl} alt="Cropped" style={{ maxHeight: '250px', maxWidth: '100%', borderRadius: '4px' }} />
                </div>
              )}
            </div>
          )}

          {/* Editable Form */}
          <div className="animate-fade-in" style={{ padding: '30px', border: '1px solid #ecf0f1', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#27ae60', marginTop: 0, borderBottom: '2px solid #ecf0f1', paddingBottom: '15px' }}>
              <Edit3 size={24} /> Review Extraction
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>DIAGNOSIS</label>
                <input type="text" name="diseaseName" value={reportData.diseaseName || ''} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>DATE</label>
                <input type="text" name="visitDate" value={reportData.visitDate || ''} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>AI PATIENT SUMMARY</label>
                <textarea name="patientFriendlySummary" value={reportData.patientFriendlySummary || ''} onChange={handleInputChange} rows="3" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7' }} />
              </div>
            </div>

            <button onClick={handleSaveToDB} disabled={isSaved} style={{ padding: '15px 20px', backgroundColor: isSaved ? '#95a5a6' : '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: isSaved ? 'default' : 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', fontWeight: 'bold' }}>
              <Save size={20} /> {isSaved ? "Saved" : "Save to Vault"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Scanner;