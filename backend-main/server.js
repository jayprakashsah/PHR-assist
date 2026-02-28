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
// --- NEW: Auth Routes for Login/Register ---
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Existing Report Routes
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});