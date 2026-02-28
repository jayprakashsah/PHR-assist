import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, Lock, Mail, User } from 'lucide-react';

function Login() {
  const [isRegistering, setIsRegistering] = useState(false); // Toggles between Login and Register
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Decide which API route to call based on the toggle
    const endpoint = isRegistering ? '/register' : '/login';
    const payload = isRegistering ? { name, email, password } : { email, password };

    try {
      // Send data to our Node.js auth routes
      const response = await axios.post(`http://localhost:5001/api/auth${endpoint}`, payload);
      
      // MAGIC STEP: Save their secure User ID into the browser's memory!
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('userName', response.data.name);
      
      alert(`Success: ${response.data.message}`);
      navigate('/dashboard'); 
      
    } catch (error) {
      // If they type the wrong password or an email that already exists, show the error
      alert(error.response?.data?.message || "Server error. Is Node.js running?");
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        
        <Activity color="#e74c3c" size={48} style={{ margin: '0 auto 10px' }} />
        <h2 style={{ color: '#2c3e50', marginBottom: '5px' }}>Smart PHR</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
          {isRegistering ? "Create your secure health profile" : "Sign in to your health profile"}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Only show the Name field if they are registering */}
          {isRegistering && (
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}>
              <User size={18} color="#95a5a6" style={{ marginRight: '10px' }} />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '16px' }}
                required={isRegistering}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}>
            <Mail size={18} color="#95a5a6" style={{ marginRight: '10px' }} />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '16px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}>
            <Lock size={18} color="#95a5a6" style={{ marginRight: '10px' }} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '16px' }}
              required
            />
          </div>

          <button 
            type="submit" 
            style={{ padding: '12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}
          >
            {isRegistering ? "Create Account" : "Secure Login"}
          </button>
        </form>

        <p style={{ marginTop: '20px', color: '#7f8c8d', fontSize: '14px' }}>
          {isRegistering ? "Already have an account? " : "Don't have an account? "}
          <span 
            style={{ color: '#3498db', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? "Sign In" : "Register Here"}
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;