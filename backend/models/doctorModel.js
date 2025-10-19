const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    // --- Personal & Account Information ---
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the main User model for authentication/account details
        required: true,
        unique: true // Ensures only one doctor document per user account
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: { // Often stored here for quick lookups, even if in User model
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    profilePicture: {
        type: String, // URL to the doctor's photo
        default: 'https://avatar.iran.liara.run/public/default.png' 
    },
    
    // --- Professional Details ---
    specialization: {
        type: String,
        required: true,
        trim: true
        // Consider making this an enum for defined specialties
    },
    qualifications: [{
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: Number, required: true }
    }],
    experienceYears: {
        type: Number,
        default: 0
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    consultationFee: {
        type: Number,
        required: true,
        min: 0
    },

    // --- Location & Availability ---
    clinicName: {
        type: String,
        trim: true
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        zipCode: { type: String, trim: true }
    },
    // Simple way to store daily availability
    availableDays: [{ 
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    startTime: { // E.g., "09:00"
        type: String,
        trim: true
    },
    endTime: {   // E.g., "17:00"
        type: String,
        trim: true
    },
    
    // --- Rating & Status ---
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    isApproved: { // To be set by an administrator after verification
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;