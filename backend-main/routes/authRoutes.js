const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 1. REGISTER a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already in use!" });

    // Save the new user
    const newUser = new User({ name, email, password });
    await newUser.save();
    
    // Send back the user's secure ID
    res.status(201).json({ message: "User registered successfully!", userId: newUser._id, name: newUser.name });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
});

// 2. LOGIN an existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find the user by email
    const user = await User.findOne({ email });
    
    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }
    
    // Success! Send back their secure ID
    res.status(200).json({ message: "Login successful!", userId: user._id, name: user.name });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

module.exports = router;