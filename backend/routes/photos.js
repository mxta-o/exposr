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
  process.env.SUPABASE_KEY
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
    // EXIF timestamp check — must be taken within 5 minutes
    const exif = await exifr.parse(file.path);
    if (exif?.DateTimeOriginal) {
      const diffMinutes = (new Date() - new Date(exif.DateTimeOriginal)) / 60000;
      if (diffMinutes > 5) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: "Photo must be taken within the last 5 minutes" });
      }
    }

    // Count shots this week for the blind counter (no limits enforced)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const { count: weekCount } = await supabase
      .from("photos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", weekStart.toISOString());

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

    res.status(201).json({
      message: "Shot taken! Develops Sunday at midnight.",
      photo_id: photo.id,
      reveal_at: revealAt,
      shots_this_week: weekCount + 1,
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

// GET /api/photos/developing
router.get("/developing", authMiddleware, async (req, res) => {
  try {
    const { data: photos, error } = await supabase
      .from("photos")
      .select("id, storage_url, status, reveal_at, created_at")
      .eq("user_id", req.user.id)
      .eq("status", "developing")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json({ photos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/photos/list/:userId
router.get("/list/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // List files in the photos/{userId} folder
    const { data: files, error } = await supabase
      .storage
      .from("photos")
      .list(userId);

    if (error) throw error;

    // Generate public URLs for each file
    const photos = files
      .filter((f) => !f.name.startsWith('.'))
      .map((file) => {
        const publicUrl = supabase
          .storage
          .from("photos")
          .getPublicUrl(`${userId}/${file.name}`);

        return {
          id: file.id,
          name: file.name,
          url: publicUrl.data.publicUrl,
          updated_at: file.updated_at,
        };
      });

    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
