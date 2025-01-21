const { Router } = require("express");
const { isUser } = require("../util/isUser");

const submitRouter = Router();

//gets
submitRouter.get("/game", getSubmitForm);

//puts
submitRouter.put("/game/:gameID", editGameInfo);

//posts
submitRouter.post("/", postSubmitForm);

//deletes

module.exports = gamesRouter;
