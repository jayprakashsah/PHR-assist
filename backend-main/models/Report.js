const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  doctorName: { type: String, default: "Unknown Doctor" },
  hospitalName: { type: String, default: "Unknown Clinic" },
  visitDate: { type: String },
  diseaseName: { type: String },
  reasonForCondition: { type: String }, 
  extractedText: { type: String },      
  actionPlan: [{ type: String }],       
  medicines: [
    {
      name: { type: String },
      specification: { type: String },
      purpose: { type: String },
      durationInDays: { type: Number },
      frequency: { type: String }
    }
  ],
  voiceReportUrl: { type: String },
  
  // --- NEW: X-Ray & Visual Scan Data ---
  containsVisualScan: { type: Boolean, default: false },
  scanType: { type: String, default: "None" },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);