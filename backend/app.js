//overarching imports
const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "./.env" });
//passport
const passport = require("passport");
const { passportConfig } = require("./util/passportConfig");
//routers
const authRouter = require("./routers/authRouter");
const chartRouter = require("./routers/chartRouter");
const gamesRouter = require("./routers/gamesRouter");
const userRouter = require("./routers/userRouter");
const submitRouter = require("./routers/submitRouter");
const adminRouter = require("./routers/adminRouter");

//app start
const app = express();

//general middleware

//serve static assets for user profile pictures and splash arts
//the multer needs this to render from these respective directories
//when the front end requests images
app.use(
  "/uploads/profile_pictures",
  express.static("uploads/profile_pictures")
);
app.use("/uploads/coverImage", express.static("uploads/coverImage"));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// passport config
passportConfig(passport);

//routers
app.use("/auth", authRouter); //just for logging in and assigning jwt
app.use("/charts", chartRouter); //renders charts
app.use("/games", gamesRouter); //renders a single game, contains genre
app.use("/user", userRouter); //user specific info
app.use("/submit", submitRouter); //submitting or editing a new game
app.use("/admin", adminRouter); //admin only permissions

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Launched in port: ${port}`);
});
