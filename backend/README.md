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
returns a specific game

gamesRouter.get("/genres", getAllGenres);
returns a list of all genres

gamesRouter.get("/genres/:genreID", getGenreGames);
returns all games related to that genre

## POSTS

gamesRouter.post("/:gameID/rating", postRating);
allows the user to post a rating

## PUTS

gamesRouter.put("/:gameID/rating", updateRating);
allows the user to update a rating

gamesRouter.put("/:gameID/review", createReview);
allows the user to post a review (MUST HAVE A RATING FIRST)

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
