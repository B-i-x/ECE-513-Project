const express = require("express");
const { Device, User, Measurement } = require("../models/hearttrack");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Device = require('../models/Device');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateApiKey = (req, res, next) => {
    const apiKey = req.headers["apikey"]; // Extract `apiKey` from the header
    if (!apiKey) {
        console.error("No API key provided."); // Debug log
        return res.status(400).json({ message: "API key is required in the header." });
    }
    console.log("API key received:", apiKey); // Debug log
    next(); // Proceed without verification
};

router.post('/register', authenticateApiKey, async (req, res) => {
    const { deviceId } = req.body;

    if (!deviceId) {
        console.error("Device ID is required."); // Debug log
        return res.status(400).json({ message: "Device ID is required." });
    }

    try {
        console.log("Registering device:", deviceId); // Debug log

        // Check if the device already exists
        const existingDevice = await Device.findOne({ deviceId });
        if (existingDevice) {
            console.error("Device ID already registered:", deviceId); // Debug log
            return res.status(409).json({ message: "Device ID already registered." });
        }

        // Create and save the new device
        const newDevice = new Device({ deviceId });
        await newDevice.save();

        console.log("Device registered successfully:", newDevice); // Debug log
        res.status(201).json({ message: "Device registered successfully.", device: newDevice });
    } catch (err) {
        console.error("Error during device registration:", err.message); // Debug log
        res.status(500).json({ message: "Error registering device.", error: err.message });
    }
});



// Add new data (bpm and blood oxygen level) for a device
router.post('/data', async (req, res) => {
    const { bpm, bOx, deviceId } = req.body; // Extract data from JSON body

    // Validate required parameters
    if (!bpm || !bOx || !deviceId) {
        return res.status(400).json({ message: "bpm, bOx, and deviceId are required in the JSON body." });
    }

    // Convert bpm and bOx to numbers for validation
    const heartRate = parseFloat(bpm);
    const bloodOxygenSaturation = parseFloat(bOx);

    if (isNaN(heartRate) || isNaN(bloodOxygenSaturation)) {
        return res.status(400).json({ message: "bpm and bOx must be valid numbers." });
    }


    try {
        // Find the device by deviceId
        const device = await Device.findOne({ deviceId });
        if (!device) {
            return res.status(404).json({ message: "Device not found." });
        }

        // Create a new Measurement
        const newMeasurement = new Measurement({
            heartRate,
            bloodOxygenSaturation,
            device: device._id,
        });

        // Save the measurement
        await newMeasurement.save();

        // Associate the measurement with the device
        device.measurements.push(newMeasurement._id);
        await device.save();

        res.status(201).json({
            message: "Measurement added successfully.",
            measurement: newMeasurement,
        });
    } catch (err) {
        res.status(500).json({ message: "Error saving measurement.", error: err.message });
    }
});

// Route to get timing data for a device
router.get("/timing-data", authenticateToken, async (req, res) => {
    const { deviceId } = req.query;

    if (!deviceId) {
        return res.status(400).json({ message: "Device ID is required as a query parameter." });
    }

    try {
        // Find the device by deviceId and ensure it belongs to the authenticated user
        const device = await Device.findOne({ deviceId, owner: req.user.id });
        if (!device) {
            return res.status(404).json({ message: "Device not found or not owned by the user." });
        }

        // Default values
        const defaultSchedule = {
            startTime: 6,
            endTime: 22,
            frequencyMin: 30,
        };

        // Use the device's schedule if it exists, otherwise use defaults
        const schedule = device.schedule || defaultSchedule;

        res.status(200).json({
            message: "Timing data retrieved successfully.",
            schedule: {
                startTime: schedule.startTime || defaultSchedule.startTime,
                endTime: schedule.endTime || defaultSchedule.endTime,
                frequencyMin: schedule.frequencyMin || defaultSchedule.frequencyMin,
            },
        });
    } catch (err) {
        console.error("Error fetching timing data:", err.message);
        res.status(500).json({ message: "Error fetching timing data.", error: err.message });
    }
});

// Route to get timing data for a specific device
router.get('/timing-data', async (req, res) => {
    try {
        // Get the deviceId from the query parameters
        const { deviceId } = req.query;

        // Validate that deviceId is provided
        if (!deviceId) {
            return res.status(400).json({ error: "Device ID is required" });
        }

        // Find the device in the database
        const device = await Device.findOne({ deviceId });

        // If the device is not found, return an error
        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }

        // Extract timing data from the device
        const { schedule } = device;
        const { startTime, endTime, frequency } = schedule;

        // Return the timing data
        res.json({
            deviceId,
            startTime,
            endTime,
            frequency
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});
module.exports = router;

