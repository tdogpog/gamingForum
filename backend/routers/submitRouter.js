const { Router } = require("express");
const { isUser } = require("../util/isUser");

const submitRouter = Router();

//gets

//posts
submitRouter.post("/", isUser, postSubmitForm);

//puts
submitRouter.put("/game/:gameID", isUser, editGameInfo);

//deletes

module.exports = submitRouter;
