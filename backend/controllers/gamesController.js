const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getGame(req, res) {
  try {
    const gameID = req.params.gameID;

    if (!gameID) {
      return res.status(400).json({ error: "Invalid or missing game ID" });
    }

    const game = await prisma.game.findUnique({
      where: { id: gameID },
      select: {
        title: true,
        releaseDate: true,
        coverImage: true,
        developer: true,
        avgRating: true,
        reviewCount: true,
        ratingCount: true,
        ratings: true,
        reviews: true,
        genres: true,
      },
    });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.status(200).json(game);
  } catch (error) {
    console.error("Error fetching game:", error.message); // Log the error
    res.status(500).json({ error: "Internal server error" }); // Handle server error
  }
}

async function getAllGenres(req, res) {
  try {
    const genres = await prisma.genre.findMany();

    if (!genres || genres.length === 0) {
      return res.status(404).json({ error: "Genres not found" });
    }

    res.status(200).json(genres);
  } catch (error) {
    console.error("Error fetching genres:", error.message); // Log the error for debugging
    res.status(500).json({ error: "Internal server error" }); // Return generic server error
  }
}

async function getGenreGames(req, res) {
  try {
    const genreID = req.params.genreID;

    if (!genreID) {
      return res.status(400).json({ error: "Invalid or missing genre ID" });
    }

    const genreGames = await prisma.gameGenre.findMany({
      where: {
        genreID: genreID,
        game: {
          approved: true, // only include games that are approved
        },
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            releaseDate: true,
            coverImage: true,
            developer: true,
            avgRating: true,
            approved: true,
          },
        },
      },
    });

    if (!genreGames || genreGames.length === 0) {
      return res.status(404).json({ error: "No games found for this genre" });
    }

    // rip the gameGenre contents off and leave just the game:true details
    const gameDetails = genreGames.map((index) => index.game);

    res.status(200).json(gameDetails);
  } catch (error) {
    console.error("Error fetching games by genre:", error.message); // Log the error
    res.status(500).json({ error: "Internal server error" }); // Handle server error
  }
}

async function postRating(req, res) {
  const userID = req.user.id;
  const gameID = req.params.gameID;
  const { score } = req.body;

  try {
    //check if a rating already exists
    //use a composite key to enforce uniqueness
    const existingRating = await prisma.rating.findUnique({
      where: { userID_gameID: { userID, gameID: gameID } },
    });

    if (existingRating) {
      return res
        .status(400)
        .json({ message: "You have already rated this game." });
    }

    // Create the new rating
    const newRating = await prisma.rating.create({
      data: {
        userID,
        gameID: gameID,
        score,
      },
    });

    res.status(201).json(newRating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create rating." });
  }
}

async function updateRating(req, res) {
  const userID = req.user.id;
  const { gameID } = req.params.gameID;
  const { score } = req.body;

  try {
    //find existing rating
    const existingRating = await prisma.rating.findUnique({
      where: { userID_gameID: { userID, gameID: gameID } },
    });

    if (!existingRating) {
      return res
        .status(404)
        .json({ message: "Rating not found for this game." });
    }

    // Update the rating score
    const updatedRating = await prisma.rating.update({
      where: { id: existingRating.id },
      data: { score },
    });

    res.status(200).json(updatedRating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update rating." });
  }
}

async function createReview(req, res) {
  const userID = req.user.id;
  const gameID = req.params.gameID;
  const { title, content } = req.body;

  if (!title || !content) {
    return res
      .status(404)
      .json({ message: "Title and content must be filled." });
  }

  try {
    const existingReview = await prisma.review.findUnique({
      where: { ratingID: existingRating.id },
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already submitted a review for this game.",
      });
    }

    //new review linked to the rating
    const newReview = await prisma.review.create({
      data: {
        userID,
        gameID: gameID,
        ratingID: existingRating.id,
        title,
        content,
      },
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create review." });
  }
}

module.exports = {
  getGame,
  getAllGenres,
  getGenreGames,
  postRating,
  updateRating,
  createReview,
};
