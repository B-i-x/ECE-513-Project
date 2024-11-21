const mongoose = require("../db"); // Assuming "../db" exports a mongoose instance

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, // Store hashed passwords
    devices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Device" }], // References to registered devices
});

// Device Schema
const deviceSchema = new mongoose.Schema({
    deviceId: { type: String, required: true, unique: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // References the user who owns this device
    measurements: [{ type: mongoose.Schema.Types.ObjectId, ref: "Measurement" }], // References the measurements
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

// Create Models
const User = mongoose.model("User", userSchema);
const Device = mongoose.model("Device", deviceSchema);
const Measurement = mongoose.model("Measurement", measurementSchema);

module.exports = {
    User,
    Device,
    Measurement,
};
