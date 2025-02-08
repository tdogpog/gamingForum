import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";

export default function Genres({ backend }) {
  const { genreSlug } = useParams();
  const [genre, setGenre] = useState(null);
  const [genreGames, setGenreGames] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch genre and its games based on genreSlug
    const fetchGenreGames = async () => {
      try {
        console.log("Requesting URL:", `${backend}games/genres/${genreSlug}`);
        const response = await axios.get(`${backend}games/genres/${genreSlug}`);
        console.log(response);
        setGenre(response.data.genre); // Set genre data
        setGenreGames(response.data.genreGames); // Set related games
      } catch (error) {
        setError("Error fetching genre games.");
        console.error("Error fetching genre games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenreGames(); // Call the function on mount
  }, [backend, genreSlug]); // Re-run when the backend changes

  if (isLoading) {
    return <div>Loading...</div>; // Loading state
  }

  if (error) {
    return <div>{error}</div>; // Display any errors
  }

  return (
    <div className="chart-container">
      {genre ? (
        <>
          <h1>{genre.genreName}</h1>

          {/* Display the first two subgenres */}
          {genre.subgenres.length > 0 && (
            <div>
              <ul>
                {genre.subgenres.map((sub) => (
                  <li key={sub.id}>
                    <Link to={`/games/${sub.slug}`}>{sub.genreName}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h5>Games in this Genre:</h5>
          {genreGames.length > 0 ? (
            <ul>
              {genreGames.map((game) => (
                <li key={game.id}>
                  <Link to={`/games/${game.slug}`}>
                    <h4>{game.title}</h4>
                  </Link>
                  <p>
                    Release Date: {new Date(game.releaseDate).getFullYear()}
                  </p>
                  <p>Average Rating: {game.avgRating || "Not rated yet"}</p>
                  <p>Reviews: {game.reviewCount || 0}</p>
                  <p>Ratings: {game.ratingCount || 0}</p>
                  {game.genres.length > 0 && (
                    <div>
                      <ul>
                        {game.genres.slice(0, 2).map((gameGenre) => (
                          <li key={gameGenre.genre.id}>
                            {gameGenre.genre.genreName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No games available for this genre.</p>
          )}
        </>
      ) : (
        <div>Genre not found</div>
      )}
    </div>
  );
}

Genres.propTypes = {
  backend: PropTypes.string.isRequired,
};
