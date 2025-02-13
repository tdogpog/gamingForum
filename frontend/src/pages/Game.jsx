import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { useAuth } from "../authContext"; //custom hook
import Rating from "../components/Rating";
import ReviewForm from "../components/ReviewForm";
import "../styles/game.css";
import { Rating as MuiRating } from "@mui/material";

export default function Game({ backend }) {
  const { user } = useAuth();
  const { gameSlug } = useParams();
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState(null);
  const [userReview, setUserReview] = useState(null);

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

          const reviewResponse = await axios.get(
            `${backend}games/${gameSlug}/review`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setUserRating(ratingResponse.data?.score || null);
          if (reviewResponse.data) {
            setUserReview({
              title: reviewResponse.data.title || "",
              content: reviewResponse.data.content || "",
              createdAt: new Date(
                reviewResponse.data.createdAt
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
              rating: {
                score: ratingResponse.data?.score || null,
              },
              user: {
                username: user.username,
              },
            });
          }
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
      let newReview;
      if (userReview.content === "") {
        // Create new review
        const response = await axios.post(
          `${backend}games/${gameSlug}/review`,
          { title, content, userID: user.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        newReview = response.data; // Get full review data from backend response
        setGame((prev) => ({
          ...prev,
          reviews: [
            ...prev.reviews,
            {
              title,
              content,
              user: {
                username: user.username,
              },
              createdAt: new Date(newReview.createdAt).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }
              ),
              rating: { score: userRating },
            },
          ],
        }));
      } else {
        // Update existing review
        const response = await axios.put(
          `${backend}games/${gameSlug}/review`,
          { title, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        newReview = response.data; // Get full review data from backend response
        setGame((prev) => ({
          ...prev,
          reviews: prev.reviews.map((review) =>
            review.user.username === user.username
              ? {
                  ...review,
                  title,
                  content,
                  createdAt: new Date(newReview.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  ),
                }
              : review
          ),
        }));
      }

      setUserReview({
        title,
        content,
        createdAt: new Date(newReview.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        rating: { score: userRating },
        user: {
          username: user.username,
        },
      });
    } catch (err) {
      setError(err.message);
      console.error("Error submitting review:", err);
    }
  };

  const handleDeleteReview = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${backend}games/${gameSlug}/review`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGame((prev) => ({
        ...prev,
        reviews: prev.reviews.filter(
          (review) => review.user.username !== user.username
        ),
      }));
      //reset the obj structure
      setUserReview({
        title: "",
        content: "",
        createdAt: null,
        rating: {
          score: userRating, // Keep the user's rating if they have one
        },
        user: {
          username: user.username,
        },
      });
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

  console.log("userreview main", userReview);

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
          user={user}
          userReview={userReview}
          setUserReview={setUserReview}
          handleDeleteReview={handleDeleteReview}
          onSubmitReview={handleReviewSubmit}
        />
      </div>
      {game.reviews.length > 0 ? (
        game.reviews.map((review, index) => (
          <div key={index}>
            <div className="reviewHeader">
              <p>{review.user.username || "error"}</p>
              <p>
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>{" "}
              <MuiRating
                name="user-rating"
                value={review.rating?.score || "Unrated"}
                precision={0.5}
                readOnly
              />
            </div>
            <div className="reviewContent">
              <h4>{review.title}</h4>
              <p>{review.content}</p>
            </div>
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
