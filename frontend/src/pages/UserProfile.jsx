import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../authContext"; //custom hook

export default function UserProfile({ backend }) {
  const { username } = useParams();
  const [userData, setUserData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the backend API
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // Or use context to get token if needed
        const response = await axios.get(`${backend}user/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data); // Set the fetched games to state
      } catch (error) {
        setError("Error fetching user profile."); // Handle errors
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile(); // Call the function on mount
  }, [backend, username]); // Re-run when the backend changes

  if (error) {
    return <div>{error}</div>; // If there's an error, display the error message
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>{userData.username}</h1>
        <p>{userData.email}</p>
      </div>

      <div className="profile-picture">
        {userData.profile_picture ? (
          <img
            src={userData.profile_picture}
            alt={`${userData.username}'s profile picture`}
          />
        ) : (
          <div className="default-avatar">No Image</div>
        )}
      </div>

      <div className="profile-bio">
        <h3>Bio:</h3>
        <p>{userData.bio || "This user hasn't written a bio yet."}</p>
      </div>

      <div className="profile-stats">
        <div className="followers">
          <h3>Followers:</h3>
          {userData.followers && userData.followers.length > 0 ? (
            <ul>
              {userData.followers.map((follower) => (
                <li key={follower.id}>
                  <img
                    src={follower.follower.profile_picture}
                    alt={follower.follower.username}
                    className="follower-avatar"
                  />
                  <Link to={`/user/${follower.follower.username}`}>
                    {follower.follower.username}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No followers yet.</p>
          )}
        </div>

        <div className="following">
          <h3>Following:</h3>
          {userData.following && userData.following.length > 0 ? (
            <ul>
              {userData.following.map((followed) => (
                <li key={followed.id}>
                  <img
                    src={followed.followed.profile_picture}
                    alt={followed.followed.username}
                    className="following-avatar"
                  />
                  <Link to={`/user/${followed.followed.username}`}>
                    {followed.followed.username}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>Not following anyone yet.</p>
          )}
        </div>
      </div>

      <div className="profile-created">
        <h3>Account Created:</h3>
        <p>{new Date(userData.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="profile-role">
        <h3>Role:</h3>
        <p>{userData.role || "User"}</p>
      </div>
    </div>
  );
}
