const { Router } = require("express");

const {
  getGame,
  getAllGenres,
  getGenreGames,
} = require("../controllers/gamesController");

const gamesRouter = Router();

//gets
gamesRouter.get("/:gameID", getGame);
gamesRouter.get("/genres", getAllGenres);
gamesRouter.get("/genres/:genreID", getGenreGames);

//posts

//puts

//deletes

module.exports = gamesRouter;
