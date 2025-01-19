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
const genresRouter = require("./routers/genresRouter");
const userRouter = require("./routers/userRouter");

//app start
const app = express();

//general middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// passport config
passportConfig(passport);

//routers
app.use("/auth", authRouter);
app.use("/charts", chartRouter);
app.use("/genres", genresRouter);
app.use("/user", userRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Launched in port: ${port}`);
});
