const { Router } = require("express");
const { isUser } = require("../util/isUser");

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
  postGenreTag,
  handleGenreVote,
} = require("../controllers/gamesController");

const gamesRouter = Router();

//gets
gamesRouter.get("/:gameID", getGame); //specific game and all its attributes
gamesRouter.get("/genres", getAllGenres); // show all genres in the database
gamesRouter.get("/genres/:genreID", getGenreGames); // show all games related to this genre
gamesRouter.get("/:gameID/rating", isUser, getUserRating); //get the logged in users rating if exist
gamesRouter.get("/:gameID/rating", isUser, getUserReview); // get the logged in users review if exist

//posts
gamesRouter.post("/:gameID/rating", isUser, postRating); //user can post rating
gamesRouter.post("/:gameID/genretag", isUser, postGenreTag); //user can suggest a genre for a game
gamesRouter.post("/:gameID/genrevote", isUser, handleGenreVote); //user can vote yes or no on a genre tag

//puts
gamesRouter.put("/:gameID/rating", isUser, updateRating); //user can update rating
gamesRouter.put("/:gameID/review", isUser, createReview); //user can create review
gamesRouter.put("/:gameID/review/edit", isUser, updateReview); //user can update review
gamesRouter.put("/:gameID/genrevote", isUser, handleGenreVote); //user can change vote on genre tag

//deletes
gamesRouter.delete("/:gameID/review/delete", isUser, deleteReview); // user can delete review

module.exports = gamesRouter;

//need a fetch for all genretagged games
