const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");


// Routes
const authRoutes = require("./routes/auth")
const photoRoutes = require("./routes/photos")
const adminRoute = require("./routes/admin")

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// Route Mounting
app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/admin", adminRoutes);

// Health Check
app.get("/", (req, res) => {
    res.json({ message: "Exposr API is running" });
  });

// Start Server

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;