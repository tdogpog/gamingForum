const { Router } = require("express");
const { isAdmin } = require("../util/isAdmin");

//gets

//posts

//puts

//deletes
adminRouter.delete("/deleteComment/:commentId", isAdmin, deleteComment);
adminRouter.delete("/deleteEntry/:entryId", isAdmin, deleteEntry);
adminRouter.delete("/deleteReview/:reviewId", isAdmin, deleteReview);
adminRouter.delete("/deleteAccount/:userId", isAdmin, deleteAccount);

const adminRouter = Router();
module.exports = adminRouter;
