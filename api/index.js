const express = require("express");
const app = express();
const { gfs, upload, conn } = require("../config/db"); // Adjust path as needed
const mongoose = require("mongoose");

// Body parser middleware (important for other routes, but file upload uses multer)
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

// API to upload a PDF file
// 'file' should be the name attribute of your file input field in the form
app.post("/api/upload-pdf", upload.single("file"), (req, res) => {
  if (req.file) {
    return res.status(201).json({
      message: "PDF uploaded successfully",
      fileId: req.file.id,
      filename: req.file.filename,
    });
  }
  res.status(400).json({ message: "No file uploaded" });
});

// API to retrieve a PDF file by filename
app.get("/api/pdf/:filename", (req, res) => {
  const filename = req.params.filename;

  if (!gfs) {
    return res.status(500).json({ message: "GridFS not initialized" });
  }

  gfs.find({ filename }).toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "No file exists" });
    }

    // If file exists and is a PDF
    if (files[0].contentType === "application/pdf") {
      res.set("Content-Type", files[0].contentType);
      res.set("Content-Disposition", `inline; filename="${files[0].filename}"`); // Or 'attachment' to force download
      const readstream = gfs.openDownloadStreamByName(filename);
      readstream.pipe(res);
    } else {
      res.status(400).json({ message: "File is not a PDF" });
    }
  });
});

// Important: Export the app for Vercel
module.exports = app;
