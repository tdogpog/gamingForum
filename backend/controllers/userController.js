const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getUserProfile(req, res) {
  try {
  } catch (error) {}
}
async function getUserSettings(req, res) {
  try {
  } catch (error) {}
}
async function getUserFollowers(req, res) {
  try {
  } catch (error) {}
}
async function getUserFollowing(req, res) {
  try {
  } catch (error) {}
}
async function updateUserSettings(req, res) {
  try {
  } catch (error) {}
}
async function deleteUserAccount(req, res) {
  try {
  } catch (error) {}
}

module.exports = {
  getUserProfile,
  getUserSettings,
  getUserFollowers,
  getUserFollowing,
  updateUserSettings,
  deleteUserAccount,
};

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
