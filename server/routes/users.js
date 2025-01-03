const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables
const { Device, User, Measurement, physicianPatient } = require("../models/hearttrack");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET; // Retrieve the secret key from the environment variable

if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined. Please set it in your environment variables.");
    process.exit(1); // Exit the app if the secret key is missing
}

// POST /users/register - Register a new user
router.post("/register", async (req, res) => {
    const { email, password, role, specialization } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    if (role && !["patient", "physician"].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Allowed values are 'patient' or 'physician'." });
    }

    try {
        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.error(`Registration failed: Email (${email}) already exists.`);
            return res.status(409).json({ message: "Email is already registered." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Generated hash during registration:", hashedPassword);

        // Create and save the new user
        const newUser = new User({
            email,
            password: hashedPassword,
            role: role || "patient", // Default to "patient" if role is not provided
            specialization: role === "physician" ? specialization : undefined, // Only for physicians
        });
        await newUser.save();

        console.log("New user created:", { id: newUser._id, email: newUser.email, role: newUser.role });

        res.status(201).json({
            message: `User (${email}) registered successfully.`,
            user: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role,
                specialization: newUser.specialization,
            },
        });
    } catch (err) {
        console.error("Error during user registration:", err.message);
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
        if (req.user.role === 'physician') {
            // Fetch devices of all patients assigned to the physician, including patient emails
            const devices = await Device.find({ owner: { $exists: true } })
                .populate('owner', 'email') // Populate the owner's email
                .select('deviceId owner');

            const devicesWithEmails = devices.map(device => ({
                deviceId: device.deviceId,
                patientEmail: device.owner.email, // Extract the owner's email
            }));

            res.status(200).json({ devices: devicesWithEmails });
        } else {
            // Fetch devices owned by the authenticated user
            const devices = await Device.find({ owner: req.user.id }, 'deviceId');
            res.status(200).json({ devices });
        }
    } catch (err) {
        console.error('Error fetching devices:', err.message);
        res.status(500).json({ message: 'Error fetching devices.', error: err.message });
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



////////////////////////physician stuff/////////////////////////



// POST /users/register-patient - Register a patient to a physician
router.post("/register-patient", async (req, res) => {
    const { patientEmail, physicianId } = req.body;

    if (!patientEmail || !physicianId) {
        console.error("Missing required fields: patientEmail or physicianId.");
        return res.status(400).json({ message: "Patient email and physician ID are required." });
    }

    try {
        console.log(`Attempting to find physician with ID: ${physicianId}`);
        // Find the physician by ID
        const physician = await User.findById(physicianId);
        if (!physician || physician.role !== "physician") {
            console.error(`Physician not found or invalid role for ID: ${physicianId}`);
            return res.status(404).json({ message: "Physician not found or invalid role." });
        }
        console.log(`Physician found: ${physician.email}, Role: ${physician.role}`);

        console.log(`Attempting to find or create patient with email: ${patientEmail}`);
        // Find the patient by email
        let patient = await User.findOne({ email: patientEmail });
        if (!patient) {
            console.log(`Patient with email ${patientEmail} not found. `);
            
        } else if (patient.role !== "patient") {
            console.error(`User with email ${patientEmail} is not a patient. Role: ${patient.role}`);
            return res.status(400).json({ message: "The provided email is not associated with a patient role." });
        } else {
            console.log(`Patient found with email: ${patient.email}`);
        }

        console.log(`Checking for existing relationship between Physician (${physicianId}) and Patient (${patient._id})`);
        // Check if the patient is already assigned to the physician
        const existingRelation = await physicianPatient.findOne({
            physician: physicianId,
            patient: patient._id,
        });

        if (existingRelation) {
            console.error("This patient is already assigned to the physician.");
            return res.status(409).json({ message: "This patient is already assigned to the physician." });
        }

        console.log("No existing relationship found. Creating new relationship.");
        // Create the physician-patient relationship
        const newRelation = new physicianPatient({
            physician: physician._id,
            patient: patient._id,
        });
        await newRelation.save();

        console.log(`Relationship created: Physician (${physician.email}) - Patient (${patient.email})`);
        res.status(201).json({
            message: `Patient (${patient.email}) registered to Physician (${physician.email}) successfully.`,
            relation: {
                physician: physician.email,
                patient: patient.email,
            },
        });
    } catch (err) {
        console.error("Error registering patient to physician:", err.message);
        console.error("Stack trace:", err.stack);
        res.status(500).json({ message: "Error registering patient to physician.", error: err.message });
    }
});



// GET /users/physicians - Fetch all physicians' emails
router.get("/physicians", async (req, res) => {
    try {
        // Find all users with the role "physician"
        const physicians = await User.find({ role: "physician" }, "email specialization");

        if (physicians.length === 0) {
            return res.status(404).json({ message: "No physicians found." });
        }

        res.status(200).json({
            message: "Physicians retrieved successfully.",
            physicians,
        });
    } catch (err) {
        console.error("Error fetching physicians:", err.message);
        res.status(500).json({ message: "Error fetching physicians.", error: err.message });
    }
});

// GET /users/assigned-physicians - Fetch all physicians assigned to the authenticated user
router.get('/assigned-physicians', authenticateToken, async (req, res) => {
    try {
        console.log('Authenticated user:', req.user); // Debug log

        // Assuming the user ID is extracted from a verified JWT and stored in `req.user`
        const userId = req.user.id;

        // Ensure the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Fetch all physician-patient relationships for this user
        const physicianRelations = await physicianPatient.find({ patient: userId }).populate('physician', 'email specialization');

        // Extract physician information
        const assignedPhysicians = physicianRelations.map(relation => ({
            email: relation.physician.email,
            specialization: relation.physician.specialization,
        }));

        res.status(200).json({
            message: 'Assigned physicians retrieved successfully.',
            assignedPhysicians,
        });
    } catch (err) {
        console.error('Error fetching assigned physicians:', err.message);
        res.status(500).json({ message: 'Error fetching assigned physicians.', error: err.message });
    }
});

// GET /users/patient-devices - Fetch all devices of patients assigned to the physician
router.get('/patient-devices', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user || user.role !== 'physician') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        // Find all patients assigned to the physician
        const patientRelations = await physicianPatient.find({ physician: req.user.id }).populate('patient');
        const patientIds = patientRelations.map(rel => rel.patient._id);

        // Fetch devices of all assigned patients and include patient emails
        const devices = await Device.find({ owner: { $in: patientIds } })
            .populate('owner', 'email') // Include email of the patient (owner)

        const devicesWithEmails = devices.map(device => ({
            deviceId: device.deviceId,
            patientEmail: device.owner.email, // Extract patient email from the populated owner
        }));

        res.status(200).json({ devices: devicesWithEmails });
    } catch (err) {
        console.error('Error fetching patient devices:', err.message);
        res.status(500).json({ message: 'Error fetching patient devices.', error: err.message });
    }
});


module.exports = router;
