import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Phone, Droplet, AlertTriangle, MapPin, Save, Edit2 } from 'lucide-react';
import '../App.css'; 

function Profile() {
  const [profileData, setProfileData] = useState({
    name: '', email: '', phone: '', bloodGroup: '', emergencyContact: '', allergies: '', address: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  // Load the user's data when the page opens
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/auth/profile/${userId}`);
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  // Handle typing in the text boxes
  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  // Save the updated data to MongoDB
  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5001/api/auth/profile/${userId}`, profileData);
      alert("Profile updated successfully!");
      setIsEditing(false); // Lock the form again
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save changes.");
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px', color: '#7f8c8d' }}>Loading profile...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: '#3498db', padding: '15px', borderRadius: '50%' }}>
            <User color="white" size={32} />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '24px' }}>{profileData.name}</h1>
            <p style={{ margin: 0, color: '#7f8c8d' }}>{profileData.email}</p>
          </div>
        </div>
        
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          style={{ padding: '10px 20px', backgroundColor: isEditing ? '#2ecc71' : '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '15px', transition: '0.2s' }}
        >
          {isEditing ? <><Save size={18} /> Save Changes</> : <><Edit2 size={18} /> Edit Profile</>}
        </button>
      </div>

      {/* Profile Form */}
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Phone Number */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#7f8c8d', fontWeight: 'bold', fontSize: '14px' }}>
            <Phone size={16} color="#3498db" /> Personal Phone
          </label>
          <input 
            type="text" name="phone" value={profileData.phone} onChange={handleChange} disabled={!isEditing}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bdc3c7', backgroundColor: isEditing ? 'white' : '#f8f9fa', outline: 'none', color: '#2c3e50' }}
            placeholder="+1 234 567 8900"
          />
        </div>

        {/* Blood Group */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#7f8c8d', fontWeight: 'bold', fontSize: '14px' }}>
            <Droplet size={16} color="#e74c3c" /> Blood Group
          </label>
          <input 
            type="text" name="bloodGroup" value={profileData.bloodGroup} onChange={handleChange} disabled={!isEditing}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bdc3c7', backgroundColor: isEditing ? 'white' : '#f8f9fa', outline: 'none', color: '#2c3e50' }}
            placeholder="e.g., O+, A-"
          />
        </div>

        {/* Emergency Contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#7f8c8d', fontWeight: 'bold', fontSize: '14px' }}>
            <AlertTriangle size={16} color="#f39c12" /> Emergency Contact
          </label>
          <input 
            type="text" name="emergencyContact" value={profileData.emergencyContact} onChange={handleChange} disabled={!isEditing}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bdc3c7', backgroundColor: isEditing ? 'white' : '#f8f9fa', outline: 'none', color: '#2c3e50' }}
            placeholder="Name & Number"
          />
        </div>

        {/* Allergies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#7f8c8d', fontWeight: 'bold', fontSize: '14px' }}>
            <AlertTriangle size={16} color="#9b59b6" /> Known Allergies
          </label>
          <input 
            type="text" name="allergies" value={profileData.allergies} onChange={handleChange} disabled={!isEditing}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bdc3c7', backgroundColor: isEditing ? 'white' : '#f8f9fa', outline: 'none', color: '#2c3e50' }}
            placeholder="e.g., Peanuts, Penicillin"
          />
        </div>

        {/* Address (Spans both columns) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#7f8c8d', fontWeight: 'bold', fontSize: '14px' }}>
            <MapPin size={16} color="#27ae60" /> Home Address
          </label>
          <input 
            type="text" name="address" value={profileData.address} onChange={handleChange} disabled={!isEditing}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bdc3c7', backgroundColor: isEditing ? 'white' : '#f8f9fa', outline: 'none', color: '#2c3e50' }}
            placeholder="Full Residential Address"
          />
        </div>

      </div>
    </div>
  );
}

export default Profile;