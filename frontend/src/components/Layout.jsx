import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext"; //custom hook

export default function Layout({ children }) {
  //context access
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    logout(); //logout from context
    navigate("/"); //back to the homepage
  };

  return (
    <div className="appContainer">
      <div className="appHeaderContainer">
        <header className="appHeader">
          <Link to={"/"}>
            <h2>OverClocked(SOME LOGO)</h2>
          </Link>
          <Link to={"/charts"}>
            <h2>Top Games</h2>
          </Link>
          <Link to={"/games/genres"}>
            <h2>Genres</h2>
          </Link>

          <div className="headerButtons">
            {user ? ( // Conditionally render based on user's auth status
              <>
                <Link to={`/user/${user.username}`}>
                  Welcome, {user.username}
                </Link>
                <button onClick={handleLogoutClick}>Logout</button>
              </>
            ) : (
              <Link to={"/auth"}>Login or Create an Account</Link>
            )}
          </div>
        </header>
      </div>
      <main className="appMain">{children}</main>
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
