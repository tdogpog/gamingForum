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
gamesRouter.get("/genres", getAllGenres); // show all genres in the database
gamesRouter.get("/genres/:genreID", getGenreGames); // show all games related to this genre
gamesRouter.get("/:slug/:gameID", getGame); //specific game and all its attributes
gamesRouter.get("/:slug/rating", isUser, getUserRating); //get the logged in users rating if exist
gamesRouter.get("/:slug/review", isUser, getUserReview); // get the logged in users review if exist

//posts
gamesRouter.post("/:slug/rating", isUser, postRating); //user can post rating
gamesRouter.post("/:slug/genretag", isUser, postGenreTag); //user can suggest a genre for a game
gamesRouter.post("/:slug/genrevote", isUser, handleGenreVote); //user can vote yes or no on a genre tag

//puts
gamesRouter.put("/:slug/rating", isUser, updateRating); //user can update rating
gamesRouter.put("/:slug/review", isUser, createReview); //user can create review
gamesRouter.put("/:slug/review/edit", isUser, updateReview); //user can update review
gamesRouter.put("/:slug/genrevote", isUser, handleGenreVote); //user can change vote on genre tag

//deletes
gamesRouter.delete("/:slug/review/delete", isUser, deleteReview); // user can delete review

module.exports = gamesRouter;
