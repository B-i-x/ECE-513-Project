const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
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
app.use(logger('dev'));
// Use the 'combined' format for detailed logs
app.use(morgan('detailed'));
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

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Render the error page
    res.status(err.status || 500);
    res.render('error');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});

module.exports = app;
