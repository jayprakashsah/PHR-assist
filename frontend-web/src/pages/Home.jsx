import { Link } from 'react-router-dom';
import { Activity, FileText, AlertCircle, Building, ShieldCheck, ChevronRight, Stethoscope } from 'lucide-react';
import '../App.css'; // This brings in our new animations!

function Home() {
  const userName = localStorage.getItem('userName') || "User";

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Welcome Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)', borderRadius: '16px', padding: '40px', color: 'white', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px rgba(52, 152, 219, 0.3)' }}>
        <div>
          <h1 style={{ fontSize: '32px', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Welcome back, {userName}! <span style={{ fontSize: '24px' }}>👋</span>
          </h1>
          <p style={{ fontSize: '18px', margin: 0, opacity: 0.9 }}>Your personalized health command center is secure and active.</p>
        </div>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '50%', backdropFilter: 'blur(10px)' }}>
          <ShieldCheck size={48} color="white" />
        </div>
      </div>

      <h2 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '22px' }}>Quick Access Modules</h2>

      {/* Animated Module Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
        
        {/* 1. Reports Module */}
        <Link to="/dashboard" className="module-card" style={{ textDecoration: 'none', backgroundColor: 'white', padding: '30px', borderRadius: '16px', borderTop: '5px solid #3498db', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ backgroundColor: '#ebf5fb', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <FileText size={30} color="#3498db" />
          </div>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '20px' }}>My Reports</h3>
          <p style={{ margin: '0 0 20px 0', color: '#7f8c8d', lineHeight: '1.5', flexGrow: 1 }}>View your AI-analyzed medical histories, action plans, and audio briefs.</p>
          <div style={{ display: 'flex', alignItems: 'center', color: '#3498db', fontWeight: 'bold', gap: '5px' }}>
            Access Vault <ChevronRight size={18} />
          </div>
        </Link>

        {/* 2. Emergency SOS Module */}
        <Link to="/emergency" className="module-card" style={{ textDecoration: 'none', backgroundColor: 'white', padding: '30px', borderRadius: '16px', borderTop: '5px solid #e74c3c', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ backgroundColor: '#fdedec', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <AlertCircle size={30} color="#e74c3c" />
          </div>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '20px' }}>Emergency SOS</h3>
          <p style={{ margin: '0 0 20px 0', color: '#7f8c8d', lineHeight: '1.5', flexGrow: 1 }}>Trigger immediate hostel alerts or contact registered emergency numbers.</p>
          <div style={{ display: 'flex', alignItems: 'center', color: '#e74c3c', fontWeight: 'bold', gap: '5px' }}>
            Open SOS <ChevronRight size={18} />
          </div>
        </Link>

        {/* 3. Hospitals & Doctors Module */}
        <Link to="/hospitals" className="module-card" style={{ textDecoration: 'none', backgroundColor: 'white', padding: '30px', borderRadius: '16px', borderTop: '5px solid #2ecc71', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ backgroundColor: '#e9f7ef', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Building size={30} color="#2ecc71" />
          </div>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '20px' }}>Nearby Hospitals</h3>
          <p style={{ margin: '0 0 20px 0', color: '#7f8c8d', lineHeight: '1.5', flexGrow: 1 }}>Find specialized doctors, clinics, and hospitals in your current area.</p>
          <div style={{ display: 'flex', alignItems: 'center', color: '#2ecc71', fontWeight: 'bold', gap: '5px' }}>
            Find Care <ChevronRight size={18} />
          </div>
        </Link>

        {/* 4. AI Health Chat (Bonus feature idea!) */}
        <div className="module-card" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', borderTop: '5px solid #9b59b6', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}>
          <div style={{ backgroundColor: '#f5eef8', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Stethoscope size={30} color="#9b59b6" />
          </div>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '20px' }}>AI Health Agent</h3>
          <p style={{ margin: '0 0 20px 0', color: '#7f8c8d', lineHeight: '1.5', flexGrow: 1 }}>Ask our AI questions about your symptoms or previous medical reports.</p>
          <div style={{ display: 'flex', alignItems: 'center', color: '#9b59b6', fontWeight: 'bold', gap: '5px' }}>
            Coming Soon <ChevronRight size={18} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;