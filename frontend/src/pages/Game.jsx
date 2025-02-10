import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { useAuth } from "../authContext"; //custom hook
import Rating from "../components/Rating";

export default function Game({ backend }) {
  const { user } = useAuth();
  const { gameSlug } = useParams();
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState(null);

  useEffect(() => {
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
          setUserRating(ratingResponse.data?.score || null);
        }
      } catch (error) {
        setError("Error fetching game data.");
        console.error("Error fetching game data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGame();
  }, [backend, gameSlug, user]);

  const handleRatingSubmit = async (score) => {
    try {
      await axios.post(
        `${backend}games/${gameSlug}/rating`,
        { score },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setUserRating(score);
      alert("Rating submitted!");
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert("Failed to submit rating.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!game) {
    return <p>Game not found</p>;
  }
  console.log(game.genres);

  return (
    <div>
      <h1>{game.title}</h1>
      <img src={game.coverImage} alt={`${game.title} boxart`} />
      <p>Developer: {game.developer}</p>
      <p>Release Date: {new Date(game.releaseDate).toDateString()}</p>
      <h2>Average Rating: {game.avgRating || "N/A"}/5.0</h2>
      <div>
        {user ? (
          <div>
            <Rating
              userRating={userRating}
              onSubmitRating={(newValue) => handleRatingSubmit(newValue)}
            />
          </div>
        ) : (
          <p>Log in to rate this game.</p>
        )}
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
        </ul>
      </div>

      <h3>Reviews:</h3>
      {game.reviews.length > 0 ? (
        game.reviews.map((review, index) => (
          <div key={index}>
            <h4>{review.title}</h4>
            <p>By: {review.user?.username || "Anonymous"}</p>
            <p>Rating: {review.rating?.score || "N/A"}</p>
            <p>{review.content}</p>
          </div>
        ))
      ) : (
        <p>
          No reviews yet... share your thoughts! We would love to hear them.
          Leave a rating and create a review.
        </p>
      )}
    </div>
  );
}

Game.propTypes = {
  backend: PropTypes.string.isRequired,
};
