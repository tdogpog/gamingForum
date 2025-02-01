const { Router } = require("express");
const { isUser } = require("../util/isUser");
const { isAdmin } = require("../util/isAdmin");
const multer = require("multer");

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  dest: "uploads/coverImage", //save files in the "uploads/coverImage" folder
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
  getQueue,
  postSubmitForm,
  editGameInfo,
  approveGame,
  approveGameEdit,
  deleteTicket,
} = require("../controllers/submitController");

const submitRouter = Router();

//gets
submitRouter.get("/queue", isAdmin, getQueue); //fetches all waiting edits and and new game submissions

//posts
submitRouter.post("/", isUser, upload.single("coverImage"), postSubmitForm); //posting a new game ticket to the DB with false flag
submitRouter.post(
  "/game/:gameID",
  isUser,
  upload.single("coverImage"),
  editGameInfo
); // ticket for updating a games informaiton

//puts
submitRouter.post("/queue/:gameID", isAdmin, approveGame); //approves a game submission
submitRouter.post("/queue/:editID", isAdmin, approveGameEdit); //approves a game edit

//deletes
submitRouter.get("/queue/:ticketID", isAdmin, deleteTicket);

module.exports = submitRouter;
