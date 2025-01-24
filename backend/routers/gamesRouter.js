const { Router } = require("express");

const {
  getGame,
  getAllGenres,
  getGenreGames,
  postRating,
  updateRating,
  createReview,
} = require("../controllers/gamesController");

const gamesRouter = Router();

//gets
gamesRouter.get("/:gameID", getGame);
gamesRouter.get("/genres", getAllGenres);
gamesRouter.get("/genres/:genreID", getGenreGames);

//posts
gamesRouter.post("/:gameID/rating", postRating);

//puts
gamesRouter.put("/:gameID/rating", updateRating);
gamesRouter.put("/:gameID/review", createReview);

//deletes

module.exports = gamesRouter;
