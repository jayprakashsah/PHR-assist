import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Calendar, Building, ChevronDown, ChevronUp, Pill, Volume2, LogOut, ShieldCheck, CheckCircle, HelpCircle, Activity } from 'lucide-react';

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    if (!userId) {
      navigate('/'); 
      return;
    }

    const fetchReports = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/reports/user/${userId}`);
        setReports(response.data);
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

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
    
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h3 style={{ margin: 0, color: '#7f8c8d', fontSize: '18px' }}>Clinical History</h3>
        <Link to="/scan" style={{ padding: '12px 20px', backgroundColor: '#2c3e50', color: 'white', textDecoration: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px', transition: '0.2s', boxShadow: '0 4px 10px rgba(44, 62, 80, 0.3)' }}>
          <PlusCircle size={18} /> Upload New Report
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Activity size={40} color="#3498db" className="spinner" style={{ margin: '0 auto', animation: 'spin 2s linear infinite' }} />
          <p style={{ color: '#95a5a6', marginTop: '15px' }}>Decrypting your medical records...</p>
        </div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px', border: '2px dashed #bdc3c7' }}>
          <p style={{ color: '#7f8c8d', fontSize: '16px' }}>Your vault is empty. Click "Upload New Report" to digitize your first document.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {reports.map((report) => {
            const isExpanded = expandedId === report._id;

            return (
              <div key={report._id} style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: isExpanded ? '0 10px 25px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden', borderLeft: '5px solid #3498db', transition: 'all 0.3s ease' }}>
                
                {/* Always Visible Summary Header (Clickable) */}
                <div 
                  onClick={() => toggleExpand(report._id)}
                  style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: isExpanded ? '#f8fbff' : 'white' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '22px', fontWeight: '800', color: '#2c3e50' }}>
                      {report.diseaseName || "General Assessment"}
                    </span>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '15px', color: '#7f8c8d', fontWeight: '500' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} color="#3498db"/> {new Date(report.visitDate).toLocaleDateString()}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Building size={16} color="#e67e22"/> {report.hospitalName}</span>
                    </div>
                  </div>
                  <div style={{ backgroundColor: isExpanded ? '#e1efff' : '#f1f2f6', padding: '8px', borderRadius: '50%' }}>
                    {isExpanded ? <ChevronUp color="#3498db" size={24} /> : <ChevronDown color="#7f8c8d" size={24} />}
                  </div>
                </div>

                {/* Expanded Detailed View */}
                {isExpanded && (
                  <div style={{ padding: '30px', borderTop: '1px solid #ecf0f1', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    
                    {/* Top Row: Audio & Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
                      
                      {/* Factual Audio Player */}
                      {report.voiceReportUrl && (
                        <div style={{ backgroundColor: '#fff5ea', padding: '20px', borderRadius: '10px', border: '1px solid #ffe0b2' }}>
                          <h4 style={{ margin: '0 0 15px 0', color: '#d35400', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                            <Volume2 size={20} /> Clinical Audio Brief
                          </h4>
                          <audio controls src={report.voiceReportUrl} style={{ width: '100%', height: '40px', outline: 'none' }}></audio>
                        </div>
                      )}

                      {/* Reason & Summary */}
                      <div style={{ backgroundColor: '#f1f8ff', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #3498db' }}>
                        {report.reasonForCondition && (
                          <div style={{ marginBottom: '15px' }}>
                            <strong style={{ color: '#2980b9', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                              <HelpCircle size={16} /> Identified Cause / Reason:
                            </strong>
                            <p style={{ margin: 0, color: '#34495e', lineHeight: '1.5' }}>{report.reasonForCondition}</p>
                          </div>
                        )}
                        <strong style={{ color: '#2980b9' }}>Patient Summary:</strong>
                        <p style={{ margin: '5px 0 0 0', color: '#34495e', lineHeight: '1.6' }}>{report.extractedText}</p>
                      </div>
                    </div>

                    {/* Bottom Row: Action Plan & Medicines */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      
                      {/* Step-by-Step Action Plan */}
                      {report.actionPlan && report.actionPlan.length > 0 && (
                        <div style={{ backgroundColor: '#e8f8f5', padding: '20px', borderRadius: '10px', border: '1px solid #d1f2eb' }}>
                          <h4 style={{ margin: '0 0 15px 0', color: '#16a085', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                            <CheckCircle size={20} /> Recommended Action Plan
                          </h4>
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {report.actionPlan.map((step, index) => (
                              <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#2c3e50', lineHeight: '1.5' }}>
                                <CheckCircle size={18} color="#1abc9c" style={{ marginTop: '2px', flexShrink: 0 }} />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Prescriptions with PURPOSE */}
                      {report.medicines && report.medicines.length > 0 && (
                        <div style={{ backgroundColor: '#fdf2e9', padding: '20px', borderRadius: '10px', border: '1px solid #fae5d3' }}>
                          <h4 style={{ margin: '0 0 15px 0', color: '#e67e22', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                            <Pill size={20} /> Prescriptions & Purpose
                          </h4>
                          <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {report.medicines.map((med, index) => (
                              <li key={index} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                  <strong style={{ color: '#d35400', fontSize: '16px' }}>{med.name}</strong>
                                  <span style={{ backgroundColor: '#fdedec', color: '#c0392b', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                                    {med.specification}
                                  </span>
                                </div>
                                {/* The highly valuable "Purpose" field */}
                                {med.purpose && (
                                  <div style={{ color: '#7f8c8d', fontSize: '14px', borderTop: '1px dashed #ecf0f1', paddingTop: '6px', marginTop: '6px' }}>
                                    <strong>Why:</strong> {med.purpose}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '10px', fontSize: '13px', color: '#bdc3c7', textAlign: 'right', fontWeight: 'bold' }}>
                      Attending Physician: Dr. {report.doctorName}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;