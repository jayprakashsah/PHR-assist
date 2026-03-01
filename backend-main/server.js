const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. MUST BE FIRST: Open CORS to completely allow all origins during development
app.use(cors());

// 2. MUST BE SECOND: Parse incoming JSON data
app.use(express.json()); 

// 3. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch((err) => console.log('❌ MongoDB connection error:', err));

// 4. Route Connections
// Auth Routes for Login/Register
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// --- NEW: Medicine Reminder System ---
const reminderRoutes = require('./routes/reminderRoutes');
app.use('/api/reminders', reminderRoutes);

// Existing Report Routes
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

// --- NEW: The Geospatial Hospital Engine ---
const hospitalRoutes = require('./routes/hospitalRoutes');
app.use('/api/hospitals', hospitalRoutes);

// --- NEW: The Emergency SOS Dispatcher ---
const sosRoutes = require('./routes/sosRoutes');
app.use('/api/sos', sosRoutes);

// Start the server (Fallback set to 5001 to avoid Mac AirPlay conflicts)
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});