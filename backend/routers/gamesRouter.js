const { Router } = require("express");

const gamesRouter = Router();
//gets
gamesRouter.get("/:gameID", getGame);
gamesRouter.get("/genres", getAllGenres);
gamesRouter.get("/genres/:genreType", getGenre);

//posts

//puts

//deletes
module.exports = gamesRouter;

// website.com / games;
// website.com / games / gameID;
// website.com / games / genres;
// website.com / games / genres / genreType;
