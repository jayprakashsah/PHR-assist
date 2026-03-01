const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patientId: { type: String, required: true }, // The privacy lock!
  doctorName: { type: String, default: "Unknown Doctor" },
  hospitalName: { type: String, default: "Unknown Clinic" },
  visitDate: { type: String },
  diseaseName: { type: String },
  reasonForCondition: { type: String }, // NEW: Why did this happen?
  extractedText: { type: String },      // The patient-friendly summary
  actionPlan: [{ type: String }],       // NEW: Step-by-step instructions
  medicines: [
    {
      name: { type: String },
      specification: { type: String },
      purpose: { type: String }         // NEW: Why are they taking this?
    }
  ],
  voiceReportUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);