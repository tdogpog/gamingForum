const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/////////////////////////HELPER FUNCS FOR AVG RATING, RATING COUNT, REVIEW COUNT

async function updateGameRatingStats(gameID) {
  const ratings = await prisma.rating.findMany({
    where: { gameID },
    select: { score: true },
  });

  const ratingCount = ratings.length;
  const avgRating =
    ratings.reduce((sum, rating) => sum + rating.score, 0) / ratingCount || 0;

  await prisma.game.update({
    where: { id: gameID },
    data: { ratingCount, avgRating },
  });
}

async function updateGameReviewCount(gameID) {
  const reviewCount = await prisma.review.count({
    where: { gameID },
  });

  await prisma.game.update({
    where: { id: gameID },
    data: { reviewCount },
  });
}

///////////////////////////////MAIN FUNCS

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
        ratings: {
          select: {
            score: true,
            createdAt: true,
            user: {
              select: {
                username: true,
              },
            },
          },
        },
        reviews: {
          select: {
            userID: true,
            title: true,
            content: true,
            createdAt: true,
            rating: {
              select: {
                score: true, //rating score from the associated rating model
              },
            },
            user: {
              select: {
                username: true, //username from the user model
              },
            },
          },
        },
        genres: {
          orderBy: {
            gameGenres: {
              upvoteCount: "desc", //sort genres by their upvoteCount in desc
            },
          },
          select: {
            id: true,
            name: true,
            gameGenres: {
              select: {
                upvoteCount: true,
                downvoteCount: true,
                totalVotes: true,
              },
            },
          },
        },
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

    await updateGameRatingStats(gameID);

    res.status(201).json(newRating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create rating." });
  }
}

async function updateRating(req, res) {
  const userID = req.user.id;
  const gameID = req.params.gameID;
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

    await updateGameRatingStats(gameID);

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
    const ratingWithReview = await prisma.rating.findUnique({
      where: {
        userID_gameID: {
          userID,
          gameID,
        },
      },
      include: {
        review: true, //review if it exists
      },
    });

    //force a rating first
    if (!ratingWithReview) {
      return res.status(400).json({
        message: "You must first rate the game before submitting a review.",
      });
    }

    //stop a double submit
    if (ratingWithReview.review) {
      return res.status(400).json({
        message: "You have already submitted a review for this game.",
      });
    }

    //new review linked to the rating
    const newReview = await prisma.review.create({
      data: {
        userID,
        gameID: gameID,
        ratingID: ratingWithReview.id,
        title,
        content,
      },
    });

    await updateGameReviewCount(gameID);

    res.status(201).json(newReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create review." });
  }
}

async function updateReview(req, res) {
  const userID = req.user.id;
  const gameID = req.params.gameID;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required." });
  }

  try {
    const rating = await prisma.rating.findUnique({
      where: { userID_gameID: { userID, gameID } },
    });

    if (!rating) {
      return res
        .status(404)
        .json({ message: "No rating found for this game." });
    }

    const updatedReview = await prisma.review.update({
      where: { ratingID: rating.id },
      data: { title, content },
    });

    res.status(200).json(updatedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update review." });
  }
}

