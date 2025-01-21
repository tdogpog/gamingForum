const { Router } = require("express");
const { isAdmin } = require("../util/isAdmin");

const adminRouter = Router();
module.exports = chartRouter;

// website.com / admin;
// website.com / admin / deleteComment;
// website.com / admin / deleteEntry;
// website.com / admin / deleteReview;
// website.com / admin / deleteAccount;
