const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/hearttrack');


const router = express.Router();
const JWT_SECRET = "your_secret_key"; // Replace with a secure environment variable

// Register a new user
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: "Username already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: `User (${username}) registered successfully.` });
    } catch (err) {
        res.status(500).json({ message: "Error registering user.", error: err.message });
    }
});

// Login a user and return a JWT
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: "Login successful.", token });
    } catch (err) {
        res.status(500).json({ message: "Error logging in.", error: err.message });
    }
});

module.exports = router;
