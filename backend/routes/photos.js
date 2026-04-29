const express = require("express");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const { spawn } = require("child_process");
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

// Returns the coming Sunday at 23:59:59 — the weekly drop time
function getWeeklyRevealTime() {
  const now = new Date();
  const daysUntilSunday = now.getDay() === 0 ? 0 : 7 - now.getDay();
  const reveal = new Date(now);
  reveal.setDate(now.getDate() + daysUntilSunday);
  reveal.setHours(23, 59, 59, 999);
  return reveal;
}

// POST /api/photos/upload
router.post("/upload", authMiddleware, upload.single("photo"), async (req, res) => {
  const userId = req.user.id;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No photo provided" });

  try {
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

    // Weekly drop — all photos develop together on Sunday at 23:59:59
    const revealAt = getWeeklyRevealTime();

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

    // Count shots taken this week (for the blind counter)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("photos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", weekStart.toISOString());

    res.status(201).json({
      message: "Shot taken! Develops Sunday at midnight.",
      photo_id: photo.id,
      reveal_at: revealAt,
      shots_this_week: count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/photos/feed — only ready photos, randomized
router.get("/feed", authMiddleware, async (req, res) => {
  try {
    const { data: photos, error } = await supabase
      .from("photos")
      .select("id, storage_url, status, reveal_at, created_at, users(id, username)")
      .eq("status", "ready")
      .limit(100);

    if (error) throw error;

    // Randomize order — no popularity contest
    const shuffled = [...(photos || [])].sort(() => Math.random() - 0.5);
    res.json({ photos: shuffled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/photos/my-shots — blind counter: how many shots taken this week
router.get("/my-shots", authMiddleware, async (req, res) => {
  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("photos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", req.user.id)
      .gte("created_at", weekStart.toISOString());

    const revealAt = getWeeklyRevealTime();

    res.json({
      shots_this_week: count,
      next_drop: revealAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
