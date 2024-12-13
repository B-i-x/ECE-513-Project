const mongoose = require("../db"); // Assuming "../db" exports a mongoose instance

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, trim: true }, // Unique email field
    password: { type: String, required: true }, // Store hashed passwords
    devices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Device" }], // References to registered devices
    role: { type: String, enum: ["patient", "physician"], default: "patient" }, // Role to distinguish users
});


const deviceSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    measurements: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Measurement" }
    ],
    schedule: {
        startTime: { 
            type: Number, // Representing the start hour (e.g., 6 for 6 AM)
            default: 6    // Default start time
        },
        endTime: { 
            type: Number, // Representing the end hour (e.g., 22 for 10 PM)
            default: 22   // Default end time
        },
        frequency: { 
            type: Number, // Frequency in minutes
            default: 30   // Default frequency
        }
    }
});


// Measurement Schema
const measurementSchema = new mongoose.Schema({
    heartRate: { 
        type: Number, 
        required: true,
        min: [0, "Heart rate must be positive"], 
        max: [300, "Heart rate exceeds normal range"] 
    },
    bloodOxygenSaturation: { 
        type: Number, 
        required: true, 
        min: [0, "Blood oxygen must be positive"], 
        max: [100, "Blood oxygen saturation exceeds normal range"] 
    },
    timestamp: { type: Date, default: Date.now },
    device: { type: mongoose.Schema.Types.ObjectId, ref: "Device" }, // References the device
});

const physicianPatientSchema = new mongoose.Schema({
    physician: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


// Create Models
const User = mongoose.model("User", userSchema);
const Device = mongoose.model("Device", deviceSchema);
const Measurement = mongoose.model("Measurement", measurementSchema);
const physicianPatient = mongoose.model("PhysicianPatient", physicianPatientSchema);

module.exports = {
    User,
    Device,
    Measurement,
    physicianPatient
};
