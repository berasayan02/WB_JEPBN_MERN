const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// Passport is used here ONLY to drive the Google OAuth handshake.
// We do NOT use passport sessions — once Google auth succeeds we issue our
// own JWT (see controllers/auth.controller.js -> googleCallback), so the
// rest of the app (including every other route) stays fully stateless.
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (!email) {
          return done(new Error("Google account has no email"), null);
        }

        // 1. Try to find a user already linked to this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // 2. Otherwise, check if a local account with the same email exists
          user = await User.findOne({ email });

          if (user) {
            // Link the existing local account to Google
            user.googleId = profile.id;
            user.authProvider = "google";
            if (!user.avatar && profile.photos && profile.photos[0]) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
          } else {
            // 3. Brand new user signing up via Google
            user = await User.create({
              name: profile.displayName || "Google User",
              email,
              googleId: profile.id,
              authProvider: "google",
              avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : "",
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
