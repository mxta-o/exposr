const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

require("./services/developTimer");


const app = express();
const PORT = process.env.PORT || 3001;

const authRoutes = require("./routes/auth");
const photoRoutes = require("./routes/photos");
const adminRoutes = require("./routes/admin");

app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Exposr API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;