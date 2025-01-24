const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getTopChart(req, res) {
  try {
    const games = await prisma.game.findMany({
      where: { approved: true },
      select: {
        id: true,
        title: true,
        coverImage: true,
        developer: true,
        avgRating: true,
        reviewCount: true,
      },
    });

    //bayesian formula constants
    const globalAvgRating = 4.0; //global average rating
    const minReviews = 50; //review threshold

    //weighted average for each game
    const rankedGames = games.map((game) => {
      const { avgRating, reviewCount } = game;

      //bayesian weighted average
      const weightedAverage =
        (reviewCount * avgRating + minReviews * globalAvgRating) /
        (reviewCount + minReviews);

      //spread the obj and add on the weightedavg
      return { ...game, weightedAverage };
    });

    const top25Games = rankedGames
      .sort((a, b) => b.weightedAverage - a.weightedAverage) //comparison function for descending order
      .slice(0, 25);

    res.status(200).json(top25Games);
  } catch (error) {
    console.error("Error fetching top chart:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the top chart" });
  }
}

module.exports = { getTopChart };
