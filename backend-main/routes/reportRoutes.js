const express = require('express');
const router = express.Router();
const Report = require('../models/Report'); 

// 1. CREATE a new report (Securely attached to a user)
router.post('/add', async (req, res) => {
  try {
    // We expect the frontend to send the 'patientId' now!
    const newReport = new Report(req.body);
    const savedReport = await newReport.save();
    res.status(201).json({ message: "Report saved successfully!", data: savedReport });
  } catch (error) {
    res.status(500).json({ message: "Error saving report", error: error.message });
  }
});

// 2. GET reports ONLY for a specific user
// We changed '/all' to '/user/:userId'
router.get('/user/:userId', async (req, res) => {
  try {
    // This is the magic privacy lock! It only finds reports matching the logged-in user.
    const reports = await Report.find({ patientId: req.params.userId }).sort({ visitDate: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
});

module.exports = router;