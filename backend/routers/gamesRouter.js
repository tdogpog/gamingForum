const { Router } = require("express");
const { isUser } = require("../util/isUser");

const gamesRouter = Router();
//gets
gamesRouter.get("/:gameID", getGame);
gamesRouter.get("/genres", getAllGenres);
gamesRouter.get("/genres/:genreType", getGenre);

//puts
//posts
//deletes
module.exports = gamesRouter;

// website.com / games;
// website.com / games / gameID;
// website.com / games / genres;
// website.com / games / genres / genreType;
