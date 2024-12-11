const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/hearttrack');
require('dotenv').config(); // Load environment variables

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET; // Retrieve the secret key from the environment variable

if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined. Please set it in your environment variables.");
    process.exit(1); // Exit the app if the secret key is missing
}

//
function registerDevice() {
    const deviceId = $('#deviceId').val();
    const token = localStorage.getItem('authToken'); // Retrieve token from localStorage

    if (!deviceId) {
        console.error("Device ID is missing."); // Debug log
        window.alert("Device ID is required!");
        return;
    }

    if (!token) {
        console.error("Auth token is missing."); // Debug log
        window.alert("No token found. Please log in again.");
        return;
    }

    console.log("Registering device with token:", token); // Debug log

    $.ajax({
        url: '/devices/register',
        method: 'POST',
        contentType: 'application/json',
        headers: {
            Authorization: `Bearer ${token}` // Include token in header
        },
        data: JSON.stringify({ deviceId }),
        dataType: 'json'
    })
        .done(data => {
            console.log("Device registered successfully:", data);
            window.alert("Device registered successfully!");
        })
        .fail(data => {
            console.error("Device registration failed:", data.responseJSON);
            $('#rxData').html(JSON.stringify(data.responseJSON, null, 2));
        });
}


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




module.exports = router;
