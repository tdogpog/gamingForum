const { Router } = require("express");
const { isUser } = require("../util/isUser");
const userRouter = Router();

module.exports = adminRouter;

// website.com / user;
// website.com / user / userName;
// website.com / user / userName / settings;
// website.com / user / userName / followers;
// website.com / user / userName / following;