async function getUserRating(req, res) {
  const userID = req.user.id;
  const gameID = req.params.gameID;

  try {
    //find the user's existing rating for the game
    const userRating = await prisma.rating.findUnique({
      where: { userID_gameID: { userID, gameID } },
    });

    if (!userRating) {
      return res.json({ rating: null });
    }

    res.status(200).json(userRating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch the rating." });
  }
}

async function getUserReview(req, res) {
  const userID = req.user.id;
  const gameID = req.params.gameID;

  try {
    //find the user's review for the specified game
    const userReview = await prisma.review.findUnique({
      where: {
        userID_gameID: { userID, gameID },
      },
    });

    if (!userReview) {
      return res.json({ review: null });
    }

    res.status(200).json(userReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch the review." });
  }
}

async function deleteReview(req, res) {
  const userID = req.user.id;
  const gameID = req.params.gameID;

  try {
    //check if the review exists
    const existingReview = await prisma.review.findUnique({
      where: {
        userID_gameID: { userID, gameID },
      },
    });

    if (!existingReview) {
      return res
        .status(404)
        .json({ message: "Review not found for this game." });
    }

    //delete the review
    await prisma.review.delete({
      where: {
        id: existingReview.id,
      },
    });

    await updateGameReviewCount(gameID);

    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete the review." });
  }
}

async function postGenreTag(req, res) {
  const gameID = req.params.gameID;
  const genreName = req.body;
  const userID = req.user.id;

  try {
    // failsafe, make sure the genre exists
    const genre = await prisma.genre.findUnique({
      where: { genreName: genreName },
    });

    if (!genre) {
      return res
        .status(404)
        .json({ message: "Selected genre does not exist." });
    }

    const genreID = genre.id;

    // failsafe, make sure the genre isnt picked yet
    const existingTag = await prisma.gameGenre.findUnique({
      where: {
        gameID_genreID: { gameID, genreID },
      },
    });

    if (existingTag) {
      return res
        .status(400)
        .json({ message: "This genre has already been tagged for this game." });
    }

    //add the genre tag to the game
    await prisma.gameGenre.create({
      data: {
        gameID: gameID,
        genreID,
        upvoteCount: 1, //count this user's suggestion as an upvote
        totalVotes: 1,
      },
    });

    //user's vote for this genre suggestion tallied on their personal sheet
    await prisma.genreVote.create({
      data: {
        userID,
        gameID: gameID,
        genreID,
        voteValue: true,
      },
    });

    return res.status(201).json({ message: "Genre tag added successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to add genre tag." });
  }
}

async function handleGenreVote(req, res) {
  const { gameID } = req.params;
  const { genreName, voteValue } = req.body; // true (upvote) or false (downvote)
  const userID = req.user.id;

  try {
    //get the genreID since i'm expecting to work this sectinon just by names
    const genre = await prisma.genre.findUnique({
      where: { name: genreName },
    });

    if (!genre) {
      return res.status(404).json({ message: "Genre not found." });
    }

    const genreID = genre.id;

    //check if the user has already voted for this genre
    const existingVote = await prisma.genreVote.findUnique({
      where: {
        userID_gameID_genreID: {
          userID,
          gameID: gameID,
          genreID,
        },
      },
    });

    //update the existing vote
    if (existingVote) {
      const previousVoteValue = existingVote.voteValue;

      //adjust user vote in personal data
      await prisma.gameGenre.update({
        where: {
          gameID_genreID: {
            gameID: gameID,
            genreID,
          },
        },
        data: {
          upvoteCount: {
            increment:
              voteValue === true ? 1 : previousVoteValue === true ? -1 : 0,
          },
          downvoteCount: {
            increment:
              voteValue === false ? 1 : previousVoteValue === false ? -1 : 0,
          },
        },
      });

      //update the user's vote record
      await prisma.genreVote.update({
        where: {
          userID_gameID_genreID: {
            userID,
            gameID: gameID,
            genreID,
          },
        },
        data: { voteValue },
      });

      return res.status(200).json({ message: "Vote updated successfully." });
    } else {
      //create a new vote
      await prisma.genreVote.create({
        data: {
          userID,
          gameID: gameID,
          genreID,
          voteValue,
        },
      });

      //adjust user vote in personal data
      await prisma.gameGenre.update({
        where: {
          gameID_genreID: {
            gameID: gameID,
            genreID,
          },
        },
        data: {
          upvoteCount: { increment: voteValue ? 1 : 0 },
          downvoteCount: { increment: voteValue ? 0 : 1 },
          totalVotes: { increment: 1 },
        },
      });

      return res.status(201).json({ message: "Vote added successfully." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to handle vote." });
  }
}

module.exports = {
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
};
