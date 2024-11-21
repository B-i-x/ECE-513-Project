const mongoose = require("mongoose");

// Correct connection string
mongoose.connect("mongodb://127.0.0.1:27017/ece513project", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Event listeners for connection success and error
mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB successfully!");
});

mongoose.connection.on("error", (err) => {
    console.error("Failed to connect to MongoDB:", err);
});


module.exports = mongoose;
