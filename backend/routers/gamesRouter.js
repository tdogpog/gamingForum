const { Router } = require("express");
const { isUser } = require("../util/isUser");

const {
  getGame,
  getAllParentGenres,
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
gamesRouter.get("/genres", getAllParentGenres); // show all genres in the database
gamesRouter.get("/genres/:genreSlug", getGenreGames); // show all games related to this genre
gamesRouter.get("/:gameSlug/rating", isUser, getUserRating); //get the logged in users rating if exist
gamesRouter.get("/:gameSlug/review", isUser, getUserReview); // get the logged in users review if exist
gamesRouter.get("/:gameSlug", getGame); //specific game and all its attributes

//posts
gamesRouter.post("/:gameSlug/rating", isUser, postRating); //user can post rating
gamesRouter.post("/:gameSlug/genretag", isUser, postGenreTag); //user can suggest a genre for a game
gamesRouter.post("/:gameSlug/genrevote", isUser, handleGenreVote); //user can vote yes or no on a genre tag
gamesRouter.post("/:gameSlug/review", isUser, createReview); //user can create review

//puts
gamesRouter.put("/:gameSlug/rating", isUser, updateRating); //user can update rating
gamesRouter.put("/:gameSlug/review", isUser, updateReview); //user can update review
gamesRouter.put("/:gameSlug/genrevote", isUser, handleGenreVote); //user can change vote on genre tag

//deletes
gamesRouter.delete("/:gameSlug/review", isUser, deleteReview); // user can delete review

module.exports = gamesRouter;
