import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AlertTriangle, Phone, ShieldAlert, Droplet, User, Navigation, Activity, Building, CheckCircle } from 'lucide-react';
import '../App.css';

function Emergency() {
  const [profileData, setProfileData] = useState(null);
  const [alertSent, setAlertSent] = useState(false);
  const [locationStatus, setLocationStatus] = useState("Standby");
  
  // NEW: State to hold the data coming back from our smart Node.js server!
  const [dispatchInfo, setDispatchInfo] = useState(null);
  
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/auth/profile/${userId}`);
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  const triggerSOS = () => {
    setLocationStatus("Locating...");
    setDispatchInfo(null); // Clear previous info
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser or phone.");
      setLocationStatus("GPS Failed");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        try {
          // Send GPS to our smart Node.js Dispatcher
          const response = await axios.post('http://localhost:5001/api/sos/dispatch', {
            userId: userId || 'anonymous',
            userName: profileData?.name || 'Unknown Patient',
            lat: lat,
            lng: lng,
            bloodGroup: profileData?.bloodGroup,
            emergencyContact: profileData?.emergencyContact
          });

          // SUCCESS! The server found the hospital and replied.
          setLocationStatus(`Locked: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          setAlertSent(true);
          
          // Save the target hospital data to show the user
          setDispatchInfo({
            hospital: response.data.targetHospital,
            phone: response.data.targetPhone
          });
          
        } catch (error) {
          console.error("Failed to ping server:", error);
          alert("Network error: Could not connect to emergency dispatch servers.");
          setLocationStatus("Dispatch Failed");
        }

        // We leave the confirmation on screen for 15 seconds so they can read it
        setTimeout(() => {
          setAlertSent(false);
          setLocationStatus("Standby");
          setDispatchInfo(null);
        }, 15000);
      },
      (error) => {
        alert("Unable to retrieve your location. Please ensure Location/GPS services are turned on.");
        setLocationStatus("GPS Denied");
      }
    );
  };

  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'sans-serif' }}>
      
      {/* Top Header */}
      <div style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderBottom: '1px solid #eef2f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: '#e74c3c', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity color="white" size={24} />
          </div>
          <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '22px', letterSpacing: '-0.5px' }}>Smart<span style={{ color: '#3498db' }}>PHR</span></h1>
        </div>
        
        {userId ? (
           <Link to="/home" style={{ padding: '10px 20px', backgroundColor: '#2c3e50', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
             Go to Dashboard
           </Link>
        ) : (
           <Link to="/login" style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <User size={18} /> Login to Medical Vault
           </Link>
        )}
      </div>

      <div style={{ maxWidth: '800px', margin: '40px auto 0', textAlign: 'center', padding: '0 20px' }}>
        
        <div style={{ backgroundColor: '#fdedec', padding: '20px', borderRadius: '12px', border: '1px solid #fadbd8', marginBottom: '40px', display: 'inline-block' }}>
          <h1 style={{ margin: 0, color: '#c0392b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <ShieldAlert size={32} /> Rapid Emergency Response
          </h1>
          <p style={{ margin: '10px 0 0 0', color: '#e74c3c', fontWeight: 'bold' }}>Pressing this button will dispatch your exact GPS location to emergency services.</p>
        </div>

        {/* The Giant SOS Button */}
        <button 
          className={alertSent ? "" : "sos-button"}
          onClick={triggerSOS}
          disabled={alertSent}
          style={{ 
            backgroundColor: alertSent ? '#2ecc71' : '#e74c3c', 
            color: 'white', 
            border: 'none', 
            borderRadius: '50%', 
            width: '280px', 
            height: '280px', 
            fontSize: alertSent ? '40px' : '64px', 
            fontWeight: '900', 
            cursor: alertSent ? 'default' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 30px',
            boxShadow: alertSent ? '0 0 30px rgba(46, 204, 113, 0.6)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          <AlertTriangle size={alertSent ? 48 : 72} style={{ marginBottom: '10px' }} />
          {alertSent ? "DISPATCHED" : "SOS"}
        </button>

        {/* GPS Status Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#7f8c8d', fontWeight: 'bold', marginBottom: '20px' }}>
          <Navigation size={18} color={alertSent ? "#2ecc71" : "#3498db"} />
          GPS Status: <span style={{ color: alertSent ? '#2ecc71' : '#2c3e50' }}>{locationStatus}</span>
        </div>

        {/* NEW: Dynamic Confirmation Card */}
        {dispatchInfo && (
          <div className="animate-fade-in" style={{ backgroundColor: '#e9f7ef', padding: '25px', borderRadius: '12px', border: '2px solid #2ecc71', marginBottom: '40px', textAlign: 'left', display: 'inline-block', width: '100%', maxWidth: '500px', boxShadow: '0 10px 20px rgba(46, 204, 113, 0.15)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#27ae60', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={24} /> Help is on the way!
            </h3>
            <p style={{ margin: '0 0 15px 0', color: '#2c3e50', lineHeight: '1.5' }}>
              Your exact coordinates and medical profile have been securely routed to the nearest available facility:
            </p>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3498db' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#2c3e50', fontWeight: 'bold' }}>
                <Building size={18} color="#3498db" /> {dispatchInfo.hospital}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7f8c8d' }}>
                <Phone size={18} color="#e67e22" /> {dispatchInfo.phone}
              </div>
            </div>
          </div>
        )}

        {/* User's Critical Data Display */}
        {profileData && !dispatchInfo && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ backgroundColor: 'white', padding: '15px 25px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '4px solid #e74c3c' }}>
              <Droplet color="#e74c3c" />
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: 'bold', display: 'block' }}>BLOOD GROUP</span>
                <span style={{ fontSize: '18px', color: '#2c3e50', fontWeight: 'bold' }}>{profileData.bloodGroup || "Not Set"}</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '15px 25px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '4px solid #3498db' }}>
              <Phone color="#3498db" />
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: 'bold', display: 'block' }}>EMERGENCY CONTACT</span>
                <span style={{ fontSize: '18px', color: '#2c3e50', fontWeight: 'bold' }}>{profileData.emergencyContact || "Not Set"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Emergency;