import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { useAuth } from "../authContext"; //custom hook
import Rating from "../components/Rating";
import ReviewForm from "../components/ReviewForm";
import "../styles/game.css";

export default function Game({ backend }) {
  const { user } = useAuth();
  const { gameSlug } = useParams();
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState(null);
  const [userReview, setUserReview] = useState(null);

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
    const token = localStorage.getItem("token");
    try {
      if (userRating === null) {
        await axios.post(
          `${backend}games/${gameSlug}/rating`,
          { score },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserRating(score);
      } else {
        await axios.put(
          `${backend}games/${gameSlug}/rating`,
          { score },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserRating(score);
      }
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert("Failed to submit rating.");
    }
  };

  const handleReviewSubmit = async (title, content) => {
    const token = localStorage.getItem("token");
    setError(null);

    try {
      if (!userReview) {
        // Create new review
        await axios.post(
          `${backend}games/${gameSlug}/reviews`,
          { title, content, userID: user.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setGame((prev) => ({
          ...prev,
          reviews: [...prev.reviews, { title, content, user }],
        }));
      } else {
        // Update existing review
        await axios.put(
          `${backend}games/${gameSlug}/reviews/${userReview.id}`,
          { title, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setUserReview({ title, content, user });
    } catch (err) {
      setError(err.message);
      console.error("Error submitting review:", err);
    }
  };

  const handleDeleteReview = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `${backend}games/${gameSlug}/reviews/${userReview.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserReview(null); // Remove review from state
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Failed to delete review.");
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
      <div>
        <ReviewForm
          userReview={userReview}
          setUserReview={setUserReview}
          handleDeleteReview={handleDeleteReview}
          onSubmitReview={handleReviewSubmit}
        />
      </div>
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
        </p>
      )}
    </div>
  );
}

Game.propTypes = {
  backend: PropTypes.string.isRequired,
};
