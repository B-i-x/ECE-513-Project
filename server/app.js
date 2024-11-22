const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Import models (if needed directly)
const { User, Device, Measurement } = require('./models/hearttrack'); // Update path if required

// Import route handlers
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const devicesRouter = require('./routes/devices'); // For Heart Track devices

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Enable cross-origin access (CORS middleware)
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // Allowed methods
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization'); // Allowed headers
    res.setHeader('Access-Control-Allow-Credentials', true); // Include cookies if needed
    next();
});

// Middleware
// Define a custom Morgan token to include the body
morgan.token('body', (req) => JSON.stringify(req.body));

// Use Morgan with the custom token
app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms - Body: :body')
);

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded data
app.use(bodyParser.json()); // Ensure JSON body parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// Route Handlers
app.use('/', indexRouter); // Handles main application routes
app.use('/users', usersRouter); // Handles user-related operations
app.use('/devices', devicesRouter); // Handles Heart Track device-related operations

app.use(function (err, req, res, next) {
    res.status(err.status || 500).json({
        message: err.message,
        error: err, // Send full error details (for debugging; remove in production)
    });
});


// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});

module.exports = app;