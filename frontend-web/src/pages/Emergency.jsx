import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, MapPin, Phone, CheckCircle, X, AlertCircle } from 'lucide-react';

function Emergency() {
  // phase: 'idle' | 'locating' | 'alert' | 'sent'
  const [phase, setPhase] = useState('idle');
  const [location, setLocation] = useState(null);
  const [hospital, setHospital] = useState('Nearest Hospital');
  const [emergencyContact, setEmergencyContact] = useState('108');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  // Fetch profile to get real emergency contact
  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:5001/api/auth/profile/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.emergencyContact) setEmergencyContact(data.emergencyContact);
      })
      .catch(() => { });
  }, [userId]);

  // Spinner animation
  const spinnerStyle = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    animation: 'spin 0.9s linear infinite',
    margin: '0 auto',
  };

  const handleActivateSOS = () => {
    setPhase('locating');

    if (!navigator.geolocation) {
      // Still proceed even without GPS
      setLocation({ lat: null, lng: null });
      setPhase('alert');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });

        // Try Overpass to get real hospital name
        try {
          const url = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:5];node[amenity=hospital](around:5000,${lat},${lng});out 1;`;
          const resp = await fetch(url);
          const data = await resp.json();
          if (data.elements?.length > 0) {
            setHospital(data.elements[0].tags?.name || 'Nearest Hospital');
          }
        } catch (_) { }

        setPhase('alert');
      },
      () => {
        setLocation(null);
        setPhase('alert');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleDispatch = () => {
    setPhase('sent');
  };

  const handleClose = () => {
    if (userId) {
      navigate('/home');
    } else {
      navigate('/');
    }
  };

  // ─── IDLE ───────────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div style={s.idleContainer}>
        <style>{css}</style>
        {/* top-right close */}
        <button onClick={handleClose} style={s.closeBtn}><X size={22} /></button>

        <div style={s.idleInner}>
          <div style={s.iconCircle}>
            <ShieldAlert size={52} color="#e53935" />
          </div>
          <h1 style={s.idleTitle}>Emergency SOS</h1>
          <p style={s.idleSubtitle}>
            Tap the button below to activate emergency services.<br />
            Your GPS location will be shared immediately.
          </p>
          <button onClick={handleActivateSOS} style={s.bigSosBtn} className="sos-pulse">
            SOS
          </button>
          <p style={s.idleHint}>Press and release to send emergency alert</p>
        </div>
      </div>
    );
  }

  // ─── LOCATING ───────────────────────────────────────────────────────────────
  if (phase === 'locating') {
    return (
      <div style={s.redFull}>
        <style>{css}</style>
        <button onClick={handleClose} style={s.closeBtnWhite}><X size={22} /></button>

        <div style={s.centerBox}>
          <div style={s.whiteCircle}>
            <AlertCircle size={56} color="#e53935" />
          </div>
          <h2 style={s.phaseTitle}>LOCATING YOU...</h2>
          <p style={s.phaseSubtitle}>Acquiring GPS coordinates for emergency dispatch.</p>
          <div style={spinnerStyle} />
        </div>
      </div>
    );
  }

  // ─── ALERT (show info + DISPATCH button) ────────────────────────────────────
  if (phase === 'alert') {
    return (
      <div style={s.redFull}>
        <style>{css}</style>
        <button onClick={handleClose} style={s.closeBtnWhite}><X size={22} /></button>

        <div style={s.centerBox}>
          <div style={s.whiteCircle}>
            <AlertCircle size={56} color="#e53935" />
          </div>

          <h2 style={s.phaseTitle}>EMERGENCY ALERT</h2>
          <p style={{ ...s.phaseSubtitle, marginBottom: 28 }}>
            Nearest help: <strong style={{ color: '#fff' }}>{hospital}</strong>
          </p>

          {/* Info card */}
          <div style={s.infoCard}>
            <div style={s.infoRow}>
              <div style={s.iconBox}><MapPin size={22} color="#fff" /></div>
              <div style={s.infoText}>
                <span style={s.infoLabel}>YOUR LOCATION</span>
                <span style={s.infoValue}>
                  {location?.lat
                    ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                    : 'Location unavailable'}
                </span>
              </div>
            </div>
            <div style={s.infoRow}>
              <div style={s.iconBox}><Phone size={22} color="#fff" /></div>
              <div style={s.infoText}>
                <span style={s.infoLabel}>EMERGENCY CONTACT</span>
                <span style={s.infoValue}>{emergencyContact}</span>
              </div>
            </div>
          </div>

          <button onClick={handleDispatch} style={s.dispatchBtn}>
            DISPATCH SOS NOW
          </button>
        </div>
      </div>
    );
  }

  // ─── SENT ───────────────────────────────────────────────────────────────────
  if (phase === 'sent') {
    return (
      <div style={s.redFull}>
        <style>{css}</style>
        <button onClick={handleClose} style={s.closeBtnWhite}><X size={22} /></button>

        <div style={s.centerBox}>
          <div style={{ ...s.whiteCircle, borderColor: '#fff' }}>
            <CheckCircle size={56} color="#2ecc71" />
          </div>

          <h2 style={s.phaseTitle}>ALERT SENT</h2>
          <p style={{ ...s.phaseSubtitle, maxWidth: 340, textAlign: 'center', marginBottom: 28 }}>
            Emergency services and your contacts have been<br />
            notified with your medical profile and location.
          </p>

          {/* Next steps */}
          <div style={s.stepsCard}>
            <p style={s.stepsTitle}>NEXT STEPS</p>
            {['Stay where you are if safe', 'Keep your phone unlocked', 'Help is on the way'].map((step, i) => (
              <div key={i} style={s.stepRow}>
                <div style={s.stepNum}>{i + 1}</div>
                <span style={s.stepText}>{step}</span>
              </div>
            ))}
          </div>

          <button onClick={handleClose} style={s.closeFullBtn}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ─── STYLES ─────────────────────────────────────────────────────────────────

const s = {
  // Idle page
  idleContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  idleInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    padding: '0 20px',
    maxWidth: 480,
    width: '100%',
    textAlign: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    background: 'rgba(229,57,53,0.12)',
    border: '2px solid rgba(229,57,53,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  idleTitle: {
    fontSize: 32,
    fontWeight: 900,
    color: '#fff',
    margin: 0,
    letterSpacing: -0.5,
  },
  idleSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    margin: 0,
    lineHeight: 1.6,
  },
  bigSosBtn: {
    width: 180,
    height: 180,
    borderRadius: '50%',
    background: '#e53935',
    border: '6px solid rgba(255,255,255,0.3)',
    color: '#fff',
    fontSize: 42,
    fontWeight: 900,
    cursor: 'pointer',
    letterSpacing: 4,
    boxShadow: '0 0 60px rgba(229,57,53,0.6)',
    transition: 'transform 0.2s',
    marginTop: 12,
  },
  idleHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    margin: 0,
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '50%',
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
  },

  // Red full-screen (locating / alert / sent)
  redFull: {
    minHeight: '100vh',
    width: '100%',
    background: '#e53935',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  closeBtnWhite: {
    position: 'absolute',
    top: 20,
    right: 20,
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '50%',
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
  },
  centerBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 18,
    padding: '0 24px',
    maxWidth: 460,
    width: '100%',
  },
  whiteCircle: {
    width: 110,
    height: 110,
    borderRadius: '50%',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 40px rgba(0,0,0,0.15)',
    marginBottom: 4,
  },
  phaseTitle: {
    fontSize: 34,
    fontWeight: 900,
    color: '#fff',
    margin: 0,
    letterSpacing: 1,
    textAlign: 'center',
  },
  phaseSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    margin: 0,
    textAlign: 'center',
    lineHeight: 1.5,
  },

  // Info card (Alert phase)
  infoCard: {
    background: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    backdropFilter: 'blur(10px)',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '18px 20px',
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#fff',
  },

  dispatchBtn: {
    width: '100%',
    padding: '18px',
    background: '#fff',
    border: 'none',
    borderRadius: 16,
    fontSize: 17,
    fontWeight: 900,
    color: '#e53935',
    cursor: 'pointer',
    letterSpacing: 1,
    marginTop: 4,
  },

  // Steps card (Sent phase)
  stepsCard: {
    width: '100%',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: '20px 24px',
    backdropFilter: 'blur(10px)',
  },
  stepsTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    textAlign: 'center',
    margin: '0 0 16px',
  },
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  stepNum: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  stepText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 500,
  },

  closeFullBtn: {
    width: '100%',
    padding: '16px',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: 16,
    fontSize: 16,
    fontWeight: 700,
    color: '#fff',
    cursor: 'pointer',
    marginTop: 4,
  },
};

const css = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes sosPulse {
    0%   { box-shadow: 0 0 60px rgba(229,57,53,0.6); transform: scale(1); }
    50%  { box-shadow: 0 0 100px rgba(229,57,53,0.9); transform: scale(1.05); }
    100% { box-shadow: 0 0 60px rgba(229,57,53,0.6); transform: scale(1); }
  }
  .sos-pulse { animation: sosPulse 2s ease-in-out infinite; }
  .sos-pulse:hover { transform: scale(1.08) !important; }
  .sos-pulse:active { transform: scale(0.96) !important; }
`;

export default Emergency;