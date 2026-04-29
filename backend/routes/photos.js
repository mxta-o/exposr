const express = require("express");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const { spawn } = require("child_process");
const exifr = require("exifr");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const authMiddleware = require("../middleware/authMiddleware");

dotenv.config();

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
});

// POST /api/photos/upload
router.post("/upload", authMiddleware, upload.single("photo"), async (req, res) => {
  const userId = req.user.id;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No photo provided" });

  try {
    // EXIF timestamp check — must be taken within 5 minutes
    const exif = await exifr.parse(file.path);
    if (exif?.DateTimeOriginal) {
      const diffMinutes = (new Date() - new Date(exif.DateTimeOriginal)) / 60000;
      if (diffMinutes > 5) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: "Photo must be taken within the last 5 minutes" });
      }
    }

    // Weekly shot limit check (10 per week)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("photos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", weekStart.toISOString());

    if (count >= 10) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: "You have used all 10 shots this week" });
    }

    // Run Python Polaroid processor
    const outputPath = `uploads/processed_${Date.now()}.jpg`;
    await new Promise((resolve, reject) => {
      const python = spawn("python3", [
        path.join(__dirname, "../services/imageProcessor.py"),
        file.path,
        outputPath,
      ]);
      python.stderr.on("data", (d) => console.error(d.toString()));
      python.on("close", (code) => (code === 0 ? resolve() : reject(new Error("Image processing failed"))));
    });

    // Upload processed image to Supabase Storage
    const fileBuffer = fs.readFileSync(outputPath);
    const fileName = `${userId}/${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(fileName, fileBuffer, { contentType: "image/jpeg" });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("photos").getPublicUrl(fileName);

    // 1 hour developing delay
    const revealAt = new Date(Date.now() + 60 * 60 * 1000);

    const { data: photo, error: dbError } = await supabase
      .from("photos")
      .insert([{
        user_id: userId,
        storage_url: urlData.publicUrl,
        status: "developing",
        reveal_at: revealAt.toISOString(),
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    fs.unlinkSync(file.path);
    fs.unlinkSync(outputPath);

    res.status(201).json({
      message: "Photo is developing!",
      photo_id: photo.id,
      reveal_at: revealAt,
      shots_remaining: 10 - (count + 1),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/photos/feed
router.get("/feed", authMiddleware, async (req, res) => {
  try {
    const { data: photos, error } = await supabase
      .from("photos")
      .select("id, storage_url, status, reveal_at, created_at, users(username)")
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json({ photos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/photos/my-shots
router.get("/my-shots", authMiddleware, async (req, res) => {
  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("photos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", req.user.id)
      .gte("created_at", weekStart.toISOString());

    res.json({ shots_used: count, shots_remaining: 10 - count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
