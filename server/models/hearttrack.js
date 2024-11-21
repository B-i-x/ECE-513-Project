const db = require("../db");

// User Schema
const userSchema = new db.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Store hashed passwords
    devices: [{ type: db.Schema.Types.ObjectId, ref: "Device" }] // References to registered devices
});

// Device Schema
const deviceSchema = new db.Schema({
    deviceId: { type: String, required: true, unique: true },
    owner: { type: db.Schema.Types.ObjectId, ref: "User" }, // References the user who owns this device
    measurements: [{ type: db.Schema.Types.ObjectId, ref: "Measurement" }] // References the measurements
});

// Measurement Schema
const measurementSchema = new db.Schema({
    heartRate: { type: Number, required: true },
    bloodOxygenSaturation: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    device: { type: db.Schema.Types.ObjectId, ref: "Device" } // References the device
});

// Create Models
const User = db.model("User", userSchema);
const Device = db.model("Device", deviceSchema);
const Measurement = db.model("Measurement", measurementSchema);

module.exports = {
    User,
    Device,
    Measurement,
};
