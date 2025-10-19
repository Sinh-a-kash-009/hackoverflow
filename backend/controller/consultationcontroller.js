const Consultation = require('../models/consultationModel');
const { generateToken04, ZegoErrorCodes } = require('../temp_zego/token/nodejs/server/zegoServerAssistant')
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Define how long the token will be valid (e.g., 1 hour = 3600 seconds)
const EFFECTIVE_TIME_IN_SECONDS = 3600;

// Configure storage for files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage }).single('file');

// Create a new consultation session
exports.createConsultation = async (req, res) => {
  try {
    const { doctorId, patientId, scheduledTime, type } = req.body;
    
    // Generate a unique room ID for video consultation
    const roomId = uuidv4();
    
    const consultation = new Consultation({
      doctor: doctorId,
      patient: patientId,
      scheduledTime: new Date(scheduledTime),
      type,
      roomId,
      status: 'scheduled'
    });
    
    await consultation.save();
    
    res.status(201).json({
      success: true,
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create consultation',
      error: error.message
    });
  }
};

// Get consultation by ID
exports.getConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('doctor', 'name email specialization')
      .populate('patient', 'name email');
    
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get consultation',
      error: error.message
    });
  }
};

// Get all consultations for a user (doctor or patient)
exports.getUserConsultations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let query = {};
    if (userRole === 'doctor') {
      query.doctor = userId;
    } else {
      query.patient = userId;
    }
    
    const consultations = await Consultation.find(query)
      .populate('doctor', 'name email specialization')
      .populate('patient', 'name email')
      .sort({ scheduledTime: -1 });
    
    res.status(200).json({
      success: true,
      count: consultations.length,
      data: consultations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get consultations',
      error: error.message
    });
  }
};

// Update consultation status
exports.updateConsultationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update consultation status',
      error: error.message
    });
  }
};

// Generate token for video consultationexports.generateVideoToken = async (req, res) => {
    try {
        const { consultationId } = req.params;
        
        // 1. Get the authenticated user's ID (Doctor or Patient)
        // This ID will be used for token generation
        const userId = req.user.id; // Assuming your middleware provides req.user.id

        const consultation = await Consultation.findById(consultationId);
        
        if (!consultation) {
            return res.status(404).json({
                success: false,
                message: 'Consultation not found'
            });
        }
        
        const roomId = consultation.roomId;

        // 2. CONVERT AppID to the required numeric type (uint32)
        const appId = Number(process.env.ZEGO_APP_ID); 
        const serverSecret = process.env.ZEGO_SERVER_SECRET;

        // --- ZEGOCLOUD Token Generation Logic ---
        
        // Payload is usually left empty (or null) for simple identity tokens
        const payload = ''; 

        const tokenResult = generateToken04(
            appId,
            userId.toString(), // ZEGOCLOUD requires UserID as a string
            serverSecret,
            EFFECTIVE_TIME_IN_SECONDS,
            payload
        );

        if (tokenResult.code !== ZegoErrorCodes.success) {
            console.error('ZEGOCLOUD Token generation failed:', tokenResult.code);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate video token due to server error.'
            });
        }
        
        // The generated token string
        const videoToken = tokenResult.token; 
        
        // --- End ZEGOCLOUD Token Generation Logic ---

        // 3. Return the token and Room ID to the client
        res.status(200).json({
            success: true,
            data: {
                roomId: roomId,
                token: videoToken, // Send the secure token
                appID: appId       // App ID is public and needed by the client SDK
                // DO NOT send process.env.ZEGO_SERVER_SECRET here!
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate video token',
            error: error.message
        });
    }

// Upload medical records
exports.uploadMedicalRecord = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload file',
        error: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype
      }
    });
  });
};

// Add prescription to consultation
exports.addPrescription = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { medications, instructions, notes } = req.body;
    
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found'
      });
    }
    
    // Ensure only doctors can add prescriptions
    if (req.user.role !== 'doctor' || consultation.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add prescription'
      });
    }
    
    consultation.prescription = {
      medications,
      instructions,
      notes,
      issuedBy: req.user.id,
      issuedAt: Date.now()
    };
    
    await consultation.save();
    
    res.status(200).json({
      success: true,
      data: consultation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add prescription',
      error: error.message
    });
  }
};