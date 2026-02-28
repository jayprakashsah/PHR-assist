import { useState } from 'react';
import axios from 'axios';
import { Upload, Activity, FileText, Save, Volume2 } from 'lucide-react';
import '../App.css'; 

function Scanner() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // 1. Send the image to the Python AI Server (Runs on 8000)
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

  // 2. Save the AI results to our Node.js Database (Now running on 5001)
  const handleSaveToDB = async () => {
    try {
      // --- FIXED: Changed port from 5000 to 5001 to bypass Mac AirPlay block ---
      await axios.post("http://localhost:5001/api/reports/add", reportData);
      setIsSaved(true);
      alert("Report securely saved to your health profile!");
    } catch (error) {
      console.error("Error saving report:", error);
      alert("Failed to save. Is the Node.js server running on port 5001?");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2c3e50' }}>
        <Activity color="#e74c3c" /> Smart PHR Scanner
      </h1>
      <p>Upload a photo of your medical report to digitize it, summarize it, and generate a voice memo.</p>

      {/* Upload Section */}
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

      {/* Results Section */}
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

          <div style={{ backgroundColor: '#f1f8ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <strong>AI Summary:</strong>
            <p style={{ margin: '5px 0 0 0' }}>{reportData.extractedText}</p>
          </div>

          {reportData.voiceReportUrl && (
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Volume2 color="#8e44ad" />
              <strong>Voice Summary:</strong>
              <audio controls src={reportData.voiceReportUrl} style={{ height: '30px' }}></audio>
            </div>
          )}

          {/* Medicines List */}
          {reportData.medicines && reportData.medicines.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <strong>Prescribed Medicines:</strong>
              <ul>
                {reportData.medicines.map((med, index) => (
                  <li key={index}><strong>{med.name}</strong> - {med.specification}</li>
                ))}
              </ul>
            </div>
          )}

          <button 
            onClick={handleSaveToDB}
            disabled={isSaved}
            style={{ padding: '10px 20px', backgroundColor: isSaved ? '#95a5a6' : '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}
          >
            <Save size={18} />
            {isSaved ? "Saved to Database" : "Save Record to Profile"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Scanner;