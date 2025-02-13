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
    const gameSlug = req.params.gameSlug;

    if (!gameSlug) {
      return res.status(400).json({ error: "Invalid or missing game ID" });
    }

    const game = await prisma.game.findUnique({
      where: { slug: gameSlug },
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
          orderBy: { createdAt: "desc" }, // Order by timestamp descending
        },
        reviews: {
          select: {
            title: true,
            content: true,
            createdAt: true,
            rating: {
              select: {
                score: true,
              },
            },
            user: {
              select: {
                username: true,
              },
            },
          },
          orderBy: { createdAt: "desc" }, // Chronological order for reviews
        },
        genres: {
          select: {
            genre: {
              select: {
                genreName: true,
                slug: true,
              },
            },
            upvoteCount: true,
            downvoteCount: true,
            totalVotes: true,
          },
        },
      },
    });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    if (game) {
      game.genres.sort((a, b) => b.upvoteCount - a.upvoteCount); // Sorting by upvotes
    }

    res.status(200).json(game);
  } catch (error) {
    console.error("Error fetching game:", error.message); // Log the error
    res.status(500).json({ error: "Internal server error" }); // Handle server error
  }
}

async function getAllParentGenres(req, res) {
  try {
    const genres = await prisma.genre.findMany({
      where: {
        parentGenre: null,
        genreName: {
          notIn: ["Game Type", "Descriptors", "Themes"],
        },
      },
      orderBy: {
        genreName: "asc",
      },
      include: {
        _count: {
          select: { subgenres: true }, // Count children (subgenres)
        },
      },
    });

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
    const genreSlug = req.params.genreSlug;

    if (!genreSlug) {
      return res.status(400).json({ error: "Invalid or missing genre ID" });
    }

    //turn the slug into an id from the params
    //our gamegenres table is built on ID relations
    const genre = await prisma.genre.findUnique({
      where: { slug: genreSlug },
      include: {
        parent: {
          select: { slug: true, genreName: true }, // Fetch only the slug and name of the parent
        },
        subgenres: true, // Fetch subgenres for sidebar navigation
      },
    });

    if (!genre) {
      return res.status(404).json({ error: "Genre not found" });
    }

    const genreIDArray = [genre.id, ...genre.subgenres.map((genr) => genr.id)];

    const genreGames = await prisma.game.findMany({
      where: {
        genres: {
          some: {
            genreID: { in: genreIDArray },
          },
        },
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    if (!genreGames || genreGames.length === 0) {
      return res.status(200).json({ genre, genreGames: [] });
    }

    res.status(200).json({ genre, genreGames });
  } catch (error) {
    console.error("Error fetching games by genre:", error.message); // Log the error
    res.status(500).json({ error: "Internal server error" }); // Handle server error
  }
}

async function postRating(req, res) {
  const userID = req.user.id;
  const gameSlug = req.params.gameSlug;
  const { score } = req.body;

  try {
    const game = await prisma.game.findUnique({ where: { slug: gameSlug } });

    //check if a rating already exists
    //use a composite key to enforce uniqueness
    const existingRating = await prisma.rating.findUnique({
      where: { userID_gameID: { userID, gameID: game.id } },
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
        gameID: game.id,
        score,
      },
    });

    //if the user has a review before they rated, tie this
    //rating via foreign key
    const existingReview = await prisma.review.findUnique({
      where: { userID_gameID: { userID, gameID: game.id } },
    });

    if (existingReview) {
      const updateReviewRatingID = await prisma.rating.update({
        where: { id: existingReview.id },
        data: { ratingID: newRating.id },
      });
    }

    await updateGameRatingStats(game.id);

    res.status(201).json(newRating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create rating." });
  }
}

async function updateRating(req, res) {
  const userID = req.user.id;
  const gameSlug = req.params.gameSlug;
  const { score } = req.body;

  try {
    const game = await prisma.game.findUnique({ where: { slug: gameSlug } });

    //find existing rating
    const existingRating = await prisma.rating.findUnique({
      where: { userID_gameID: { userID, gameID: game.id } },
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

    await updateGameRatingStats(game.id);

    res.status(200).json(updatedRating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update rating." });
  }
}

async function createReview(req, res) {
  const userID = req.user.id;
  const gameSlug = req.params.gameSlug;
  const { title, content } = req.body;

  if (!content) {
    return res.status(404).json({ message: "Content must be filled." });
  }

  try {
    const game = await prisma.game.findUnique({ where: { slug: gameSlug } });

    const existingReview = await prisma.review.findUnique({
      where: {
        userID_gameID: { userID, gameID: game.id },
      },
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this game." });
    }

    const ratingCheck = await prisma.rating.findUnique({
      where: { userID_gameID: { userID, gameID: game.id } },
    });

    //new review check
    const newReview = await prisma.review.create({
      data: {
        userID,
        gameID: game.id,
        ratingID: ratingCheck.id || null,
        title,
        content,
      },
      include: {
        rating: true, //related rating data for state
      },
    });

    await updateGameReviewCount(game.id);

    res.status(201).json(newReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create review." });
  }
}

async function updateReview(req, res) {
  const userID = req.user.id;
  const gameSlug = req.params.gameSlug;
  const { title, content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content are required." });
  }

  try {
    const game = await prisma.game.findUnique({ where: { slug: gameSlug } });

    const updatedReview = await prisma.review.update({
      where: { userID_gameID: { userID, gameID: game.id } },
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
  const gameSlug = req.params.gameSlug;

  try {
    const game = await prisma.game.findUnique({ where: { slug: gameSlug } });

    //find the user's existing rating for the game
    const userRating = await prisma.rating.findUnique({
      where: { userID_gameID: { userID, gameID: game.id } },
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
  const gameSlug = req.params.gameSlug;

  try {
    const game = await prisma.game.findUnique({ where: { slug: gameSlug } });

    //find the user's review for the specified game
    const userReview = await prisma.review.findUnique({
      where: {
        userID_gameID: { userID, gameID: game.id },
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
  const gameSlug = req.params.gameSlug;

  try {
    const game = await prisma.game.findUnique({ where: { slug: gameSlug } });

    //check if the review exists
    const existingReview = await prisma.review.findUnique({
      where: {
        userID_gameID: { userID, gameID: game.id },
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

    await updateGameReviewCount(game.id);

    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete the review." });
  }
}

async function getGenreTags(req, res) {
  try {
    const gameSlug = req.params.gameSlug;

    if (!gameSlug) {
      return res.status(400).json({ error: "Invalid or missing game ID" });
    }

    //parallel queries test, supposedly runs faster
    const [game, genres] = await Promise.all([
      prisma.game.findUnique({
        where: { slug: gameSlug },
        select: {
          title: true,
          coverImage: true,
          developer: true,
          genres: {
            select: {
              genre: {
                select: {
                  genreName: true,
                  slug: true,
                },
              },
              upvoteCount: true,
              downvoteCount: true,
              totalVotes: true,
            },
          },
        },
      }),
      prisma.genre.findMany({
        select: {
          genreName: true,
          slug: true,
        },
      }),
    ]);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    if (game) {
      game.genres.sort((a, b) => b.upvoteCount - a.upvoteCount); // Sorting by upvotes
    }

    res.status(200).json({ game, genres });
  } catch (error) {
    console.error("Error fetching genre voting:", error.message); // Log the error
    res.status(500).json({ error: "Internal server error" }); // Handle server error
  }
}

async function postGenreTag(req, res) {
  const gameSlug = req.params.gameSlug;
  const genreName = req.body;
  const userID = req.user.id;

  try {
    const game = await prisma.game.findUnique({ where: { slug: gameSlug } });

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
        gameID_genreID: { gameID: game.id, genreID },
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
        gameID: game.id,
        genreID,
        upvoteCount: 1, //count this user's suggestion as an upvote
        totalVotes: 1,
      },
    });

    //user's vote for this genre suggestion tallied on their personal sheet
    await prisma.genreVote.create({
      data: {
        userID,
        gameID: game.id,
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
  const gameSlug = req.params.gameSlug;
  const { genreName, voteValue } = req.body; // true (upvote) or false (downvote)
  const userID = req.user.id;

  try {
    const game = await prisma.game.findUnique({ where: { slug: gameSlug } });

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
          gameID: game.id,
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
            gameID: game.id,
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
            gameID: game.id,
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
          gameID: game.id,
          genreID,
          voteValue,
        },
      });

      //adjust user vote in personal data
      await prisma.gameGenre.update({
        where: {
          gameID_genreID: {
            gameID: game.id,
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
  getAllParentGenres,
  getGenreGames,
  postRating,
  updateRating,
  createReview,
  updateReview,
  getUserRating,
  getUserReview,
  deleteReview,
  getGenreTags,
  postGenreTag,
  handleGenreVote,
};
