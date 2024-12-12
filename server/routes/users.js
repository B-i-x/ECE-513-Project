const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables
const { Device, User, Measurement } = require("../models/hearttrack");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET; // Retrieve the secret key from the environment variable

if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined. Please set it in your environment variables.");
    process.exit(1); // Exit the app if the secret key is missing
}

router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Generated hash during registration:", hashedPassword);

        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        const savedUser = await User.findOne({ email }); // Query the saved user
        console.log("Saved user in DB:", savedUser); // Log the stored hash to confirm

        res.status(201).json({ message: `User (${email}) registered successfully.` });
    } catch (err) {
        console.error("Error during registration:", err.message);
        res.status(500).json({ message: "Error registering user.", error: err.message });
    }
});



router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' }); // Ensure token expiration is set
        res.status(200).json({ message: "Login successful.", token }); // Return the token to the client
    } catch (err) {
        console.error("Error during login:", err.message);
        res.status(500).json({ message: "Error logging in.", error: err.message });
    }
});


const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        console.error("No token provided."); // Debug log
        return res.status(401).json({ message: "Access token is required." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Decoded token:", decoded); // Debug log
        req.user = decoded; // Add the decoded user data to the request
        next();
    } catch (err) {
        console.error("Token verification failed:", err.message); // Debug log
        res.status(403).json({ message: "Invalid or expired token." });
    }
};


router.put('/update-password', authenticateToken, async (req, res) => {
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ message: "New password is required." });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.id }, // Use ID from token
            { password: hashedPassword },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ message: "Password updated successfully." });
    } catch (err) {
        res.status(500).json({ message: "Error updating password.", error: err.message });
    }
});


router.delete("/unclaim-device", authenticateToken, async (req, res) => {
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

        // Remove the owner from the device
        const deviceToUnclaim = user.devices[deviceIndex];
        const device = await Device.findById(deviceToUnclaim._id);
        if (!device) {
            return res.status(404).json({ message: "Device not found." });
        }

        device.owner = null; // Unclaim the device
        await device.save();

        // Remove the device from the user's devices list
        user.devices.splice(deviceIndex, 1);
        await user.save();

        res.status(200).json({ message: "Device unclaimed successfully." });
    } catch (err) {
        res.status(500).json({ message: "Error unclaiming device.", error: err.message });
    }
});

router.post('/claim-device', authenticateToken, async (req, res) => {
    const { deviceId } = req.body;

    if (!deviceId) {
        return res.status(400).json({ message: "Device ID is required." });
    }

    try {
        // Find the device with the given ID and ensure it is unclaimed (no owner)
        const device = await Device.findOne({ deviceId, owner: null });
        if (!device) {
            return res.status(404).json({ message: "Device not found or already claimed." });
        }

        // Assign the device to the user
        device.owner = req.user.id;
        await device.save();

        // Add the device to the user's devices list
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        user.devices.push(device._id);
        await user.save();

        res.status(200).json({ message: "Device claimed successfully.", device });
    } catch (err) {
        console.error("Error claiming device:", err.message);
        res.status(500).json({ message: "Error claiming device.", error: err.message });
    }
});


router.get('/unclaimed-devices', async (req, res) => {
    try {
        // Fetch devices where the owner is null
        const devices = await Device.find({ owner: null }, 'deviceId'); // Fetch only required fields
        res.status(200).json({ devices });
    } catch (err) {
        console.error("Error fetching unclaimed devices:", err.message);
        res.status(500).json({ message: "Error fetching unclaimed devices.", error: err.message });
    }
});


router.get('/devices', authenticateToken, async (req, res) => {
    try {
        // Fetch devices where the owner matches the authenticated user
        const devices = await Device.find({ owner: req.user.id }, 'deviceId')

        res.status(200).json({ devices });
    } catch (err) {
        console.error("Error fetching claimed devices:", err.message);
        res.status(500).json({ message: "Error fetching claimed devices.", error: err.message });
    }
});




// Get data for a specific device using query parameters, with limit, date, and time filters
router.get('/data', async (req, res) => {
    const { deviceId, limit, startDate, endDate, startTime, endTime } = req.query;

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

        // Apply date range filters
        if (startDate || endDate) {
            const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
            const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

            measurements = measurements.filter(measurement => {
                const measurementDate = new Date(measurement.timestamp);
                return (!start || measurementDate >= start) && (!end || measurementDate <= end);
            });
        }

        // Apply time range filters
        if (startTime || endTime) {
            const start = startTime ? new Date(`1970-01-01T${startTime}`) : null;
            const end = endTime ? new Date(`1970-01-01T${endTime}`) : null;

            measurements = measurements.filter(measurement => {
                const measurementTime = new Date(`1970-01-01T${new Date(measurement.timestamp).toTimeString().split(' ')[0]}`);
                return (!start || measurementTime >= start) && (!end || measurementTime <= end);
            });
        }

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


module.exports = router;
