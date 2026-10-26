import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import bcrypt from "bcrypt";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
      passReqToCallback: true, // 👈 Req object ke liye zaroori hai
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // 1. URL se role nikaalein (Student ya Teacher)
        let requestedRole = "student"; // Default

        if (req.query.state) {
          try {
            const stateData = JSON.parse(req.query.state);
            requestedRole = stateData.role || "student";
          } catch (e) {
            console.log("State parsing error, defaulting to student");
          }
        }

        // 2. Check karein ki user pehle se database mein hai ya nahi
        let user = await User.findOne({
          email: profile.emails[0].value.toLowerCase(),
        });

        if (!user) {
          // 3. Agar naya user hai, toh account banayein
          const randomPassword = Math.random().toString(36).slice(-8) + "A1!";
          const passwordHash = await bcrypt.hash(randomPassword, 12);

          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value.toLowerCase(),
            passwordHash,
            role: requestedRole, // 👈 Role yahan set ho raha hai
            status: requestedRole === "teacher" ? "pending" : "active", // 👈 Teacher ka status pending rahega
            emailVerified: true,
          });

          console.log(`✅ Naya user create hua: ${user.email} as ${user.role}`);
        } else {
          console.log(`✅ Purana user login hua: ${user.email}`);
        }

        // 4. User ko wapas bhejein
        return done(null, user);
      } catch (err) {
        console.error("❌ Passport Google Error:", err);
        return done(err, null);
      }
    },
  ),
);

// Session ke liye (chhota setup)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
