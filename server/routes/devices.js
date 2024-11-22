const express = require('express');
const { Device, User, Measurement } = require('../models/hearttrack'); // Adjust path as needed

const router = express.Router();

// Register a new device
router.post('/register', async (req, res) => {
    const { deviceId, username } = req.body;

    if (!deviceId || !username) {
        return res.status(400).json({ message: "Device ID and username are required." });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const existingDevice = await Device.findOne({ deviceId });
        if (existingDevice) {
            return res.status(409).json({ message: "Device ID already registered." });
        }

        const newDevice = new Device({ deviceId, owner: user._id });
        await newDevice.save();

        user.devices.push(newDevice._id);
        await user.save();

        res.status(201).json({ message: "Device registered successfully.", device: newDevice });
    } catch (err) {
        res.status(500).json({ message: "Error registering device.", error: err.message });
    }
});



// Get data for a specific device using query parameters, with limit and sorted by most recent
router.get('/data', async (req, res) => {
    const { deviceId, limit } = req.query;

    if (!deviceId) {
        return res.status(400).json({ message: "Device ID is required as a query parameter." });
    }

    try {
        const device = await Device.findOne({ deviceId }).populate('measurements');
        if (!device) {
            return res.status(404).json({ message: "Device not found." });
        }

        let measurements = device.measurements;

        // Sort measurements by timestamp in descending order
        measurements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Limit the number of data points returned
        if (limit !== undefined) {
            const numLimit = parseInt(limit, 10);
            if (isNaN(numLimit) || numLimit < -1) {
                return res.status(400).json({ message: "Invalid limit value. Must be -1 or a positive integer." });
            }

            if (numLimit !== -1) {
                measurements = measurements.slice(0, numLimit);
            }
        }

        res.status(200).json({
            message: "Device data retrieved.",
            data: {
                ...device.toObject(), // Include the device object
                measurements: measurements,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching device data.", error: err.message });
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



module.exports = router;

