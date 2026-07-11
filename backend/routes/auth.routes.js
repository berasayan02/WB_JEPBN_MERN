const express = require("express");
const passport = require("passport");
const { register, login, getMe, googleCallback } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Local email/password auth
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

// Google OAuth 2.0
// Step 1: Frontend links/redirects the browser here.
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// Step 2: Google redirects back here after the user grants consent.
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
  }),
  googleCallback
);

module.exports = router;
