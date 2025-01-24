const { Router } = require("express");
const { isUser } = require("../util/isUser");

const {
  getUserProfile,
  createUser,
  updateUserSettings,
  deleteUserAccount,
} = require("../controllers/userController");

const userRouter = Router();

//gets
userRouter.get("/:username", isUser, getUserProfile);

//posts
userRouter.get("/", createUser);

//puts
userRouter.put("/settings", isUser, updateUserSettings);

//deletes
userRouter.delete("/settings/delete", isUser, deleteUserAccount);

module.exports = userRouter;
