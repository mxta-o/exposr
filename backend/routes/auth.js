const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();
const supabase = createClient(
    process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
  
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insert new user
      const { data: newUser, error } = await supabase
        .from("users")
        .insert([{ username, email, password_hash: hashedPassword }])
        .select()
        .single();
  
      if (error) throw error;
  
      // Generate JWT
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
  
      res.status(201).json({ token, user: { id: newUser.id, username, email } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/auth/login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find user
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
  
      if (error || !user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
  
      // Check password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
  
      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
  
      res.json({ token, user: { id: user.id, username: user.username, email } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // GET /api/auth/me
  router.get("/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { data: user, error } = await supabase
        .from("users")
        .select("id, username, email")
        .eq("id", decoded.id)
        .single();

      if (error || !user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user });
    } catch (err) {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  });

  module.exports = router;

  