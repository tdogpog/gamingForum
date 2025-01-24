const { Router } = require("express");
const { isUser } = require("../util/isUser");

const {
  getUserProfile,
  getUserSettings,
  getUserFollowers,
  getUserFollowing,
  updateUserSettings,
  deleteUserAccount,
} = require("../controllers/userController");

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
