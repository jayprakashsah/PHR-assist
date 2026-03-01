import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, Phone, ShieldAlert, Droplet, User, 
  Navigation, Activity, Building, CheckCircle, Heart,
  MapPin, Ambulance, Clock, Shield, Zap, Crosshair,
  Radio, Satellite, AlertOctagon, Bell, Compass,
  Thermometer, Wind, Waves, CircleDot, Gauge
} from 'lucide-react';
import '../App.css';

function Emergency() {
  const [profileData, setProfileData] = useState(null);
  const [alertSent, setAlertSent] = useState(false);
  const [locationStatus, setLocationStatus] = useState("Standby");
  const [dispatchInfo, setDispatchInfo] = useState(null);
  const [countdown, setCountdown] = useState(15);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const userId = localStorage.getItem('userId');

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Countdown timer when alert is sent
  useEffect(() => {
    if (alertSent && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setAlertSent(false);
      setLocationStatus("Standby");
      setDispatchInfo(null);
      setCountdown(15);
      setGpsAccuracy(null);
    }
  }, [alertSent, countdown]);

  // Helper function to safely format arrays
  const formatArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') return field.split(',').map(item => item.trim());
    return [];
  };

  // Helper function to safely display array values
  const displayArrayField = (field) => {
    const arr = formatArrayField(field);
    return arr.length > 0 ? arr.join(', ') : 'None reported';
  };

  const triggerSOS = () => {
    setLocationStatus("Locating...");
    setDispatchInfo(null);
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser or phone.");
      setLocationStatus("GPS Failed");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        setGpsAccuracy(accuracy.toFixed(1));
        
        try {
          // Format medical data safely
          const medicalConditions = formatArrayField(profileData?.medicalConditions);
          const allergies = formatArrayField(profileData?.allergies);

          // Send GPS to smart dispatcher
          const response = await axios.post('http://localhost:5001/api/sos/dispatch', {
            userId: userId || 'anonymous',
            userName: profileData?.name || 'Unknown Patient',
            lat: lat,
            lng: lng,
            bloodGroup: profileData?.bloodGroup || 'Unknown',
            emergencyContact: profileData?.emergencyContact || 'Not set',
            medicalConditions: medicalConditions,
            allergies: allergies
          });

          setLocationStatus(`Locked: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          setAlertSent(true);
          
          setDispatchInfo({
            hospital: response.data.targetHospital || 'City General Hospital',
            phone: response.data.targetPhone || '1-800-EMERGENCY',
            distance: response.data.distance || '2.3',
            eta: response.data.eta || '8',
            ambulanceId: response.data.ambulanceId || 'AMB-7342',
            dispatcherName: response.data.dispatcherName || 'Sarah Chen'
          });

          // Simulate nearby hospitals (in real app, this would come from API)
          setNearbyHospitals([
            { name: 'City General Hospital', distance: '1.2', eta: '4', available: true },
            { name: 'St. Mary\'s Medical', distance: '2.5', eta: '7', available: true },
            { name: 'University Medical Center', distance: '3.8', eta: '10', available: false }
          ]);

        } catch (error) {
          console.error("Failed to ping server:", error);
          alert("Network error: Could not connect to emergency dispatch servers.");
          setLocationStatus("Dispatch Failed");
        }
      },
      (error) => {
        alert("Unable to retrieve your location. Please ensure Location/GPS services are turned on.");
        setLocationStatus("GPS Denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div style={styles.container}>
      {/* Emergency Siren Effect - Animated Background */}
      <div style={styles.sirenOverlay}>
        <div style={styles.sirenLight1}></div>
        <div style={styles.sirenLight2}></div>
      </div>

      {/* Floating Particles - Fewer on mobile */}
      <div style={styles.particles}>
        {[...Array(windowWidth <= 768 ? 8 : 20)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${10 + Math.random() * 15}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              backgroundColor: i % 2 === 0 ? '#e74c3c' : '#3498db',
              width: windowWidth <= 768 ? '2px' : '3px',
              height: windowWidth <= 768 ? '2px' : '3px',
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div style={{
        ...styles.header,
        padding: windowWidth <= 480 ? '10px 0' : '15px 0',
      }}>
        <div style={{
          ...styles.headerContent,
          padding: windowWidth <= 480 ? '0 15px' : windowWidth <= 768 ? '0 20px' : '0 40px',
        }}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <ShieldAlert size={windowWidth <= 480 ? 24 : 32} color="#e74c3c" />
              <div style={{
                ...styles.logoGlow,
                width: windowWidth <= 480 ? '40px' : '60px',
                height: windowWidth <= 480 ? '40px' : '60px',
              }}></div>
            </div>
            <span style={{
              ...styles.logoText,
              fontSize: windowWidth <= 480 ? '18px' : windowWidth <= 768 ? '20px' : '24px',
            }}>
              Emergency<span style={{ color: '#e74c3c' }}>.Response</span>
            </span>
          </div>
          
          <div style={styles.headerRight}>
            {userId ? (
              <Link to="/home" style={{
                ...styles.dashboardLink,
                padding: windowWidth <= 480 ? '8px 12px' : '10px 20px',
                fontSize: windowWidth <= 480 ? '12px' : '14px',
              }} className="btn-outline-3d">
                <Activity size={windowWidth <= 480 ? 14 : 18} />
                {windowWidth > 480 && <span>Dashboard</span>}
              </Link>
            ) : (
              <Link to="/login" style={{
                ...styles.loginLink,
                padding: windowWidth <= 480 ? '8px 12px' : '10px 20px',
                fontSize: windowWidth <= 480 ? '12px' : '14px',
              }} className="btn-3d">
                <User size={windowWidth <= 480 ? 14 : 18} />
                {windowWidth > 480 && <span>Medical Vault</span>}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div style={{
        ...styles.mainContent,
        padding: windowWidth <= 480 ? '15px' : windowWidth <= 768 ? '20px' : '40px',
      }}>
        {/* Emergency Alert Banner */}
        <div style={{
          ...styles.alertBanner,
          padding: windowWidth <= 480 ? '12px' : '20px',
          flexDirection: windowWidth <= 480 ? 'column' : 'row',
          textAlign: windowWidth <= 480 ? 'center' : 'left',
        }}>
          <div style={{
            ...styles.alertIcon,
            width: windowWidth <= 480 ? '40px' : '50px',
            height: windowWidth <= 480 ? '40px' : '50px',
          }}>
            <AlertOctagon size={windowWidth <= 480 ? 20 : 24} color="#e74c3c" />
          </div>
          <div style={styles.alertText}>
            <h2 style={{
              ...styles.alertTitle,
              fontSize: windowWidth <= 480 ? '16px' : windowWidth <= 768 ? '18px' : '20px',
            }}>EMERGENCY RESPONSE SYSTEM</h2>
            <p style={{
              ...styles.alertSubtitle,
              fontSize: windowWidth <= 480 ? '12px' : '14px',
            }}>Pressing SOS will immediately dispatch emergency services to your exact location</p>
          </div>
        </div>

        {/* Main SOS Section */}
        <div style={{
          ...styles.sosSection,
          gap: windowWidth <= 480 ? '20px' : '30px',
        }}>
          {/* Left Side - Information */}
          <div style={styles.infoPanel}>
            {/* Vital Signs Monitor */}
            <div style={{
              ...styles.vitalMonitor,
              padding: windowWidth <= 480 ? '15px' : '25px',
            }}>
              <h3 style={styles.panelTitle}>
                <Heart size={18} color="#e74c3c" />
                Critical Information
              </h3>
              
              {profileData ? (
                <div style={{
                  ...styles.vitalGrid,
                  gap: windowWidth <= 480 ? '10px' : '15px',
                }}>
                  <div style={{
                    ...styles.vitalCard,
                    padding: windowWidth <= 480 ? '12px' : '15px',
                  }}>
                    <Droplet size={windowWidth <= 480 ? 20 : 24} color="#e74c3c" />
                    <div>
                      <span style={styles.vitalLabel}>Blood Type</span>
                      <span style={styles.vitalValue}>{profileData.bloodGroup || "O+"}</span>
                    </div>
                  </div>
                  
                  <div style={{
                    ...styles.vitalCard,
                    padding: windowWidth <= 480 ? '12px' : '15px',
                  }}>
                    <Phone size={windowWidth <= 480 ? 20 : 24} color="#3498db" />
                    <div>
                      <span style={styles.vitalLabel}>Emergency Contact</span>
                      <span style={styles.vitalValue}>
                        {windowWidth <= 480 && profileData.emergencyContact?.length > 12
                          ? `${profileData.emergencyContact.substring(0, 12)}...`
                          : profileData.emergencyContact || "Not Set"}
                      </span>
                    </div>
                  </div>

                  {/* Safely display allergies */}
                  {profileData.allergies && formatArrayField(profileData.allergies).length > 0 && (
                    <div style={{ ...styles.vitalCard, gridColumn: 'span 2', padding: windowWidth <= 480 ? '12px' : '15px' }}>
                      <AlertTriangle size={windowWidth <= 480 ? 20 : 24} color="#f39c12" />
                      <div>
                        <span style={styles.vitalLabel}>Allergies</span>
                        <span style={styles.vitalValue}>
                          {windowWidth <= 480 && displayArrayField(profileData.allergies).length > 20
                            ? `${displayArrayField(profileData.allergies).substring(0, 20)}...`
                            : displayArrayField(profileData.allergies)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Safely display medical conditions */}
                  {profileData.medicalConditions && formatArrayField(profileData.medicalConditions).length > 0 && (
                    <div style={{ ...styles.vitalCard, gridColumn: 'span 2', padding: windowWidth <= 480 ? '12px' : '15px' }}>
                      <Activity size={windowWidth <= 480 ? 20 : 24} color="#9b59b6" />
                      <div>
                        <span style={styles.vitalLabel}>Medical Conditions</span>
                        <span style={styles.vitalValue}>
                          {windowWidth <= 480 && displayArrayField(profileData.medicalConditions).length > 20
                            ? `${displayArrayField(profileData.medicalConditions).substring(0, 20)}...`
                            : displayArrayField(profileData.medicalConditions)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.noProfile}>
                  <User size={32} color="#7f8c8d" />
                  <p>No medical profile loaded</p>
                  <Link to="/login" style={styles.loginPrompt}>Login to add medical info</Link>
                </div>
              )}
            </div>

            {/* GPS Status */}
            <div style={{
              ...styles.gpsPanel,
              padding: windowWidth <= 480 ? '15px' : '20px',
            }}>
              <div style={styles.gpsHeader}>
                <Satellite size={18} color={alertSent ? "#2ecc71" : "#3498db"} />
                <span style={styles.gpsTitle}>GPS Signal</span>
              </div>
              <div style={{
                ...styles.gpsStatus,
                flexDirection: windowWidth <= 480 ? 'column' : 'row',
                alignItems: windowWidth <= 480 ? 'flex-start' : 'center',
                gap: windowWidth <= 480 ? '10px' : '0',
              }}>
                <div style={styles.gpsIndicator}>
                  <Radio size={24} color={alertSent ? "#2ecc71" : "#e74c3c"} />
                  <span style={{
                    ...styles.gpsText,
                    fontSize: windowWidth <= 480 ? '14px' : '16px',
                  }}>{locationStatus}</span>
                </div>
                {gpsAccuracy && (
                  <div style={styles.gpsAccuracy}>
                    <Crosshair size={14} color="#7f8c8d" />
                    <span>Accuracy: ±{gpsAccuracy}m</span>
                  </div>
                )}
              </div>
            </div>

            {/* Nearby Hospitals Preview */}
            {nearbyHospitals.length > 0 && !alertSent && (
              <div style={{
                ...styles.hospitalsPreview,
                padding: windowWidth <= 480 ? '15px' : '20px',
              }}>
                <h3 style={styles.panelTitle}>
                  <Building size={18} color="#3498db" />
                  Nearby Hospitals
                </h3>
                {nearbyHospitals.map((hospital, index) => (
                  <div key={index} style={styles.hospitalItem}>
                    <Building size={16} color={hospital.available ? "#2ecc71" : "#7f8c8d"} />
                    <div style={styles.hospitalInfo}>
                      <span style={styles.hospitalName}>
                        {windowWidth <= 480 && hospital.name.length > 20
                          ? `${hospital.name.substring(0, 20)}...`
                          : hospital.name}
                      </span>
                      <span style={styles.hospitalDistance}>{hospital.distance} km · {hospital.eta} min</span>
                    </div>
                    {hospital.available ? (
                      <CheckCircle size={16} color="#2ecc71" />
                    ) : (
                      <AlertTriangle size={16} color="#f39c12" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - SOS Button & Dispatch Info */}
          <div style={styles.sosPanel}>
            {/* Giant SOS Button */}
            <div style={styles.sosButtonContainer}>
              <button 
                onClick={triggerSOS}
                disabled={alertSent}
                style={{
                  ...styles.sosButton,
                  backgroundColor: alertSent ? '#2ecc71' : '#e74c3c',
                  animation: alertSent ? 'none' : 'emergencyPulse 2s infinite',
                  width: windowWidth <= 480 ? '180px' : windowWidth <= 768 ? '220px' : '300px',
                  height: windowWidth <= 480 ? '180px' : windowWidth <= 768 ? '220px' : '300px',
                }}
                className={alertSent ? '' : 'sos-button'}
              >
                <div style={styles.sosButtonInner}>
                  <AlertTriangle size={alertSent 
                    ? (windowWidth <= 480 ? 28 : windowWidth <= 768 ? 36 : 48)
                    : (windowWidth <= 480 ? 40 : windowWidth <= 768 ? 56 : 72)} 
                  />
                  <span style={{
                    ...styles.sosText,
                    fontSize: windowWidth <= 480 ? '24px' : windowWidth <= 768 ? '36px' : '48px',
                  }}>{alertSent ? "DISPATCHED" : "SOS"}</span>
                  {alertSent && (
                    <div style={{
                      ...styles.sosCountdown,
                      bottom: windowWidth <= 480 ? '15px' : '30px',
                    }}>
                      <Clock size={16} />
                      <span>{countdown}s</span>
                    </div>
                  )}
                </div>
              </button>
            </div>

            {/* Emergency Dispatch Info */}
            {dispatchInfo && (
              <div style={{
                ...styles.dispatchCard,
                padding: windowWidth <= 480 ? '15px' : '25px',
              }} className="slide-in">
                <div style={styles.dispatchHeader}>
                  <Ambulance size={24} color="#2ecc71" />
                  <h3 style={{
                    ...styles.dispatchTitle,
                    fontSize: windowWidth <= 480 ? '16px' : '18px',
                  }}>EMERGENCY DISPATCHED</h3>
                </div>

                <div style={{
                  ...styles.dispatchGrid,
                  gap: windowWidth <= 480 ? '10px' : '15px',
                }}>
                  <div style={styles.dispatchItem}>
                    <Building size={18} color="#3498db" />
                    <div>
                      <span style={styles.dispatchLabel}>Destination</span>
                      <span style={styles.dispatchValue}>
                        {windowWidth <= 480 && dispatchInfo.hospital.length > 15
                          ? `${dispatchInfo.hospital.substring(0, 15)}...`
                          : dispatchInfo.hospital}
                      </span>
                    </div>
                  </div>

                  <div style={styles.dispatchItem}>
                    <Phone size={18} color="#e74c3c" />
                    <div>
                      <span style={styles.dispatchLabel}>Contact</span>
                      <span style={styles.dispatchValue}>{dispatchInfo.phone}</span>
                    </div>
                  </div>

                  <div style={styles.dispatchItem}>
                    <MapPin size={18} color="#2ecc71" />
                    <div>
                      <span style={styles.dispatchLabel}>Distance</span>
                      <span style={styles.dispatchValue}>{dispatchInfo.distance} km</span>
                    </div>
                  </div>

                  <div style={styles.dispatchItem}>
                    <Clock size={18} color="#f39c12" />
                    <div>
                      <span style={styles.dispatchLabel}>ETA</span>
                      <span style={styles.dispatchValue}>{dispatchInfo.eta} min</span>
                    </div>
                  </div>

                  <div style={styles.dispatchItem}>
                    <Zap size={18} color="#9b59b6" />
                    <div>
                      <span style={styles.dispatchLabel}>Ambulance</span>
                      <span style={styles.dispatchValue}>{dispatchInfo.ambulanceId}</span>
                    </div>
                  </div>

                  <div style={styles.dispatchItem}>
                    <User size={18} color="#3498db" />
                    <div>
                      <span style={styles.dispatchLabel}>Dispatcher</span>
                      <span style={styles.dispatchValue}>{dispatchInfo.dispatcherName}</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  ...styles.dispatchFooter,
                  padding: windowWidth <= 480 ? '10px' : '12px',
                  fontSize: windowWidth <= 480 ? '10px' : '12px',
                }}>
                  <CheckCircle size={16} color="#2ecc71" />
                  <span>Your location has been shared with emergency services</span>
                </div>
              </div>
            )}

            {/* Safety Instructions */}
            {!alertSent && !dispatchInfo && (
              <div style={{
                ...styles.safetyCard,
                padding: windowWidth <= 480 ? '15px' : '20px',
              }}>
                <h3 style={{
                  ...styles.safetyTitle,
                  fontSize: windowWidth <= 480 ? '14px' : '16px',
                }}>Emergency Instructions</h3>
                <ul style={styles.safetyList}>
                  <li style={styles.safetyItem}>
                    <CircleDot size={16} color="#e74c3c" />
                    <span>Stay calm and stay in your current location</span>
                  </li>
                  <li style={styles.safetyItem}>
                    <CircleDot size={16} color="#e74c3c" />
                    <span>Keep your phone charged and nearby</span>
                  </li>
                  <li style={styles.safetyItem}>
                    <CircleDot size={16} color="#e74c3c" />
                    <span>Unlock your door for emergency services</span>
                  </li>
                  <li style={styles.safetyItem}>
                    <CircleDot size={16} color="#e74c3c" />
                    <span>Have your ID and medical info ready</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={{
          ...styles.footerText,
          padding: windowWidth <= 480 ? '0 15px' : windowWidth <= 768 ? '0 20px' : '0 40px',
          fontSize: windowWidth <= 480 ? '10px' : '12px',
        }}>
          <Shield size={14} color="#7f8c8d" />
          This emergency system is monitored 24/7. Pressing SOS will immediately alert emergency services.
        </p>
      </div>

      {/* Add keyframe animations */}
      <style jsx>{`
        @keyframes sweep {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        @keyframes float-particle {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
        }
        
        @keyframes emergencyPulse {
          0% { transform: scale(1); box-shadow: 0 20px 40px rgba(231,76,60,0.3); }
          50% { transform: scale(1.05); box-shadow: 0 30px 60px rgba(231,76,60,0.5); }
          100% { transform: scale(1); box-shadow: 0 20px 40px rgba(231,76,60,0.3); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .sos-button:hover {
          transform: scale(1.1);
        }
        
        .slide-in {
          animation: slideIn 0.5s ease-out;
        }
        
        .btn-outline-3d:hover {
          transform: translateY(-2px);
          background: rgba(52,152,219,0.2);
        }
        
        .btn-3d:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(52,152,219,0.3);
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 100%)',
    color: '#ffffff',
    position: 'relative',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  sirenOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  sirenLight1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100vh',
    background: 'linear-gradient(90deg, rgba(231,76,60,0.1) 0%, transparent 20%, transparent 80%, rgba(231,76,60,0.1) 100%)',
    animation: 'sweep 3s ease-in-out infinite',
  },
  sirenLight2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100vh',
    background: 'linear-gradient(90deg, rgba(52,152,219,0.1) 0%, transparent 30%, transparent 70%, rgba(52,152,219,0.1) 100%)',
    animation: 'sweep 4s ease-in-out infinite reverse',
  },
  particles: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    boxShadow: '0 0 10px currentColor',
    opacity: 0.3,
  },
  header: {
    background: 'rgba(10, 15, 28, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(231, 76, 60, 0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    width: '100%',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    background: 'radial-gradient(circle, rgba(231,76,60,0.2) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
  },
  logoText: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  dashboardLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(52,152,219,0.1)',
    border: '1px solid rgba(52,152,219,0.3)',
    borderRadius: '12px',
    color: '#3498db',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  loginLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    borderRadius: '12px',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  mainContent: {
    flex: 1,
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto',
    position: 'relative',
    zIndex: 10,
    boxSizing: 'border-box',
  },
  alertBanner: {
    background: 'rgba(231, 76, 60, 0.1)',
    border: '1px solid rgba(231, 76, 60, 0.3)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '40px',
    backdropFilter: 'blur(10px)',
  },
  alertIcon: {
    borderRadius: '12px',
    background: 'rgba(231,76,60,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: '5px',
  },
  alertSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    margin: 0,
  },
  sosSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  infoPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  vitalMonitor: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  panelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '20px',
  },
  vitalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  vitalCard: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  vitalLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
    display: 'block',
    marginBottom: '4px',
  },
  vitalValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
  },
  noProfile: {
    textAlign: 'center',
    padding: '30px',
    color: 'rgba(255,255,255,0.5)',
  },
  loginPrompt: {
    display: 'inline-block',
    marginTop: '10px',
    padding: '8px 16px',
    background: 'rgba(52,152,219,0.1)',
    borderRadius: '20px',
    color: '#3498db',
    textDecoration: 'none',
    fontSize: '12px',
  },
  gpsPanel: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  gpsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '15px',
  },
  gpsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
  },
  gpsStatus: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gpsIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  gpsText: {
    fontWeight: '500',
    color: '#ffffff',
  },
  gpsAccuracy: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
  },
  hospitalsPreview: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  hospitalItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  hospitalInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  hospitalName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
  },
  hospitalDistance: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
  },
  sosPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sosButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  sosButton: {
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 20px 40px rgba(231,76,60,0.3)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  sosButtonInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    color: '#ffffff',
    position: 'relative',
    zIndex: 2,
  },
  sosText: {
    fontWeight: '900',
    letterSpacing: '4px',
  },
  sosCountdown: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
    color: '#ffffff',
    opacity: 0.8,
  },
  dispatchCard: {
    background: 'rgba(46, 204, 113, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    border: '2px solid rgba(46, 204, 113, 0.3)',
  },
  dispatchHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  dispatchTitle: {
    fontWeight: 'bold',
    color: '#2ecc71',
    margin: 0,
  },
  dispatchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    marginBottom: '20px',
  },
  dispatchItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
  },
  dispatchLabel: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.5)',
    display: 'block',
    marginBottom: '2px',
  },
  dispatchValue: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#ffffff',
  },
  dispatchFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(46,204,113,0.1)',
    borderRadius: '12px',
    color: '#2ecc71',
  },
  safetyCard: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  safetyTitle: {
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '15px',
  },
  safetyList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  safetyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
  },
  footer: {
    background: 'rgba(10, 15, 28, 0.8)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(231,76,60,0.2)',
    padding: '15px 0',
    marginTop: '40px',
    width: '100%',
  },
  footerText: {
    maxWidth: '1400px',
    margin: '0 auto',
    color: 'rgba(255,255,255,0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
};

export default Emergency;