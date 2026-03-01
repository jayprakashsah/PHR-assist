import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, Activity, FileText, Save, Volume2, ArrowLeft } from 'lucide-react';
import '../App.css'; 

function Scanner() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  // Security Check: If not logged in, send them to the login page!
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/');
    }
  }, [navigate]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a report image first!");

    setLoading(true);
    setReportData(null);
    setIsSaved(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/analyze-report", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setReportData(response.data.data);
    } catch (error) {
      console.error("Error analyzing report:", error);
      alert("Failed to analyze the report. Is the Python server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDB = async () => {
    try {
      // 1. Get the logged-in user's secure ID
      const userId = localStorage.getItem('userId');
      
      // 2. Attach the patientId to the report data so MongoDB knows who owns it!
      const payloadToSave = {
        ...reportData,
        patientId: userId 
      };

      await axios.post("http://localhost:5001/api/reports/add", payloadToSave);
      setIsSaved(true);
      alert("Report securely saved to your private health profile!");
      
      // Send them back to the dashboard to see it!
      setTimeout(() => navigate('/dashboard'), 1500);
      
    } catch (error) {
      console.error("Error saving report:", error);
      alert("Failed to save. Is the Node.js server running on port 5001?");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2c3e50', margin: 0 }}>
          <Activity color="#e74c3c" /> Smart Scanner
        </h1>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#3498db', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
      </div>

      <div style={{ border: '2px dashed #bdc3c7', padding: '30px', borderRadius: '10px', textAlign: 'center', backgroundColor: '#f9f9f9' }}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setFile(e.target.files[0])} 
          style={{ marginBottom: '15px' }}
        />
        <br />
        <button 
          onClick={handleAnalyze} 
          disabled={loading}
          style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
        >
          <Upload size={18} />
          {loading ? "AI is analyzing..." : "Analyze Report"}
        </button>
      </div>

      {reportData && (
        <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ecf0f1', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#27ae60' }}>
            <FileText /> Extracted Medical Record
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <p><strong>Doctor:</strong> {reportData.doctorName}</p>
            <p><strong>Hospital:</strong> {reportData.hospitalName}</p>
            <p><strong>Date:</strong> {reportData.visitDate}</p>
            <p><strong>Diagnosis:</strong> {reportData.diseaseName}</p>
          </div>

          <button 
            onClick={handleSaveToDB}
            disabled={isSaved}
            style={{ padding: '12px 20px', backgroundColor: isSaved ? '#95a5a6' : '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', fontWeight: 'bold' }}
          >
            <Save size={18} />
            {isSaved ? "Saved to Database" : "Save Record to Private Profile"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Scanner;