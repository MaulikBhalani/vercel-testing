const mongoose = require("mongoose");
const multer = require("multer");
require("dotenv").config();

const mongoURI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected for simple file storage"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Configure Multer to store files in memory as a buffer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = { upload }; // Only export upload for the simple collection method
