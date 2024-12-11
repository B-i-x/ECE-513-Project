const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Import models (if needed directly)
const { User, Device, Measurement } = require('./models/hearttrack'); // Update path if required

// Import route handlers
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const devicesRouter = require('./routes/devices'); // For Heart Track devices

// SSL Certificate setup
const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
};

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// HTTP to HTTPS redirect middleware (not needed when HTTPS is enforced but here for any HTTP traffic)
app.use((req, res, next) => {
    if (!req.secure) {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

// Enable cross-origin access (CORS middleware)
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // Allowed methods
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization'); // Allowed headers
    res.setHeader('Access-Control-Allow-Credentials', true); // Include cookies if needed
    next();
});

// Middleware
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms - Body: :body')
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Route Handlers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/devices', devicesRouter);

app.use(function (err, req, res, next) {
    res.status(err.status || 500).json({
        message: err.message,
        error: err,
    });
});

// Start the HTTPS server
https.createServer(options, app).listen(PORT, '::', () => {
    console.log(`Server running on https://[::]:${PORT}`);
});

module.exports = app;
