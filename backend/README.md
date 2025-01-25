API documentation:

fully stateless, passport local strategy with a jwt assigned on login

## authRouter.js

---

handles logging in and assigning the jwt

## chartRouter.js

---

## GETS

chartRouter.get("/", getTopChart);
returns a weighted average using bayesian formula for a top 25 chart.

## gamesRouter.js

---

## GETS

gamesRouter.get("/:gameID", getGame);
returns a specified Game model, containing all attributes

gamesRouter.get("/genres", getAllGenres);
returns a list of all genres

gamesRouter.get("/genres/:genreID", getGenreGames);
returns all games related to that genre

gamesRouter.get("/:gameID/rating", getUserRating);
returns user rating so they see they've rated it already

gamesRouter.get("/:gameID/rating", getUserReview);
returns user review so they can see their review

## POSTS

gamesRouter.post("/:gameID/rating", postRating);
allows the user to post a rating

gamesRouter.post("/:gameID/genretag", isUser, postGenreTag);
user can suggest a genre for a game

gamesRouter.post("/:gameID/genrevote", isUser, handleGenreVote);
user can vote yes or no on a genre tag

## PUTS

gamesRouter.put("/:gameID/rating", updateRating);
allows the user to update a rating

gamesRouter.put("/:gameID/review", createReview);
allows the user to post a review (MUST HAVE A RATING FIRST)

gamesRouter.put("/:gameID/review/edit", updateReview);
allows user to update their review

gamesRouter.put("/:gameID/genrevote", isUser, handleGenreVote);
user can change vote on genre tag

## DELETES

gamesRouter.put("/:gameID/review/delete", deleteReview);
allows user to delete their review, keeps their rating

## submitRouter.js

---

## GETS

submitRouter.get("/queue", isAdmin, getQueue);
fetches all tickets for new submissions and edits

## POSTS

submitRouter.post("/", isUser, postSubmitForm);
posting a new game ticket to the DB with false flag

submitRouter.post("/game/:gameID", isUser, editGameInfo);
sending edit request to the database

## PUTS

submitRouter.post("/queue/:gameID", isAdmin, approveGame);
approves a game submission

submitRouter.post("/queue/:editID", isAdmin, approveGameEdit);
approves a game edit

## DELETES

submitRouter.get("/queue/:ticketID", isAdmin, deleteTicket);
deletes a ticket in the queue

## adminRouter.js

---

WIP
