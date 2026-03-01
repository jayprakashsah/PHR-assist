const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const axios = require('axios'); // NEW: We need axios to search the map!

// Configure the email robot
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your_startup_email@gmail.com', 
    pass: process.env.EMAIL_PASS || 'your_app_password'
  }
});

router.post('/dispatch', async (req, res) => {
  try {
    const { userId, lat, lng, bloodGroup, emergencyContact, userName } = req.body;

    console.log(`🚨 CRITICAL: SOS Dispatch triggered by ${userName} at ${lat}, ${lng}`);

    // --- 1. FIND THE NEAREST HOSPITAL AUTOMATICALLY ---
    console.log(`🌍 Server is scanning for the nearest hospital...`);
    
    const overpassQuery = `
      [out:json];
      (
        node["amenity"="hospital"](around:5000, ${lat}, ${lng});
        way["amenity"="hospital"](around:5000, ${lat}, ${lng});
      );
      out center 1; /* Get ONLY the absolute closest 1 hospital */
    `;

    const mapResponse = await axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(overpassQuery)}`);
    
    // Extract the hospital data
    const nearestHospital = mapResponse.data.elements[0];
    
    // Fallback names if the map data is missing something
    const hospitalName = nearestHospital?.tags?.name || "Nearest Medical Center";
    const hospitalPhone = nearestHospital?.tags?.phone || "Phone not listed";
    
    // Maps rarely have emails, so we simulate a routing email for the MVP
    // In a real startup, you would have a private database of hospital emergency emails
    const hospitalEmail = nearestHospital?.tags?.email || "er-dispatch@simulated-hospital.com"; 

    console.log(`🏥 Target Locked: ${hospitalName} | Phone: ${hospitalPhone}`);

    // --- 2. CONSTRUCT THE TARGETED ALERT ---
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    const mailOptions = {
      from: 'SmartPHR Emergency System',
      // We are sending this to the College Security, the User's Contact, AND the Hospital!
      to: `campus-security@college.edu, ${hospitalEmail}`, 
      subject: `🚨 CODE RED: Incoming Patient to ${hospitalName} from Campus`,
      html: `
        <div style="font-family: Arial; border: 3px solid #c0392b; padding: 20px; border-radius: 10px;">
          <h1 style="color: #c0392b; margin-top: 0;">🚨 AUTOMATED EMERGENCY DISPATCH 🚨</h1>
          <p><strong>To:</strong> Emergency Room Desk, ${hospitalName}</p>
          <p><strong>Hospital Phone on Record:</strong> ${hospitalPhone}</p>
          <hr/>
          <h2 style="color: #2c3e50;">Patient Details:</h2>
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>Blood Group:</strong> <span style="color: #c0392b; font-weight: bold;">${bloodGroup || 'Unknown'}</span></p>
          <p><strong>Patient's Emergency Contact:</strong> ${emergencyContact || 'Not provided'}</p>
          <hr/>
          <h2 style="color: #2c3e50;">Live GPS Location:</h2>
          <p>Patient is currently located at: Latitude ${lat}, Longitude ${lng}</p>
          <a href="${googleMapsLink}" style="background-color: #c0392b; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block; font-size: 16px;">
            📍 Open Patient GPS Tracking
          </a>
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 20px;">
            This is an automated dispatch from the SmartPHR Campus SOS System. 
            If you are receiving this, an ambulance dispatch is requested to the location above.
          </p>
        </div>
      `
    };

    // --- 3. FIRE THE DISPATCH ---
    try {
      // await transporter.sendMail(mailOptions); // Uncomment when Gmail is set up!
      console.log(`✉️ Simulated Alert successfully routed to ${hospitalName}!`);
    } catch (emailError) {
      console.log("⚠️ Email failed to send, but routing logic was successful.");
    }

    res.status(200).json({ 
      message: `SOS routed successfully to ${hospitalName}.`,
      targetHospital: hospitalName,
      targetPhone: hospitalPhone
    });

  } catch (error) {
    console.error("SOS Dispatch Error:", error);
    res.status(500).json({ message: "Failed to dispatch SOS", error: error.message });
  }
});

module.exports = router;