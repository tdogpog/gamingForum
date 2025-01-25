const { Router } = require("express");

const {
  getGame,
  getAllGenres,
  getGenreGames,
  postRating,
  updateRating,
  createReview,
  updateReview,
  getUserRating,
  getUserReview,
  deleteReview,
} = require("../controllers/gamesController");

const gamesRouter = Router();

//gets
gamesRouter.get("/:gameID", getGame);
gamesRouter.get("/genres", getAllGenres);
gamesRouter.get("/genres/:genreID", getGenreGames);
gamesRouter.get("/:gameID/rating", getUserRating);
gamesRouter.get("/:gameID/rating", getUserReview);

//posts
gamesRouter.post("/:gameID/rating", postRating);

//puts
gamesRouter.put("/:gameID/rating", updateRating);
gamesRouter.put("/:gameID/review", createReview);
gamesRouter.put("/:gameID/review/edit", updateReview);

//deletes
gamesRouter.put("/:gameID/review/delete", deleteReview);

module.exports = gamesRouter;
