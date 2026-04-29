const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const authMiddleware = require("../middleware/authMiddleware");

dotenv.config();

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// POST /api/users/follow/:userId
router.post("/follow/:userId", authMiddleware, async (req, res) => {
  const followerId = req.user.id;
  const followingId = req.params.userId;

  if (followerId === followingId) {
    return res.status(400).json({ error: "You cannot follow yourself" });
  }

  try {
    const { error } = await supabase
      .from("follows")
      .insert([{ follower_id: followerId, following_id: followingId }]);

    if (error) {
      if (error.code === "23505") return res.status(400).json({ error: "Already following" });
      throw error;
    }
    res.json({ following: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/unfollow/:userId
router.delete("/unfollow/:userId", authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", req.user.id)
      .eq("following_id", req.params.userId);

    if (error) throw error;
    res.json({ following: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/friends — mutual follows only
router.get("/friends", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    // People I follow
    const { data: iFollow } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);

    // People who follow me
    const { data: followMe } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("following_id", userId);

    const iFollowIds = new Set((iFollow || []).map((r) => r.following_id));
    const followMeIds = new Set((followMe || []).map((r) => r.follower_id));

    // Intersection = mutuals
    const mutualIds = [...iFollowIds].filter((id) => followMeIds.has(id));

    if (mutualIds.length === 0) return res.json({ friends: [] });

    const { data: friends, error } = await supabase
      .from("users")
      .select("id, username")
      .in("id", mutualIds);

    if (error) throw error;
    res.json({ friends });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/search?q=username — find people to follow
router.get("/search", authMiddleware, async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: "Search query must be at least 2 characters" });
  }
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, username")
      .ilike("username", `%${q}%`)
      .neq("id", req.user.id)
      .limit(20);

    if (error) throw error;
    res.json({ users: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:userId/photos — a user's developed photos (their album/profile)
router.get("/:userId/photos", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("photos")
      .select("id, storage_url, created_at")
      .eq("user_id", req.params.userId)
      .eq("status", "ready")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json({ photos: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
