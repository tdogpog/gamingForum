const { Router } = require("express");

//landing page of sorts, show the top 25 games from the database by
//score and quantity of votes
//come up with some weighting
chartRouter.get("/", getTopChart); //all user viewable posts

module.exports = chartRouter;

//landing page on react
//will just discuss website ,see the rankings will redirect here
