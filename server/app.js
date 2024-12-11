const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const fs = require('fs');

const app = express();

// SSL Certificate setup for HTTPS
const httpsOptions = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
};

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middleware
app.use((req, res, next) => {
    if (!req.secure && req.get('Host')) {
        const secureUrl = `https://${req.get('Host').replace(/:\d+$/, ":3443")}${req.url}`;
        return res.redirect(secureUrl);
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Route Handlers
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const devicesRouter = require('./routes/devices');
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/devices', devicesRouter);

app.use(function (err, req, res, next) {
    res.status(err.status || 500).json({
        message: err.message,
        error: err,
    });
});

// Create HTTP and HTTPS servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(httpsOptions, app);

// Define ports
const HTTP_PORT = 3000;  // HTTP port
const HTTPS_PORT = 3443; // HTTPS port

// Start servers
httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP server running on http://localhost:${HTTP_PORT}`);
});
httpsServer.listen(HTTPS_PORT, '::', () => {
    console.log(`HTTPS server running on https://[::]:${HTTPS_PORT}`);
});

module.exports = app;
