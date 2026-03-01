import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, Activity, Save, ArrowLeft, Camera, Edit3, FileImage, X } from 'lucide-react';
import '../App.css'; 

function Scanner() {
  const [files, setFiles] = useState([]); // NEW: Now an array!
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) navigate('/');
  }, [navigate]);

  // NEW: Handle multiple file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]); // Append new files to existing ones
  };

  // NEW: Remove a file if they selected the wrong one
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
    // NEW: Loop through all files and append them to formData under the name 'files'
    files.forEach((file) => {
      formData.append("files", file); 
    });

    try {
      // Let the browser automatically set the correct multi-part boundaries!
      const response = await axios.post("http://localhost:8000/analyze-report", formData);
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

      // 1. Save the main report
      await axios.post("http://localhost:5001/api/reports/add", payloadToSave);
      
      // 2. NEW: Automatically set alarms for all extracted medicines!
      if (reportData.medicines && reportData.medicines.length > 0) {
        try {
          await axios.post("http://localhost:5001/api/reminders/add-bulk", {
            userId: userId,
            medicines: reportData.medicines
          });
          console.log("✅ Auto-reminders set!");
        } catch (alarmError) {
          console.error("Failed to set alarms, but report saved.", alarmError);
        }
      }

      setIsSaved(true);
      alert("Report securely saved and automated reminders have been set!");
      setTimeout(() => navigate('/dashboard'), 1500);
      
    } catch (error) {
      console.error("Error saving report:", error);
      alert("Failed to save to database.");
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

      <div style={{ border: '2px dashed #bdc3c7', padding: '40px 20px', borderRadius: '12px', textAlign: 'center', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '30px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
          <label style={{ cursor: 'pointer', backgroundColor: '#f1f8ff', color: '#3498db', padding: '15px 25px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #3498db', transition: '0.2s' }}>
            <Camera size={20} /> Add Pages
            {/* NEW: Added the 'multiple' attribute! */}
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleFileChange} 
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* NEW: Display the list of selected files nicely */}
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
          {loading ? "AI is reading all pages..." : "Extract Data from All Pages"}
        </button>
      </div>

      {/* Editable Form - Same as before */}
      {reportData && (
        <div className="animate-fade-in" style={{ padding: '30px', border: '1px solid #ecf0f1', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#27ae60', marginTop: 0, borderBottom: '2px solid #ecf0f1', paddingBottom: '15px' }}>
            <Edit3 size={24} /> Review & Edit Extraction
          </h2>
          <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '25px' }}>
            The AI has extracted the following details across all uploaded pages. Review before saving.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>DIAGNOSIS / DISEASE</label>
              <input type="text" name="diseaseName" value={reportData.diseaseName || ''} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7', outline: 'none' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>DATE OF VISIT</label>
              <input type="text" name="visitDate" value={reportData.visitDate || ''} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>DOCTOR NAME</label>
              <input type="text" name="doctorName" value={reportData.doctorName || ''} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>HOSPITAL / CLINIC</label>
              <input type="text" name="hospitalName" value={reportData.hospitalName || ''} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>AI PATIENT SUMMARY</label>
              <textarea name="extractedText" value={reportData.extractedText || ''} onChange={handleInputChange} rows="3" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7', outline: 'none', resize: 'vertical' }} />
            </div>
          </div>

          <button 
            onClick={handleSaveToDB}
            disabled={isSaved}
            style={{ padding: '15px 20px', backgroundColor: isSaved ? '#95a5a6' : '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: isSaved ? 'default' : 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', fontWeight: 'bold', transition: '0.2s' }}
          >
            <Save size={20} />
            {isSaved ? "Saved Successfully" : "Confirm & Save to Vault"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Scanner;