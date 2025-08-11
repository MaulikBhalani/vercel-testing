const express = require("express");
const app = express();
const { upload } = require("../config/db"); // Import only 'upload'
const File = require("../models/File"); // Import your new File model

// Body parser middleware (still good to have for other JSON payloads)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Hello from Express on Vercel!");
});

// Your existing API routes
app.get("/api/users", (req, res) => {
  res.json([
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ]);
});

// API to upload a PDF file (simplified)
app.post("/api/upload-pdf", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Check file size (optional, but good practice for your 1MB limit)
  if (req.file.size > 1024 * 1024) {
    // 1 MB in bytes
    return res.status(400).json({ message: "File exceeds 1MB limit." });
  }

  try {
    const newFile = new File({
      filename: req.file.originalname, // Use original filename from upload
      contentType: req.file.mimetype,
      fileData: req.file.buffer, // The binary data from multer.memoryStorage()
    });

    await newFile.save();

    res.status(201).json({
      message: "PDF uploaded successfully to simple collection",
      fileId: newFile._id,
      filename: newFile.filename,
    });
  } catch (error) {
    console.error("Error saving file to MongoDB:", error);
    res.status(500).json({ message: "Server error during file upload" });
  }
});

// API to retrieve a PDF file by ID or filename (using a query param)
app.get("/api/pdf", async (req, res) => {
  const fileId = req.query.id;
  const filename = req.query.filename;

  if (!fileId && !filename) {
    return res
      .status(400)
      .json({ message: "Please provide either file ID or filename." });
  }

  try {
    let file;
    if (fileId) {
      file = await File.findById(fileId);
    } else {
      file = await File.findOne({ filename });
    }

    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    if (file.contentType === "application/pdf") {
      res.set("Content-Type", file.contentType);
      res.set("Content-Disposition", `inline; filename="${file.filename}"`);
      res.send(file.fileData); // Send the binary buffer directly
    } else {
      res.status(400).json({ message: "File is not a PDF." });
    }
  } catch (error) {
    console.error("Error retrieving file from MongoDB:", error);
    res.status(500).json({ message: "Server error during file retrieval" });
  }
});

// Important: Export the app for Vercel
module.exports = app;
