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
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Generated hash during registration:", hashedPassword);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        const savedUser = await User.findOne({ username }); // Query the saved user
        console.log("Saved user in DB:", savedUser); // Log the stored hash to confirm

        res.status(201).json({ message: `User (${username}) registered successfully.` });
    } catch (err) {
        console.error("Error during registration:", err.message);
        res.status(500).json({ message: "Error registering user.", error: err.message });
    }
});


router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.error("User not found:", username);
            return res.status(401).json({ message: "Invalid username or password." });
        }

        console.log("Password entered:", password); // Debug log
        console.log("Stored hashed password from DB:", user.password); // Debug log

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match result:", isMatch); // Debug log

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: "Login successful.", token });
    } catch (err) {
        console.error("Error during login:", err.message);
        res.status(500).json({ message: "Error logging in.", error: err.message });
    }
});





module.exports = router;
