const express = require("express");
const { Device, User } = require("../models/hearttrack");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;


const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        console.error("No token provided."); // Debug log
        return res.status(401).json({ message: "Access token is required." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Token decoded successfully:", decoded); // Debug log
        req.user = decoded; // Attach decoded user data to `req.user`
        next();
    } catch (err) {
        console.error("Token verification failed:", err.message); // Debug log
        res.status(403).json({ message: "Invalid or expired token." });
    }
};

router.post('/set-schedule', authenticateToken, async (req, res) => {
    const { deviceId, startTime, endTime, frequency } = req.body;

    if (!deviceId || !startTime || !endTime || !frequency) {
        return res.status(400).json({ message: "All fields (deviceId, startTime, endTime, frequency) are required." });
    }

    try {
        const device = await Device.findOne({ deviceId, owner: req.user.id });
        if (!device) {
            return res.status(404).json({ message: "Device not found or not owned by the user." });
        }

        device.schedule = { startTime, endTime, frequency };
        await device.save();

        res.status(200).json({ message: "Schedule set successfully.", schedule: device.schedule });
    } catch (err) {
        res.status(500).json({ message: "Error setting schedule.", error: err.message });
    }
});


router.post('/register', authenticateToken, async (req, res) => {
    const { deviceId } = req.body;

    if (!deviceId) {
        console.error("No Device ID provided."); // Debug log
        return res.status(400).json({ message: "Device ID is required." });
    }

    try {
        console.log("User ID from token:", req.user?.id || "No user ID"); // Debug log

        // Fetch the user from the database
        const user = await User.findById(req.user.id);
        if (!user) {
            console.error("User not found for ID:", req.user.id); // Debug log
            return res.status(404).json({ message: "User not found." });
        }

        console.log("Registering device for user:", user.email); // Debug log

        // Check if the device already exists
        const existingDevice = await Device.findOne({ deviceId });
        if (existingDevice) {
            console.error("Device ID already registered:", deviceId); // Debug log
            return res.status(409).json({ message: "Device ID already registered." });
        }

        // Create and save the new device
        const newDevice = new Device({ deviceId, owner: user._id });
        await newDevice.save();

        // Add the device to the user's devices list
        user.devices.push(newDevice._id);
        await user.save();

        console.log("Device registered successfully:", newDevice); // Debug log
        res.status(201).json({ message: "Device registered successfully.", device: newDevice });
    } catch (err) {
        console.error("Error during device registration:", err.message); // Debug log
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

router.delete("/remove-device", authenticateToken, async (req, res) => {
    const { deviceId } = req.body;

    if (!deviceId) {
        return res.status(400).json({ message: "Device ID is required." });
    }

    try {
        // Find the user by ID from the token
        const user = await User.findById(req.user.id).populate("devices");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the device belongs to the user
        const deviceIndex = user.devices.findIndex(
            (device) => device.deviceId === deviceId
        );
        if (deviceIndex === -1) {
            return res
                .status(404)
                .json({ message: "Device not associated with this user." });
        }

        // Remove the device from the user's devices list
        const deviceToRemove = user.devices[deviceIndex];
        user.devices.splice(deviceIndex, 1);
        await user.save();

        // Optionally, delete the device from the database
        await Device.findByIdAndDelete(deviceToRemove._id);

        res.status(200).json({ message: "Device removed successfully." });
    } catch (err) {
        res.status(500).json({ message: "Error removing device.", error: err.message });
    }
});



module.exports = router;

