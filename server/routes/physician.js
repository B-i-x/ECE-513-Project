const express = require("express");
const bcrypt = require("bcrypt");
const Physician = require("../models/Physician"); // Assuming Physician schema is defined

const router = express.Router();

// POST /physicians/register - Register a new physician
router.post("/register", async (req, res) => {
    const { email, password, specialization } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        // Check if the email is already registered
        const existingPhysician = await Physician.findOne({ email });
        if (existingPhysician) {
            console.error(`Registration failed: Email (${email}) already exists.`);
            return res.status(409).json({ message: "Email is already registered." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Generated hash during registration:", hashedPassword);

        // Create and save the new physician
        const newPhysician = new Physician({
            email,
            password: hashedPassword,
            specialization, // Optional field
        });
        await newPhysician.save();

        // Log the saved physician (excluding sensitive data)
        console.log("New physician created:", { id: newPhysician._id, email: newPhysician.email });

        res.status(201).json({
            message: `Physician (${email}) registered successfully.`,
            physician: {
                id: newPhysician._id,
                email: newPhysician.email,
                specialization: newPhysician.specialization,
            },
        });
    } catch (err) {
        console.error("Error during physician registration:", err.message);
        res.status(500).json({ message: "Error registering physician.", error: err.message });
    }
});

module.exports = router;
