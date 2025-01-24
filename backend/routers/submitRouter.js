const { Router } = require("express");
const { isUser } = require("../util/isUser");
const { isAdmin } = require("../util/isAdmin");

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
submitRouter.post("/", isUser, postSubmitForm); //posting a new game ticket to the DB with false flag
submitRouter.post("/game/:gameID", isUser, editGameInfo);

//puts
submitRouter.post("/queue/:gameID", isAdmin, approveGame); //approves a game submission
submitRouter.post("/queue/:editID", isAdmin, approveGameEdit); //approves a game edit

//deletes
submitRouter.get("/queue/:ticketID", isAdmin, deleteTicket);

module.exports = submitRouter;
