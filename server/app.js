const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const fs = require('fs');
require('dotenv').config(); // Load environment variables

const app = express();

const SERVER_ENV = process.env.SERVER_ENV;

let httpsOptions;
console.log('SERVER_ENV:', SERVER_ENV);
if (SERVER_ENV != 'local') {
    // SSL Certificate setup for HTTPS
    httpsOptions = {
        key: fs.readFileSync('server.key'),
        cert: fs.readFileSync('server.cert')
    };
}

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


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
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const devicesRouter = require('./routes/devices');
const physiciansRouter = require('./routes/physicians');
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/devices', devicesRouter);
app.use('/physicians', physiciansRouter);

app.use(function (err, req, res, next) {
    res.status(err.status || 500).json({
        message: err.message,
        error: err, // Send full error details (for debugging; remove in production)
    });
});

// Create HTTP and HTTPS servers
const httpServer = http.createServer(app);

let httpsServer;
if (SERVER_ENV !== 'local') {
    // Create HTTPS server
    httpsServer = https.createServer(httpsOptions, app);
}

// Define ports
const HTTP_PORT = 3000;  // HTTP port

const HTTPS_PORT = 3001; // HTTPS port

// Start servers
httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP server running on http://localhost:${HTTP_PORT}`);
});

if (SERVER_ENV !== 'local') {

    httpsServer.listen(HTTPS_PORT, '::', () => {
        console.log(`HTTPS server running on https://[::]:${HTTPS_PORT}`);
    });
}

module.exports = app;