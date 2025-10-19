const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  medications: [{ 
    name: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  instructions: String,
  notes: String,
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  issuedAt: { type: Date, default: Date.now }
});

const medicalRecordSchema = new mongoose.Schema({
  filename: String,
  path: String,
  mimetype: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'uploadedByModel' },
  uploadedByModel: { type: String, enum: ['User', 'Doctor'] },
  uploadedAt: { type: Date, default: Date.now }
});

const consultationSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  scheduledTime: { type: Date, required: true },
  status: { type: String, enum: ["scheduled", "in-progress", "completed", "cancelled"], default: "scheduled" },
  type: { type: String, enum: ["video", "chat", "in-person"], default: "video" },
  notes: String,
  prescription: prescriptionSchema,
  medicalRecords: [medicalRecordSchema]
}, { timestamps: true });

const Consultation = mongoose.model("Consultation", consultationSchema);
module.exports = Consultation;
