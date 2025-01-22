const { Router } = require("express");
const { isUser } = require("../util/isUser");
const userRouter = Router();

//gets
userRouter.get("/:username", isUser, getUserProfile);
userRouter.get("/settings", isUser, getUserSettings);
userRouter.get("/followers", isUser, getUserFollowers);
userRouter.get("/following", isUser, getUserFollowing);

//posts

//puts
userRouter.put("/settings", isUser, updateUserSettings);

//deletes
userRouter.delete("/settings/delete", isUser, deleteUserAccount);

module.exports = userRouter;

// website.com / user;
// website.com / user / userName;
// website.com / user / settings;
// website.com / user / followers;
// website.com / user /  following;
