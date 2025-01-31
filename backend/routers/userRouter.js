const { Router } = require("express");
const { isUser } = require("../util/isUser");
const multer = require("multer");

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  dest: "uploads/profile_pictures", //save files in the "uploads/profile_pictures" folder
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = /jpeg|jpg|png/;
    const mimeType = allowedMimeTypes.test(file.mimetype);

    if (mimeType) {
      //file type is allowed, pass 'true' to the callback
      cb(null, true);
    } else {
      //file type is not allowed, pass an error message
      cb(new Error("Only jpg, jpeg, and png files are allowed"));
    }
  },
});

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
//upload.single(arg) arg must match front end for ex <input type="file" name="arg" />
userRouter.get("/", upload.single("profile_picture"), createUser);

//puts
userRouter.put(
  "/settings",
  isUser,
  upload.single("profile_picture"),
  updateUserSettings
);

//deletes
userRouter.delete("/settings/delete", isUser, deleteUserAccount);

module.exports = userRouter;
