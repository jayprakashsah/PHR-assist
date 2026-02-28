const express = require('express');
const router = express.Router();
const Report = require('../models/Report'); 

// 1. CREATE a new report
router.post('/add', async (req, res) => {
  console.log("\n📥 Attempting to save new report...");
  console.log("Data received from React:", req.body); // This shows us what the AI sent!

  try {
    const newReport = new Report(req.body);
    const savedReport = await newReport.save();
    console.log("✅ Report successfully saved to MongoDB!");
    res.status(201).json({ message: "Report saved successfully!", data: savedReport });
  } catch (error) {
    console.error("\n❌ MONGODB SAVE ERROR:", error.message); // This tells us exactly why it failed
    res.status(500).json({ message: "Error saving report", error: error.message });
  }
});

// 2. GET all reports
router.get('/all', async (req, res) => {
  try {
    const reports = await Report.find().sort({ visitDate: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
});

module.exports = router;