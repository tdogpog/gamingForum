const { Router } = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const authRouter = Router();

authRouter.post("/login", (req, res, next) => {
  // Authenticate with passport-local strategy
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res
        .status(403)
        .json({ message: info?.message || "Incorrect username or password" });
    }

    //  jwt for all users (including role in the payload)
    // decode this in frontend and parse for role for conditional rendering
    // also chained in header for auth to restricted routes
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role, // USER, ADMIN, MOD
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Login successful",
      token, // Send the JWT
      user: { id: user.id, username: user.username, role: user.role },
    });
  })(req, res, next);
});

module.exports = authRouter;
