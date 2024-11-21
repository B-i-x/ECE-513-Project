const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Import routes
const deviceRoutes = require('./app/routes/deviceRoutes');

// Use the routes
app.use('/device', deviceRoutes);

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
