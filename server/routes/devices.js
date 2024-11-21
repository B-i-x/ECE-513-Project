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

// Get data for a specific device
router.get('/data/:deviceId', async (req, res) => {
    const { deviceId } = req.params;

    try {
        const device = await Device.findOne({ deviceId }).populate('measurements');
        if (!device) {
            return res.status(404).json({ message: "Device not found." });
        }

        res.status(200).json({ message: "Device data retrieved.", data: device });
    } catch (err) {
        res.status(500).json({ message: "Error fetching device data.", error: err.message });
    }
});

module.exports = router;
