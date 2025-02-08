import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";

export default function Genres({ backend }) {
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch data from the backend API
    const fetchGenres = async () => {
      try {
        console.log("Requesting URL:", `${backend}games/genres`);
        const response = await axios.get(`${backend}games/genres`);
        console.log(response);
        setGenres(response.data); // Set the fetched games to state
      } catch (error) {
        setError("Error fetching genres."); // Handle errors
        console.error("Error fetching genres:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenres(); // Call the function on mount
  }, [backend]); // Re-run when the backend changes

  if (!genres || isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>; // If there's an error, display the error message
  }

  return (
    <div className="chart-container">
      <h1>Explore by Genre</h1>
      <ul>
        {genres.map((genre) => (
          <li key={genre.id}>
            <Link to={`/games/genres/${genre.slug}`}>
              <h2>{genre.genreName}</h2>
            </Link>
            <p>{genre._count?.subgenres || ""}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

Genres.propTypes = {
  backend: PropTypes.string.isRequired,
};
