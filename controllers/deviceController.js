const deviceModel = require('../models/deviceModel');

exports.startDevice = (req, res) => {
    const message = req.body.message;

    // Validate the input
    if (!message) {
        return res.status(400).json({ status: 'error', message: 'Message is required' });
    }

    if (message === 'hello') {
        // Call the model function (optional, for demonstration)
        const responseMessage = deviceModel.processMessage(message);

        console.log(`Received message: ${message}`);
        res.status(200).json({ status: 'success', message: responseMessage });
    } else {
        res.status(400).json({ status: 'error', message: 'Invalid message!' });
    }
};
