const express = require('express');
const consultationRouter = express.Router();
const consultationController = require('../controller/consultationcontroller');
const { protectRoute } = require('../middleware/authmiddleware');

// Create a new consultation
consultationRouter.post('/', protectRoute, consultationController.createConsultation);

// Get consultation by ID
consultationRouter.get('/:id', protectRoute, consultationController.getConsultation);

// Get all consultations for a user (doctor or patient)
consultationRouter.get('/', protectRoute, consultationController.getUserConsultations);

// Update consultation status
consultationRouter.patch('/:id/status', protectRoute, consultationController.updateConsultationStatus);

// Generate token for video consultation
consultationRouter.get('/:consultationId/video-token', protectRoute, consultationController.generateVideoToken);

// Upload medical records
consultationRouter.post('/upload-record', protectRoute, consultationController.uploadMedicalRecord);

// Add prescription to consultation
consultationRouter.post('/:consultationId/prescription', protectRoute, consultationController.addPrescription);

module.exports = consultationRouter;