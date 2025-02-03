import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { useAuth } from "../authContext"; //custom hook

export default function UserProfile({ backend }) {
  const { user } = useAuth();
  const { username } = useParams();
  const [userData, setUserData] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    //NEW ADDITIONS
    //was running into a race conditions bug
    //because we were still waiting on the context
    // to decode the jwt and give us access
    //causing a crash on refresh and manual url visit
    if (!user) {
      return;
    }

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

        //parse through the followers array of a user we're visiting and check if
        //the logged in user is found in their follower list
        //some is a method in js that checks if at least one element meets the condition
        //if it does, returns true
        //this will help us determine in conditional rendering
        //whether we need to follow or unfollow
        //and how to comm with the api
        setIsFollowing(
          response.data.followers.some(
            (follower) => follower.username == user.username
          )
        );
      } catch (error) {
        setError("Error fetching user profile."); // Handle errors
        console.error("Error fetching user profile:", error);
      } finally {
        //race conditions
        setIsLoading(false);
      }
    };

    fetchUserProfile(); // Call the function on mount
  }, [backend, username, user]); // Re-run when the backend or username changes

  const handleFollow = async () => {
    if (!user) return; // Guard clause for safety
    try {
      const token = localStorage.getItem("token");
      if (isFollowing) {
        await axios.delete(`${backend}user/${username}/follow`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsFollowing(false);
      } else {
        //call API to follow
        await axios.post(
          `${backend}user/${username}/follow`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsFollowing(true);
      }
    } catch (error) {
      setError("Error updating follow status.");
      console.error("Error following/unfollowing:", error);
    }
  };

  //race conditions
  if (!user || isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>; // If there's an error, display the error message
  }

  //race conditions
  if (!userData) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>{userData.username}</h2>
        <p>{userData.email}</p>
        {user?.username === userData.username && (
          <Link to="/user/settings" state={{ userData }}>
            <button>Edit Profile</button>
          </Link>
        )}
        {user.username !== userData.username && (
          <button onClick={handleFollow}>
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      <div className="profile-picture">
        {userData.profile_picture ? (
          <img
            src={userData.profile_picture}
            alt={`${userData.username}'s profile picture`}
          />
        ) : (
          <div className="default-avatar">No Profile Picture</div>
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
                <li key={follower.username}>
                  <img
                    src={follower.profile_picture}
                    alt={follower.username}
                    className="follower-avatar"
                  />
                  <Link to={`/user/${follower.username}`}>
                    {follower.username}
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
                <li key={followed.username}>
                  <img
                    src={followed.profile_picture}
                    alt={followed.username}
                    className="following-avatar"
                  />
                  <Link to={`/user/${followed.username}`}>
                    {followed.username}
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

UserProfile.propTypes = {
  backend: PropTypes.string.isRequired,
};
