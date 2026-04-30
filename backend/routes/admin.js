const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const { moderatePhoto } = require("../services/aiModeration");
const authMiddleware = require("../middleware/authMiddleware");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// POST /api/admin/report/:photoId
router.post("/report/:photoId", authMiddleware, async (req, res) => {
  const { photoId } = req.params;
  const { reason } = req.body;
  const reportedBy = req.user.id;

  try {
    const { data: photo, error: photoError } = await supabase
      .from("photos")
      .select("storage_url")
      .eq("id", photoId)
      .single();

    if (photoError || !photo) return res.status(404).json({ error: "Photo not found" });

    // Run AI moderation
    const modResult = await moderatePhoto(photo.storage_url, reason || "Reported by user");

    // Save report
    const { error: reportError } = await supabase.from("reports").insert([{
      photo_id: photoId,
      reported_by: reportedBy,
      reason,
      ai_flag: modResult.flagged,
      ai_reason: modResult.reason,
    }]);

    if (reportError) throw reportError;

    // Auto-flag photo if AI agrees
    if (modResult.flagged) {
      await supabase.from("photos").update({ status: "flagged" }).eq("id", photoId);
    }

    res.json({ reported: true, ai_flagged: modResult.flagged, ai_reason: modResult.reason });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/flagged
router.get("/flagged", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("reports")
      .select("id, photo_id, reason, ai_flag, ai_reason, created_at, photos(storage_url, status)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json({ reports: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
