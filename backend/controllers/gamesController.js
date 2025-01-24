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

module.exports = { getGame, getAllGenres, getGenreGames };
