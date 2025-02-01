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

  console.log({ topGames });
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
              <p>Ratings: {game.ratingCount}</p>
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

// we will need to double check the math for the backend on this with a large dataset
// i'm seeing some delta btwn the avgRating and the weightedAverage in the
//topGames object, unconfirmed whether this is the result of a small dataset or this is
//a fundamental issue with the calculations and tracking i built on the backend
//determine later

//we will need to add data in via the website to diagnose because
//i think the way i built the backend requires it to run thru the controller
//and hit all the other funcs
//we can obvs build a seeding script that does the same for an enmasse data trial
//but 10-15 data points manually added should be good and we can
// do hand calc for comparison
//seeing some other issues such as rating count and review count not tallying
//with our current seed- must be related to bypassing controller logic
