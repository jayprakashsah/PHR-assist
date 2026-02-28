import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Activity, PlusCircle, Calendar, User, Building, Pill, Volume2, AlertCircle } from 'lucide-react';

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all reports from the database when the page loads
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Remember: Node is running on port 5001!
        const response = await axios.get("http://localhost:5001/api/reports/all");
        setReports(response.data);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Could not load your medical history. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #e0e6ed' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2c3e50', margin: 0 }}>
          <Activity color="#27ae60" size={32} /> My Health History
        </h1>
        
        <Link to="/scan" style={{ padding: '12px 20px', backgroundColor: '#3498db', color: 'white', textDecoration: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <PlusCircle size={20} /> Scan New Report
        </Link>
      </div>

      {/* Content Section */}
      {loading ? (
        <p style={{ textAlign: 'center', fontSize: '18px', color: '#7f8c8d' }}>Loading your medical records...</p>
      ) : error ? (
        <div style={{ backgroundColor: '#fadbd8', color: '#c0392b', padding: '15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle /> {error}
        </div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#95a5a6' }}>No medical records found.</h3>
          <p style={{ color: '#bdc3c7' }}>Click "Scan New Report" to add your first document.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '25px' }}>
          {reports.map((report) => (
            <div key={report._id} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', borderLeft: '5px solid #2ecc71' }}>
              
              {/* Report Header: Date & Diagnosis */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h2 style={{ margin: '0 0 5px 0', color: '#e74c3c', fontSize: '22px' }}>{report.diseaseName || "General Checkup"}</h2>
                  <div style={{ display: 'flex', gap: '15px', color: '#7f8c8d', fontSize: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={16}/> {new Date(report.visitDate).toLocaleDateString()}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={16}/> Dr. {report.doctorName || "Unknown"}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Building size={16}/> {report.hospitalName || "Unknown Clinic"}</span>
                  </div>
                </div>
              </div>

              {/* AI Summary Highlight */}
              <div style={{ backgroundColor: '#f1f8ff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #d6eaf8' }}>
                <strong style={{ color: '#2980b9' }}>AI Medical Summary:</strong>
                <p style={{ margin: '5px 0 0 0', color: '#34495e', lineHeight: '1.5' }}>{report.extractedText}</p>
              </div>

              {/* Split Layout for Medicines & Audio */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                
                {/* Medicines List */}
                {report.medicines && report.medicines.length > 0 && (
                  <div style={{ flex: '1', minWidth: '250px' }}>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2c3e50', marginBottom: '10px' }}>
                      <Pill size={18} color="#8e44ad" /> Prescribed Medicines
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#555' }}>
                      {report.medicines.map((med, index) => (
                        <li key={index} style={{ marginBottom: '5px' }}>
                          <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>{med.name}</span>: {med.specification}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Voice Report */}
                {report.voiceReportUrl && (
                  <div style={{ flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2c3e50', marginBottom: '10px' }}>
                      <Volume2 size={18} color="#f39c12" /> Audio Summary
                    </strong>
                    <audio controls src={report.voiceReportUrl} style={{ width: '100%', height: '35px', outline: 'none' }}></audio>
                  </div>
                )}
                
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;