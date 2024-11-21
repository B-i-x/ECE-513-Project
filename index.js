const express = require('express');
const app = express();

const PORT = 3000;

// Simple route
app.get('/', (req, res) => {
    res.send('Hello from Node.js server on EC2!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
