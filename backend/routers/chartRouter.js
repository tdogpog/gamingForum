const { Router } = require("express");

const chartRouter = Router();

//landing page of sorts, show the top 25 games from the database by
//score and quantity of votes
//come up with some weighting
chartRouter.get("/", getTopChart); //all user viewable posts

module.exports = chartRouter;
