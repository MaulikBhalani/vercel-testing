const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello from Express on Vercel!");
});

// You can add more routes here
app.get("/api/users", (req, res) => {
  res.json([
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ]);
});

// Important: Export the app for Vercel
module.exports = app;
