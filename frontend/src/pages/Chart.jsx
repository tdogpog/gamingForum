import { useState, useEffect } from "react";
import PropTypes from "prop-types";

import axios from "axios";

export default function Chart({ backend }) {
  console.log("Rendering Chart");

  const [topGames, setTopGames] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the backend API
    const fetchTopGames = async () => {
      try {
        const response = await axios.get(`${backend}charts`);
        setTopGames(response.data); // Set the fetched games to state
      } catch (error) {
        setError("Error fetching top games."); // Handle errors
        console.error("Error fetching top games:", error);
      }
    };

    fetchTopGames(); // Call the function on mount
  }, [backend]); // Re-run when the backend changes

  if (error) {
    return <div>{error}</div>; // If there's an error, display the error message
  }

  return (
    <div className="chart-container">
      <h1>Top 25 Games</h1>
      {topGames.length === 0 ? (
        <p>Loading...</p> // Show loading text while data is being fetched
      ) : (
        <ul>
          {topGames.map((game) => (
            <li key={game.id}>
              <img src={game.coverImage} alt={game.title} />
              <h2>{game.title}</h2>
              <p>{game.developer}</p>
              <p>Rating: {game.weightedAverage}</p>
              <p>Reviews: {game.reviewCount}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

Chart.propTypes = {
  backend: PropTypes.string.isRequired,
};
