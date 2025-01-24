const { Router } = require("express");
const { isUser } = require("../util/isUser");
const { isAdmin } = require("../util/isAdmin");

const {
  getQueue,
  postSubmitForm,
  editGameInfo,
} = require("../controllers/submitController");

const submitRouter = Router();

//gets
submitRouter.get("/queue", isAdmin, getQueue); //fetches all waiting edits and and new game submissions

//posts
submitRouter.post("/", isUser, postSubmitForm);

//puts
submitRouter.put("/game/:gameID", isUser, editGameInfo);

//deletes

module.exports = submitRouter;
