const { Router } = require("express");

const { getTopChart } = require("../controllers/chartController");

const chartRouter = Router();

//landing page of sorts, show the top 25 games from the database by
//score and quantity of votes
//come up with some weighting

//gets
chartRouter.get("/", getTopChart); //all user viewable posts
//posts

//puts

//deletes

module.exports = chartRouter;
