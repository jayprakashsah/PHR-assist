import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Home, FileText, AlertCircle, Building, User, Settings, LogOut } from 'lucide-react';

function MainLayout() {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Knows which page we are currently on
  
  const userName = localStorage.getItem('userName') || "User";

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Helper function to highlight the active tab
  const getTabStyle = (path) => {
    const isActive = location.pathname.includes(path);
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: 'bold',
      color: isActive ? '#3498db' : '#7f8c8d',
      backgroundColor: isActive ? '#f1f8ff' : 'transparent',
      transition: 'all 0.2s ease'
    };
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'sans-serif' }}>
      
      {/* 1. The Global Header / Navbar */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #eef2f5', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        
        {/* App Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: '#e74c3c', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity color="white" size={24} />
          </div>
          <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '22px', letterSpacing: '-0.5px' }}>Smart<span style={{ color: '#3498db' }}>PHR</span></h1>
        </div>

        {/* Main Navigation Links */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/home" style={getTabStyle('/home')}><Home size={18} /> Home</Link>
          <Link to="/dashboard" style={getTabStyle('/dashboard')}><FileText size={18} /> My Reports</Link>
          <Link to="/emergency" style={getTabStyle('/emergency')}><AlertCircle size={18} color={location.pathname === '/emergency' ? '#e74c3c' : '#7f8c8d'} /> Emergency</Link>
          <Link to="/hospitals" style={getTabStyle('/hospitals')}><Building size={18} /> Hospitals</Link>
        </div>

        {/* User Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setProfileOpen(!profileOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 15px', border: '1px solid #ecf0f1', borderRadius: '20px', transition: '0.2s' }}
          >
            <div style={{ backgroundColor: '#3498db', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>{userName}</span>
          </div>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div style={{ position: 'absolute', top: '120%', right: 0, backgroundColor: 'white', border: '1px solid #ecf0f1', borderRadius: '8px', width: '200px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <Link 
                to="/profile" 
                onClick={() => setProfileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', textDecoration: 'none', color: '#2c3e50', borderBottom: '1px solid #f1f2f6' }}
              >
                <User size={16} /> My Profile
              </Link>
              <Link 
                to="/settings" 
                onClick={() => setProfileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', textDecoration: 'none', color: '#2c3e50', borderBottom: '1px solid #f1f2f6' }}
              >
                <Settings size={16} /> Settings
              </Link>
              <div 
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', cursor: 'pointer', color: '#e74c3c' }}
              >
                <LogOut size={16} /> Secure Logout
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* 2. The Dynamic Content Area */}
      {/* <Outlet /> is the magic React Router tag. The pages (Home, Dashboard, etc.) will render inside this box! */}
      <div style={{ padding: '30px' }}>
        <Outlet /> 
      </div>

    </div>
  );
}

export default MainLayout;