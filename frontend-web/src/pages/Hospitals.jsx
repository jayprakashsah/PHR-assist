import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building, MapPin, Phone, AlertTriangle, Navigation, Activity } from 'lucide-react';
import '../App.css';

function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLoc, setUserLoc] = useState(null);

  useEffect(() => {
    // 1. Ask the browser for the user's current GPS location
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLoc({ lat, lng });

        // 2. Send the coordinates to our Node.js Geospatial Engine
        try {
          const response = await axios.get(`http://localhost:5001/api/hospitals/nearby?lat=${lat}&lng=${lng}`);
          setHospitals(response.data.data);
        } catch (err) {
          console.error("Error fetching hospitals:", err);
          setError("Failed to locate hospitals. Is the backend running?");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("GPS Error:", err);
        setError("Please allow location access in your browser to find nearby hospitals.");
        setLoading(false);
      }
    );
  }, []);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ backgroundColor: '#e9f7ef', padding: '15px', borderRadius: '50%' }}>
          <Building color="#27ae60" size={32} />
        </div>
        <div>
          <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '24px' }}>Nearby Medical Centers</h1>
          <p style={{ margin: '5px 0 0 0', color: '#7f8c8d' }}>
            {userLoc ? `Scanning 5km radius around your location...` : `Awaiting GPS signal...`}
          </p>
        </div>
      </div>

      {/* Dynamic Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <Activity size={48} color="#3498db" style={{ animation: 'emergencyPulse 1.5s infinite', margin: '0 auto 20px' }} />
          <h3 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>Locating Facilities...</h3>
          <p style={{ color: '#7f8c8d', margin: 0 }}>Connecting to global mapping satellites.</p>
        </div>
      ) : error ? (
        <div style={{ backgroundColor: '#fadbd8', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', color: '#c0392b' }}>
          <AlertTriangle size={24} />
          <strong>{error}</strong>
        </div>
      ) : hospitals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px' }}>
          <p style={{ color: '#7f8c8d', fontSize: '18px' }}>No hospitals found within a 5km radius of your current location.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {hospitals.map((hospital, index) => (
            <div key={hospital.id || index} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.06)', borderTop: hospital.emergency ? '4px solid #e74c3c' : '4px solid #3498db', display: 'flex', flexDirection: 'column' }}>
              
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '18px', lineHeight: '1.4' }}>{hospital.name}</h3>
                  {hospital.emergency && (
                    <span style={{ backgroundColor: '#fdedec', color: '#c0392b', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={12} /> ER
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#7f8c8d', fontSize: '14px', marginBottom: '25px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <MapPin size={16} color="#3498db" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{hospital.address}</span>
                  </div>
                  {hospital.phone !== "No phone listed" && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={16} color="#27ae60" />
                      <span>{hospital.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Navigation Button */}
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#f8f9fa', color: '#2c3e50', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', border: '1px solid #e0e6ed', transition: 'all 0.2s ease' }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#3498db'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#3498db'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; e.currentTarget.style.color = '#2c3e50'; e.currentTarget.style.borderColor = '#e0e6ed'; }}
              >
                <Navigation size={18} /> Get Live Directions
              </a>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Hospitals;