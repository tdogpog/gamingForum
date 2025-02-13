import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { useAuth } from "../authContext"; //custom hook

export default function Game({ backend }) {
  const { user } = useAuth();
  const { gameSlug } = useParams();
  const [game, setGame] = useState(null);
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
        const response = await axios.get(`${backend}games/${gameSlug}`);
        setGame(response.data);
        if (user) {
          const ratingResponse = await axios.get(
            `${backend}games/${gameSlug}/rating`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
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

  if (!game) {
    return <p>Game not found</p>;
  }

  return (
    <div>
      <h1>{game.title}</h1>
      <img src={game.coverImage} alt={`${game.title} boxart`} />
      <p>Developer: {game.developer}</p>
      {new Date(game.releaseDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}{" "}
      <div>
        <h3>Genres</h3>
        <ul>
          {game.genres.length > 0 ? (
            game.genres.map((genre, index) => (
              <li key={genre.id || `genre-${index}`}>
                <Link to={`/games/genres/${genre.genre.slug}`}>
                  {genre.genre?.genreName || "Unknown Genre(error)"}
                </Link>
              </li>
            ))
          ) : (
            <p>No genres available yet... be the first to add one!</p>
          )}
          <Link to={`/games/genres/genretag`}>Vote on Relevant Genres</Link>
        </ul>
      </div>
    </div>
  );
}

Game.propTypes = {
  backend: PropTypes.string.isRequired,
};
