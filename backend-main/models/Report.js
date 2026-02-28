const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // We will link this to a real user login system later
  patientId: { type: String, required: true, default: 'user_123' }, 
  
  // Stores the date of the hospital visit
  visitDate: { type: Date, default: Date.now },
  
  // Extracted details from the scan
  diseaseName: { type: String },
  doctorName: { type: String },
  hospitalName: { type: String },
  
  // The raw text generated from the AI scan
  extractedText: { type: String }, 
  
  // Links to the files we will generate with Python later
  pdfUrl: { type: String }, 
  voiceReportUrl: { type: String }, 
  
  // A list to store scanned medicines and their specs
  medicines: [{
    name: String,
    specification: String // What the medicine does, side effects, etc.
  }],
  
  // Custom notes that the user can edit or add later
  additionalNotes: { type: String } 
  
}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt' dates

module.exports = mongoose.model('Report', reportSchema);