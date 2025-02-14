import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { useAuth } from "../authContext"; //custom hook

export default function Game({ backend }) {
  const { user } = useAuth();
  const { gameSlug } = useParams();
  const [gameDetails, setgameDetails] = useState(null);
  const [descriptors, setDescriptors] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    //protection against undefined error
    if (!user) {
      return;
    }
    const fetchGame = async () => {
      try {
        const token = localStorage.getItem("token");

        const genreVotingReponse = await axios.get(
          `${backend}games/${gameSlug}/genrevote`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setgameDetails({
          title: genreVotingReponse.data.game.title || "",
          coverImage: genreVotingReponse.data.game.coverImage || "",
          createdAt: genreVotingReponse.data.game.developer || "",
          genres: genreVotingReponse.data.game.genres.map((g) => ({
            genreName: g.genreName,
            slug: g.genre.slug,
            upvoteCount: g.upvoteCount,
            downvoteCount: g.downvoteCount,
            totalVotes: g.totalVotes,
          })),
        });

        //grab only theme and descriptor and their children
        setDescriptors(
          //reduce since we're flattening the structure, not 1:1 like map
          genreVotingReponse.data.genres.reduce((acc, g) => {
            // Add the parent genre
            if (g.genreName !== "Themes" && g.genreName !== "Descriptors") {
              return acc;
            }

            acc.push({ genreName: g.genreName, slug: g.slug });

            // Add all subgenres, if any
            if (g.subgenres.length > 0) {
              g.subgenres.forEach((sub) => {
                acc.push({ genreName: sub.genreName, slug: sub.slug });
              });
            }

            return acc;
          }, [])
        );
      } catch (error) {
        setError("Error fetching genre voting data.");
        console.error("Error fetching genre voting data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGame();
  }, [backend, gameSlug, user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!gameDetails) {
    return <p>Game not found</p>;
  }

  return (
    <div>
      <h1>{gameDetails.title}</h1>
      <img src={gameDetails.coverImage} alt={`${gameDetails.title} boxart`} />
      <p>Developer: {gameDetails.developer}</p>
      <div>
        <h3>Genres</h3>
        <ul>
          {gameDetails.genres.length > 0 ? (
            gameDetails.genres.map((genre, index) => (
              <li key={genre.slug || `genre-${index}`}>
                <Link to={`/games/genres/${genre.slug}`}>
                  {genre.genreName || "Unknown Genre(error)"}
                </Link>
              </li>
            ))
          ) : (
            <p>No genres available yet... be the first to add one!</p>
          )}
        </ul>
      </div>

      <div>
        <h2>Secondary Descriptors</h2>
        <p>
          This category for voting represents characteristics that can apply to
          many different games across genres. Themes, and descriptors belong
          here!
        </p>
      </div>
    </div>
  );
}

Game.propTypes = {
  backend: PropTypes.string.isRequired,
};
